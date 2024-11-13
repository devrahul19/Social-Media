const fs = require('fs');
const path = require('path');

// File paths for users and blogs data
const userFilePath = path.join(__dirname, '../users.json');
let users = JSON.parse(fs.readFileSync(userFilePath, 'utf-8') || '[]');

// Helper function to save user data to users.json
const saveUserData = () => fs.writeFileSync(userFilePath, JSON.stringify(users, null, 2), 'utf-8');

// Follow user function
exports.followUser = (req, res) => {
    const targetUserId = parseInt(req.params.id, 10);
    const currentUser = users.find(u => u.id === req.user.id);
    const targetUser = users.find(u => u.id === targetUserId);

    if (!targetUser) return res.status(404).send('User not found');

    if (targetUser.private) {
        if (!targetUser.followRequests.some(req => req.id === currentUser.id)) {
            targetUser.followRequests.push({ id: currentUser.id, username: currentUser.username, email: currentUser.email });
            saveUserData();
            return res.status(200).send('Follow request sent');
        } else {
            return res.status(400).send('Follow request already sent');
        }
    } else {
        if (!targetUser.followers.some(follower => follower.id === currentUser.id)) {
            targetUser.followers.push({ id: currentUser.id, username: currentUser.username, email: currentUser.email });
            currentUser.following.push({ id: targetUser.id, username: targetUser.username, email: targetUser.email });
            saveUserData();
            return res.status(200).send('Successfully followed user');
        } else {
            return res.status(400).send('Already following the user');
        }
    }
};

// Unfollow user function
exports.unfollowUser = (req, res) => {
    const targetUserId = parseInt(req.params.id, 10);
    const currentUser = users.find(u => u.id === req.user.id);
    const targetUser = users.find(u => u.id === targetUserId);

    if (!targetUser) return res.status(404).send('User not found');

    // Remove target user from current user's following list
    const followingIndex = currentUser.following.findIndex(follow => follow.id === targetUserId);
    if (followingIndex !== -1) {
        currentUser.following.splice(followingIndex, 1);
    }

    // Remove current user from target user's followers list
    const followerIndex = targetUser.followers.findIndex(follower => follower.id === currentUser.id);
    if (followerIndex !== -1) {
        targetUser.followers.splice(followerIndex, 1);
    }

    saveUserData();
    return res.status(200).send('Successfully unfollowed user');
};

// Approve follow request
exports.approveFollowRequest = (req, res) => {
    const requesterId = parseInt(req.body.requesterId, 10);
    const targetUser = users.find(u => u.id === req.user.id);
    const requester = users.find(u => u.id === requesterId);

    if (!targetUser || !requester) return res.status(404).send('User not found');
    if (!targetUser.private) return res.status(400).send('User is not private');

    const requestIndex = targetUser.followRequests.findIndex(req => req.id === requesterId);
    if (requestIndex === -1) return res.status(400).send('Follow request not found');

    targetUser.followRequests.splice(requestIndex, 1);
    targetUser.followers.push({ id: requester.id, username: requester.username, email: requester.email });
    requester.following.push({ id: targetUser.id, username: targetUser.username, email: targetUser.email });

    saveUserData();
    return res.status(200).send('Follow request approved');
};

// Reject follow request
exports.rejectFollowRequest = (req, res) => {
    const requesterId = parseInt(req.body.requesterId, 10);
    const targetUser = users.find(u => u.id === req.user.id);

    if (!targetUser) return res.status(404).send('User not found');
    
    const requestIndex = targetUser.followRequests.findIndex(req => req.id === requesterId);
    if (requestIndex === -1) return res.status(400).send('Follow request not found');

    targetUser.followRequests.splice(requestIndex, 1);
    saveUserData();

    return res.status(200).send('Follow request rejected');
};

// Helper function to check if a user is following another user
const isFollowing = (userId, targetUserId) => {
    const user = users.find(u => u.id === userId);
    return user && user.following.some(follow => follow.id === targetUserId);
};

// Get Profile with Follow Check for Private Profiles
exports.getProfile = (req, res) => {
    const userIdToView = parseInt(req.params.id, 10);
    const userToView = users.find(u => u.id === userIdToView);

    if (!userToView) return res.status(404).send('User not found');

    const isFollowingUser = isFollowing(req.user.id, userIdToView);
    const isSameUser = userToView.id === req.user.id;

    if (userToView.private && !isFollowingUser && !isSameUser) {
        return res.status(403).send('This profile is private');
    }

    res.status(200).json({
        id: userToView.id,
        username: userToView.username,
        email: userToView.email,
        public: !userToView.private
    });
};
