const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

const followersFilePath = path.join(__dirname, '../followers.json');
const usersFilePath = path.join(__dirname, '../users.json');

let followers = JSON.parse(fs.readFileSync(followersFilePath, 'utf-8') || '[]');
let users = JSON.parse(fs.readFileSync(usersFilePath, 'utf-8') || '[]');
const JWT_SECRET = "superSecretJWTKey123!";

const saveFollowersData = () => fs.writeFileSync(followersFilePath, JSON.stringify(followers, null, 2), 'utf-8');

// Follow User
exports.followUser = (req, res) => {
    const { token } = req.body;
    const userIdToFollow = parseInt(req.params.id, 10);

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = decoded.id;

        if (userId === userIdToFollow) return res.status(400).send('Cannot follow yourself');

        const userToFollow = users.find(u => u.id === userIdToFollow);
        if (!userToFollow) return res.status(404).send('User not found');
        if (!userToFollow.public) return res.status(403).send('User profile is private');

        const alreadyFollowing = followers.some(f => f.userId === userIdToFollow && f.followerId === userId);
        if (alreadyFollowing) return res.status(400).send('Already following this user');

        followers.push({ userId: userIdToFollow, followerId: userId });
        saveFollowersData();
        res.status(200).send('Successfully followed the user');
    } catch (err) {
        res.status(403).send('Invalid token');
    }
};

// Unfollow User
exports.unfollowUser = (req, res) => {
    const { token } = req.body;
    const userIdToUnfollow = parseInt(req.params.id, 10);

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = decoded.id;

        if (userId === userIdToUnfollow) return res.status(400).send('Cannot unfollow yourself');

        const userToUnfollow = users.find(u => u.id === userIdToUnfollow);
        if (!userToUnfollow) return res.status(404).send('User not found');

        const followIndex = followers.findIndex(f => f.userId === userIdToUnfollow && f.followerId === userId);
        if (followIndex === -1) return res.status(400).send('Not following this user');

        followers.splice(followIndex, 1);
        saveFollowersData();
        res.status(200).send('Successfully unfollowed the user');
    } catch (err) {
        res.status(403).send('Invalid token');
    }
};

// Get Profile with Follow Check for Private Profiles
// exports.getProfile = (req, res) => {
//     const { token } = req.body;
//     const userIdToView = parseInt(req.params.id, 10);

//     try {
//         const decoded = jwt.verify(token, JWT_SECRET);
//         const userId = decoded.id;

//         const userToView = users.find(u => u.id === userIdToView);
//         if (!userToView) return res.status(404).send('User not found');

//         const isFollowing = followers.some(f => f.userId === userIdToView && f.followerId === userId);
//         if (!userToView.public && !isFollowing && userToView.id !== userId) {
//             return res.status(403).send('This profile is private');
//         }

//         res.status(200).json({
//             id: userToView.id,
//             email: userToView.email,
//             public: userToView.public
//         });
//     } catch (err) {
//         res.status(403).send('Invalid token');
//     }
// };
