const fs = require('fs');
const path = require('path');

const likesFilePath = path.join(__dirname, '../likes.json');
let likes = JSON.parse(fs.readFileSync(likesFilePath, 'utf-8') || '[]');

const saveLikesData = () => fs.writeFileSync(likesFilePath, JSON.stringify(likes, null, 2), 'utf-8');

exports.likeBlog = (req, res) => {
    const blogId = parseInt(req.params.id, 10);
    const user = req.user;

    let likesData = JSON.parse(fs.readFileSync(likesFilePath, 'utf-8') || '[]');
    let blogLikes = likesData.find(l => l.blogId === blogId);

    if (!blogLikes) {
        blogLikes = { blogId, likesCount: 0, likes: [] };
        likesData.push(blogLikes);
    }

    if (blogLikes.likes.some(like => like.userId === user.id)) {
        return res.status(409).send('You have already liked this blog');
    }

    const newLike = { likeId: blogLikes.likes.length + 1, userId: user.id, date: new Date().toISOString() };
    blogLikes.likes.push(newLike);
    blogLikes.likesCount++;

    saveLikesData();
    res.status(201).send('Blog liked successfully');
};

exports.unlikeBlog = (req, res) => {
    const blogId = parseInt(req.params.id, 10);
    const userId = req.user.id;

    let likesData = JSON.parse(fs.readFileSync(likesFilePath, 'utf-8') || '[]');
    const blogLikes = likesData.find(like => like.blogId === blogId);

    if (!blogLikes) return res.status(404).send('No likes found for this blog');

    const likeIndex = blogLikes.likes.findIndex(like => like.userId === userId);
    if (likeIndex === -1) return res.status(409).send('You have not liked this blog');

    blogLikes.likes.splice(likeIndex, 1);
    blogLikes.likesCount--;

    saveLikesData();
    res.status(200).send('Blog unliked successfully');
};
