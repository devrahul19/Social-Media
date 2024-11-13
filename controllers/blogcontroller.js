// blogController.js
const fs = require('fs');
const path = require('path');

const blogsFilePath = path.join(__dirname, '../blogs.json');
let blogs = JSON.parse(fs.readFileSync(blogsFilePath, 'utf-8') || '[]');

// Helper function to save blogs data to blogs.json
const saveBlogsData = () => fs.writeFileSync(blogsFilePath, JSON.stringify(blogs, null, 2), 'utf-8');

// Create a new blog post
exports.createBlog = (req, res) => {
    const { title, content } = req.body;
    if (!title || !content) return res.status(400).send('Title and content are required');

    const newBlog = {
        id: blogs.length + 1,
        title,
        content,
        authorId: req.user.id,
        createdAt: new Date().toISOString(),
        comments: []
    };
    blogs.push(newBlog);
    saveBlogsData();

    return res.status(201).json(newBlog);
};

// Get all blog posts
exports.getAllBlogs = (req, res) => {
    res.json(blogs);
};

// Get a single blog post by ID
exports.getBlogById = (req, res) => {
    const blogId = parseInt(req.params.id, 10);
    const blog = blogs.find(b => b.id === blogId);

    if (!blog) return res.status(404).send('Blog not found');
    res.json(blog);
};

// Update a blog post by ID
exports.updateBlog = (req, res) => {
    const blogId = parseInt(req.params.id, 10);
    const { title, content } = req.body;
    const blog = blogs.find(b => b.id === blogId);

    if (!blog) return res.status(404).send('Blog not found');
    if (blog.authorId !== req.user.id) return res.status(403).send('Not authorized to update this blog');

    blog.title = title || blog.title;
    blog.content = content || blog.content;
    saveBlogsData();

    return res.status(200).json(blog);
};

// Delete a blog post by ID
exports.deleteBlog = (req, res) => {
    const blogId = parseInt(req.params.id, 10);
    const blogIndex = blogs.findIndex(b => b.id === blogId);

    if (blogIndex === -1) return res.status(404).send('Blog not found');
    if (blogs[blogIndex].authorId !== req.user.id) return res.status(403).send('Not authorized to delete this blog');

    blogs.splice(blogIndex, 1);
    saveBlogsData();

    return res.status(200).send('Blog deleted successfully');
};
