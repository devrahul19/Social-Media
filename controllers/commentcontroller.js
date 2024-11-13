const fs = require('fs');
const path = require('path');

// File path for the blogs JSON file
const blogsFilePath = path.join(__dirname, '../blogs.json');
let blogs = JSON.parse(fs.readFileSync(blogsFilePath, 'utf-8') || '[]');

// Helper function to save blogs data to blogs.json
const saveBlogsData = () => fs.writeFileSync(blogsFilePath, JSON.stringify(blogs, null, 2), 'utf-8');

// Helper function to get the next unique commentId
const getNextCommentId = (comments) => {
    let maxId = 0;
    const traverse = (commentsList) => {
        for (let comment of commentsList) {
            if (comment.commentId > maxId) maxId = comment.commentId;
            if (comment.replies && comment.replies.length > 0) {
                traverse(comment.replies);
            }
        }
    };
    traverse(comments);
    return maxId + 1;
};

// Helper function to find a comment recursively
const findComment = (comments, commentId) => {
    for (let comment of comments) {
        if (comment.commentId === commentId) {
            return comment;
        }
        if (comment.replies && comment.replies.length > 0) {
            const found = findComment(comment.replies, commentId);
            if (found) return found;
        }
    }
    return null;
};

// Helper function to delete a comment recursively
const deleteCommentRecursive = (comments, commentId, userId) => {
    for (let i = 0; i < comments.length; i++) {
        const comment = comments[i];
        if (comment.commentId === commentId) {
            if (comment.userId !== userId) {
                return false; // Not authorized
            }
            comments.splice(i, 1);
            return true;
        }
        if (comment.replies && comment.replies.length > 0) {
            const deleted = deleteCommentRecursive(comment.replies, commentId, userId);
            if (deleted) return true;
        }
    }
    return false;
};

// Add a comment or reply to a blog post
exports.addComment = (req, res) => {
    const blogId = parseInt(req.params.blogId, 10);
    const { text, parentCommentId } = req.body;

    if (!text) return res.status(400).send('Comment text is required');

    const blog = blogs.find(b => b.id === blogId);
    if (!blog) return res.status(404).send('Blog not found');

    const userId = req.user ? req.user.id : 1; // Default to user ID 1 for testing

    const newComment = {
        commentId: getNextCommentId(blog.comments),
        blogId,
        userId,
        text,
        parentCommentId: parentCommentId || null,
        createdAt: new Date().toISOString()
    };

    if (parentCommentId) {
        const parentComment = findComment(blog.comments, parentCommentId);
        if (!parentComment) return res.status(404).send('Parent comment not found');

        if (!parentComment.replies) parentComment.replies = [];
        parentComment.replies.push(newComment);
    } else {
        blog.comments.push(newComment);
    }

    saveBlogsData();
    return res.status(201).json(newComment);
};

// Add a reply to a specific comment on a blog post
exports.addReply = (req, res) => {
    req.body.parentCommentId = parseInt(req.params.commentId, 10);
    return this.addComment(req, res);
};

// Get all comments for a blog post, including nested replies
exports.getComments = (req, res) => {
    const blogId = parseInt(req.params.blogId, 10);
    const blog = blogs.find(b => b.id === blogId);

    if (!blog) return res.status(404).send('Blog not found');

    res.json(blog.comments);
};

// Delete a comment or reply by ID
exports.deleteComment = (req, res) => {
    const blogId = parseInt(req.params.blogId, 10);
    const commentId = parseInt(req.params.commentId, 10);

    const blog = blogs.find(b => b.id === blogId);
    if (!blog) return res.status(404).send('Blog not found');

    const deleted = deleteCommentRecursive(blog.comments, commentId, req.user.id);

    if (!deleted) {
        return res.status(404).send('Comment not found or not authorized to delete');
    }

    saveBlogsData();
    return res.status(200).send('Comment deleted successfully');
};
