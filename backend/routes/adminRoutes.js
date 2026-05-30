const express = require('express');
const router = express.Router();
const admin = require('../middleware/adminMiddleware');
const User = require('../models/User');
const Book = require('../models/Book');
const Request = require('../models/Request');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

// ============================================================
// DASHBOARD STATS
// ============================================================

// @route   GET /api/admin/stats
// @desc    Get platform-wide statistics for admin dashboard
router.get('/stats', admin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalBooks = await Book.countDocuments();
    const availableBooks = await Book.countDocuments({ status: 'available' });
    const exchangedBooks = await Book.countDocuments({ status: 'exchanged' });
    const totalRequests = await Request.countDocuments();
    const pendingRequests = await Request.countDocuments({ status: 'pending' });
    const acceptedRequests = await Request.countDocuments({ status: 'accepted' });
    const rejectedRequests = await Request.countDocuments({ status: 'rejected' });

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const newUsersThisWeek = await User.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
    const newBooksThisWeek = await Book.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
    const newRequestsThisWeek = await Request.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

    // Books by condition
    const booksByCondition = await Book.aggregate([
      { $group: { _id: '$condition', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Books by type (sell vs lend)
    const booksByType = await Book.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    // Top cities by books
    const topCities = await Book.aggregate([
      { $group: { _id: '$city', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      totalUsers,
      totalBooks,
      availableBooks,
      exchangedBooks,
      totalRequests,
      pendingRequests,
      acceptedRequests,
      rejectedRequests,
      newUsersThisWeek,
      newBooksThisWeek,
      newRequestsThisWeek,
      booksByCondition,
      booksByType,
      topCities,
    });
  } catch (err) {
    console.error('Admin stats error:', err.message);
    res.status(500).send('Server Error');
  }
});

// ============================================================
// USER MANAGEMENT
// ============================================================

// @route   GET /api/admin/users
// @desc    Get all users with search/filter
router.get('/users', admin, async (req, res) => {
  try {
    const { search, role, sort } = req.query;
    let filter = {};

    if (search) {
      filter.$or = [
        { username: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { city: new RegExp(search, 'i') },
      ];
    }
    if (role && role !== 'all') filter.role = role;

    let sortOrder = { createdAt: -1 };
    if (sort === 'oldest') sortOrder = { createdAt: 1 };
    if (sort === 'username') sortOrder = { username: 1 };

    const users = await User.find(filter)
      .select('-password')
      .sort(sortOrder);

    // Attach book count and request count for each user
    const usersWithCounts = await Promise.all(
      users.map(async (user) => {
        const bookCount = await Book.countDocuments({ userId: user._id });
        const requestCount = await Request.countDocuments({
          $or: [{ requesterId: user._id }, { ownerId: user._id }],
        });
        return {
          ...user.toJSON(),
          bookCount,
          requestCount,
        };
      })
    );

    res.json(usersWithCounts);
  } catch (err) {
    console.error('Admin get users error:', err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/admin/users/:id/role
// @desc    Update user role (promote/demote)
router.put('/users/:id/role', admin, async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    // Prevent self-demotion
    if (req.params.id === req.userId && role !== 'admin') {
      return res.status(400).json({ message: 'Cannot demote yourself' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('Admin update role error:', err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete a user and all their associated data
router.delete('/users/:id', admin, async (req, res) => {
  try {
    // Prevent self-deletion
    if (req.params.id === req.userId) {
      return res.status(400).json({ message: 'Cannot delete yourself' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Delete user's books
    await Book.deleteMany({ userId: req.params.id });

    // Delete requests involving this user
    await Request.deleteMany({
      $or: [{ requesterId: req.params.id }, { ownerId: req.params.id }],
    });

    // Delete user
    await User.findByIdAndDelete(req.params.id);

    res.json({ message: 'User and associated data deleted successfully' });
  } catch (err) {
    console.error('Admin delete user error:', err.message);
    res.status(500).send('Server Error');
  }
});

// ============================================================
// BOOK MANAGEMENT
// ============================================================

// @route   GET /api/admin/books
// @desc    Get all books with search/filter
router.get('/books', admin, async (req, res) => {
  try {
    const { search, status, type, condition, sort } = req.query;
    let filter = {};

    if (search) {
      filter.$or = [
        { title: new RegExp(search, 'i') },
        { author: new RegExp(search, 'i') },
      ];
    }
    if (status && status !== 'all') filter.status = status;
    if (type && type !== 'all') filter.type = type;
    if (condition && condition !== 'all') filter.condition = condition;

    let sortOrder = { _id: -1 };
    if (sort === 'oldest') sortOrder = { _id: 1 };
    if (sort === 'title') sortOrder = { title: 1 };
    if (sort === 'price-high') sortOrder = { price: -1 };
    if (sort === 'price-low') sortOrder = { price: 1 };

    const books = await Book.find(filter)
      .populate('userId', 'username email')
      .sort(sortOrder);

    res.json(books);
  } catch (err) {
    console.error('Admin get books error:', err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/admin/books/:id
// @desc    Admin delete any book
router.delete('/books/:id', admin, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });

    // Also delete any requests for this book
    await Request.deleteMany({ bookId: req.params.id });

    await Book.findByIdAndDelete(req.params.id);
    res.json({ message: 'Book and related requests deleted successfully' });
  } catch (err) {
    console.error('Admin delete book error:', err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/admin/books/:id/status
// @desc    Toggle book status (available/exchanged)
router.put('/books/:id/status', admin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['available', 'exchanged'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const book = await Book.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('userId', 'username email');

    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.json(book);
  } catch (err) {
    console.error('Admin update book status error:', err.message);
    res.status(500).send('Server Error');
  }
});

// ============================================================
// REQUEST MANAGEMENT
// ============================================================

// @route   GET /api/admin/requests
// @desc    Get all exchange requests
router.get('/requests', admin, async (req, res) => {
  try {
    const { status, sort } = req.query;
    let filter = {};

    if (status && status !== 'all') filter.status = status;

    let sortOrder = { createdAt: -1 };
    if (sort === 'oldest') sortOrder = { createdAt: 1 };

    const requests = await Request.find(filter)
      .populate('bookId', 'title author imageUrl')
      .populate('requesterId', 'username email')
      .populate('ownerId', 'username email')
      .sort(sortOrder);

    res.json(requests);
  } catch (err) {
    console.error('Admin get requests error:', err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/admin/requests/:id
// @desc    Admin delete any request
router.delete('/requests/:id', admin, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    await Request.findByIdAndDelete(req.params.id);
    res.json({ message: 'Request deleted successfully' });
  } catch (err) {
    console.error('Admin delete request error:', err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
