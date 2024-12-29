const express = require('express');
const {getAllBlogs, getBlogById, createBlog, updateBlog, deleteBlog} = require('../controllers/blog.controller.js');
const {protect, admin} = require('../middlewares/auth.middleware.js');
const { upload } = require('../middlewares/multer.middleware.js');

const router = express.Router();

router.get('/', getAllBlogs);
router.get('/:id', getBlogById);
router.post('/', protect, admin, upload.single('img'), createBlog);
router.put('/:id', protect, admin, upload.single('img'), updateBlog);
router.delete('/:id', protect, admin, deleteBlog);

module.exports = router;