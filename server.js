const express = require("express");
const app = express();

app.use(express.json());

const port = 3000;

// Import controllers
const userController = require("./controllers/usercontroller");
const likeController = require("./controllers/likecontroller");
const blogController = require("./controllers/blogcontroller");
const commentController = require("./controllers/commentcontroller");

// User
app.get("/", (req, res) => res.send("WELCOME TO MY BOOK"));
app.post("/register", userController.registerUser);
app.post("/login", userController.loginUser);
app.get('/users/:id/profile', userController.getProfile);


// Blogs
app.post("/blog/create", blogController.createBlog);
app.put("/blog/update/:id", blogController.updateBlog);
app.delete("/blog/delete/:id", blogController.deleteBlog);
// COmments
app.post("/blog/:id/comment", commentController.addComment);
app.get("/blog/:id/comments", commentController.getComments);

// Likes
app.post("/blog/:id/like",likeController.likeBlog);
app.delete("/blog/:id/unlike",likeController.unlikeBlog);

// Follow
app.post('/users/:id/follow', followUnfollowController.followUser);
app.delete('/users/:id/unfollow', followUnfollowController.unfollowUser);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
