const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

const commentFilePath = path.join(__dirname, '../comments.json');
let comments = JSON.parse(fs.readFileSync(commentFilePath, 'utf-8') || '[]');
const JWT_SECRET = "superSecretJWTKey123!";

const saveCommentData = () => fs.writeFileSync(commentFilePath, JSON.stringify(comments, null, 2), 'utf-8');

exports.addComment = (req, res) => {
    const { token, comment, parentCommentId } = req.body;
    const blogId = parseInt(req.params.id, 10);

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = JSON.parse(fs.readFileSync(path.join(__dirname, '../users.json'), 'utf-8')).find(u => u.id === decoded.id);
        if (!user) return res.status(403).send('Unauthorized');

        const newComment = {
            commentId: comments.length + 1,
            blogId: blogId,
            userId: user.id,
            comment: comment,
            parentCommentId: parentCommentId || null,
            date: new Date().toISOString()
        };

        comments.push(newComment);
        saveCommentData();
        res.status(201).send('Comment added successfully');
    } catch (err) {
        res.status(403).send('Invalid token');
    }
};

exports.getComments = (req, res) => {
    const blogId = parseInt(req.params.id, 10);
    const blogComments = comments.filter(comment => comment.blogId === blogId);

    if (blogComments.length === 0) return res.status(404).send('No comments found for this blog');
    res.status(200).json(blogComments);
};
