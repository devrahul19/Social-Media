const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

const likesFilePath = path.join(__dirname, '../likes.json');
let likes = JSON.parse(fs.readFileSync(likesFilePath, 'utf-8') || '[]');
const JWT_SECRET = "superSecretJWTKey123!";

const saveLikesData = () => fs.writeFileSync(likesFilePath, JSON.stringify(likes, null, 2), 'utf-8');

exports.likeBlog = (req, res) => {
    const { token } = req.body;
    const blogId = parseInt(req.params.id, 10);

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = JSON.parse(fs.readFileSync(path.join(__dirname, '../users.json'), 'utf-8')).find(u => u.id === decoded.id);
        if (!user) return res.status(403).send('Unauthorized');

        // Read current likes data
        let likesData = JSON.parse(fs.readFileSync(likesFilePath, 'utf-8') || '[]');
        let blogLikes = likesData.find(l => l.blogId === blogId);

        // If blogLikes does not exist, create it
        if (!blogLikes) {
            blogLikes = {
                blogId: blogId,
                likesCount: 0,
                likes: []
            };
            likesData.push(blogLikes);
        }

        // Check if the user already liked this blog
        if (blogLikes.likes.some(like => like.userId === user.id)) {
            return res.status(409).send('You have already liked this blog');
        }

        // Create a new like entry
        const newLike = {
            likeId: blogLikes.likes.length + 1,
            userId: user.id,
            date: new Date().toISOString()
        };

        // Add the like and increment the likesCount
        blogLikes.likes.push(newLike);
        blogLikes.likesCount++;

        // Save the updated likes data
        fs.writeFileSync(likesFilePath, JSON.stringify(likesData, null, 2), 'utf-8');

        res.status(201).send('Blog liked successfully');
    } catch (err) {
        res.status(403).send('Invalid token');
    }
};

exports.unlikeBlog = (req, res) => {
    const { token } = req.body;
    const blogId = parseInt(req.params.id, 10);

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = decoded.id;

        // Read current likes data
        let likesData = JSON.parse(fs.readFileSync(likesFilePath, 'utf-8') || '[]');
        const blogLikes = likesData.find(like => like.blogId === blogId);

        if (!blogLikes) return res.status(404).send('No likes found for this blog');

        // Find the index of the like to remove
        const likeIndex = blogLikes.likes.findIndex(like => like.userId === userId);
        if (likeIndex === -1) return res.status(404).send('Like not found');

        // Remove the like
        blogLikes.likes.splice(likeIndex, 1);
        blogLikes.likesCount--; // Decrement the likes count

        // If no likes left, you might want to keep or remove the blogLikes entry
        // For example, to remove it entirely if there are no likes left:
        if (blogLikes.likesCount === 0) {
            likesData = likesData.filter(like => like.blogId !== blogId);
        }

        // Save the updated likes data
        fs.writeFileSync(likesFilePath, JSON.stringify(likesData, null, 2), 'utf-8');

        res.status(200).send('Blog unliked successfully');
    } catch (err) {
        res.status(403).send('Invalid token');
    }
};


exports.getLikes = (req, res) => {
    const blogId = parseInt(req.params.id, 10);
    const blogLikes = likes.filter(like => like.blogId === blogId);

    if (blogLikes.length === 0) return res.status(404).send('No likes found for this blog');
    res.status(200).json(blogLikes);
};
