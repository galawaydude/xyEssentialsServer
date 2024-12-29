const asyncHandler = require('express-async-handler');
const Blog = require('../models/blog.model');

// Create a new blog post
const createBlog = asyncHandler(async (req, res) => {
  try {
    // Debugging: Log the request body and uploaded file
    console.log('Request Body:', req.body);
    console.log('Uploaded File:', req.file);

    // Use the spread operator to access properties from req.body
    const blogPost = new Blog({
      ...req.body, // Spread operator to include all properties
      img: req.file.path, // Access the image path from req.file
      tags: req.body.tags.split(',').map(tag => tag.trim()), // Process tags if they're provided
    });

    const createdBlogPost = await blogPost.save();
    res.status(201).json(createdBlogPost);
  } catch (error) {
    // Debugging: Log any errors that occur
    console.error('Error creating blog post:', error);
    res.status(500).json({ message: 'Failed to create blog post' });
  }
});


// Get all blog posts
const getAllBlogs = asyncHandler(async (req, res) => {
  const blogPosts = await Blog.find({});
  res.status(200).json(blogPosts);
});

// Get a blog post by ID
const getBlogById = asyncHandler(async (req, res) => {
  const blogPost = await Blog.findById(req.params.id);

  if (blogPost) {
    res.json(blogPost);
  } else {
    res.status(404);
    throw new Error('Blog post not found');
  }
});

// Update a blog post (Admin or Author only)
const updateBlog = asyncHandler(async (req, res) => {
  try {
    // Debugging: Log incoming request data
    console.log('Updating blog post with ID:', req.params.id);
    console.log('Request Body:', req.body);
    console.log('Uploaded File:', req.file);

    // Find the blog post by ID
    const blogPost = await Blog.findById(req.params.id);

    if (blogPost) {
      // Use spread operator to update the blog post fields
      const updatedData = {
        ...blogPost.toObject(), // Get current data
        ...req.body, // Spread incoming data to override any fields
        img: req.file.path,
        tags: req.body.tags.split(',').map(tag => tag.trim()),
      };

      // Handle image if uploaded
      if (req.file) {
        updatedData.img = req.file.path; // Set the new image path
      }

      // Update the blog post
      Object.assign(blogPost, updatedData);
      const updatedBlogPost = await blogPost.save();

      // Debugging: Log successful update
      console.log('Blog post updated successfully:', updatedBlogPost);
      res.json(updatedBlogPost);
    } else {
      res.status(404);
      throw new Error('Blog post not found');
    }
  } catch (error) {
    // Debugging: Log any errors that occur
    console.error('Error updating blog post:', error);
    res.status(500).json({ message: error.message });
  }
});

// Delete a blog post (Admin or Author only)
const deleteBlog = asyncHandler(async (req, res) => {
  const blogPost = await Blog.findById(req.params.id);

  if (blogPost) {
    if (blogPost.author.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      res.status(401);
      throw new Error('Not authorized to delete this blog post');
    }

    await blogPost.deleteOne();
    res.json({ message: 'Blog post removed' });
  } else {
    res.status(404);
    throw new Error('Blog post not found');
  }
});

module.exports = {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
};
