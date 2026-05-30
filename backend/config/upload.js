const multer = require('multer');
const path = require('path');

let storage;

if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  const cloudinary = require('cloudinary').v2;
  const { CloudinaryStorage } = require('multer-storage-cloudinary');

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });

  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'book_exchange_covers',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif']
    }
  });
  console.log('[BACKEND-INFO] Cloudinary storage configured successfully.');
} else {
  // Configure Multer to save files to the local 'uploads/' folder
  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      // Create a unique filename: timestamp-originalname
      const uniqueName = Date.now() + '-' + file.originalname.replace(/\s+/g, '_');
      cb(null, uniqueName);
    },
  });
  console.log('[BACKEND-INFO] Local disk storage configured for file uploads.');
}

// Only allow image files
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpeg, jpg, png, gif, webp) are allowed!'));
  }
};

const upload = multer({ storage, fileFilter });

module.exports = { upload };
