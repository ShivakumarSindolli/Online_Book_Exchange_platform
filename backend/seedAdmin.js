/**
 * Seed Admin User Script
 * 
 * Usage: node seedAdmin.js
 * 
 * This script will either:
 * 1. Promote an existing user (by email) to admin, OR
 * 2. Create a new admin user if one doesn't exist
 * 
 * Default admin credentials:
 *   Email: admin@bookexchange.com
 *   Password: Admin@123
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const ADMIN_EMAIL = 'admin@bookexchange.com';
const ADMIN_PASSWORD = 'Admin@123';
const ADMIN_USERNAME = 'Admin';

const db = 'mongodb://127.0.0.1:27017/bookExchangeDB';

async function seedAdmin() {
  try {
    await mongoose.connect(db);
    console.log('MongoDB Connected');

    // Check if admin already exists
    let admin = await User.findOne({ email: ADMIN_EMAIL });

    if (admin) {
      // Update existing user to admin role
      admin.role = 'admin';
      await admin.save();
      console.log(`✅ User "${admin.username}" (${ADMIN_EMAIL}) promoted to admin!`);
    } else {
      // Create new admin user
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);

      admin = new User({
        username: ADMIN_USERNAME,
        email: ADMIN_EMAIL,
        password: hashedPassword,
        phone: '9999999999',
        city: 'Admin City',
        state: 'Admin State',
        role: 'admin',
      });
      await admin.save();
      console.log(`✅ Admin user created successfully!`);
      console.log(`   Email: ${ADMIN_EMAIL}`);
      console.log(`   Password: ${ADMIN_PASSWORD}`);
    }

    console.log('\nYou can now log in with admin credentials.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

seedAdmin();
