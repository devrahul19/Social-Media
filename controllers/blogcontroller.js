const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

const blogFilePath = path.join(__dirname, '../blogs.json');
let blogs = JSON.parse(fs.readFileSync(blogFilePath, 'utf-8') || '[]');
const JWT_SECRET = "superSecretJWTKey123!";

const saveBlogData = () => fs.writeFileSync(blogFilePath, JSON.stringify(blogs, null, 2), 'utf-8');

exports.createBlog = (req, res) => {
    const { token, title, content } = req.body;

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = JSON.parse(fs.readFileSync(path.join(__dirname, '../users.json'), 'utf-8')).find(u => u.id === decoded.id);
        if (!user) return res.status(403).send('Unauthorized');

        const newBlog = {
            id: blogs.length + 1,
            title,
            content,
            authorId: user.id
        };
        blogs.push(newBlog);
        saveBlogData();
        res.status(201).send('Blog created Successsfully!! :D');
    } catch (err) {
        res.status(403).send('Invalid token');
    }
};

exports.updateBlog = (req, res) => {
    const { token, title, content } = req.body;
    const blogId = parseInt(req.params.id, 10);

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const blog = blogs.find(b => b.id === blogId);
        if (!blog) return res.status(404).send('Blog not found');

        if (blog.authorId !== decoded.id && decoded.role !== 'admin') {
            return res.status(403).send('Unauthorized to update this blog');
        }

        blog.title = title || blog.title;
        blog.content = content || blog.content;
        saveBlogData();
        res.status(200).send('Blog updated successfully');
    } catch (err) {
        res.status(403).send('Invalid token');
    }
};

exports.deleteBlog = (req, res) => {
    const { token } = req.body;
    const blogId = parseInt(req.params.id, 10);

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const blog = blogs.find(b => b.id === blogId);
        if (!blog) return res.status(404).send('Blog not found');

        if (blog.authorId !== decoded.id && decoded.role !== 'admin') {
            return res.status(403).send('Unauthorized to delete this blog');
        }

        blogs = blogs.filter(b => b.id !== blogId);
        saveBlogData();
        res.status(200).send('Blog deleted successfully');
    } catch (err) {
        res.status(403).send('Invalid token');
    }
};
