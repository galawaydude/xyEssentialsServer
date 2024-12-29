// cloudinaryConfig.js
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
    cloud_name: 'dxgfhjh7x',
    api_key: '951437823473183',
    api_secret: 'X9m8aspLDOF5S8tXjb9i7ix29YY',
});

// cloudinary.config({
//     cloud_name: 'dhhgecdk1',
//     api_key: '254112998571594',
//     api_secret: '1MCpODbT6QAUQIQ8lRhazKusC0g',
// });

module.exports = cloudinary;
