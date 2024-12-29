const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinaryConfig.js'); // Adjust path as necessary

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'clubs', // Specify the folder in Cloudinary
        allowed_formats: ['jpg', 'png', 'jpeg', 'heic'], 
    },
});

// Create the Multer instance
exports.upload = multer({ storage: storage });

