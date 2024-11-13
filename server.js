const express = require("express");
const userController = require("./controllers/userController");
const followController = require("./controllers/followController");
const likeController = require("./controllers/likeController");
const blogController = require("./controllers/blogController");
const commentController = require("./controllers/commentController");
const authMiddleware = require("./middleware/authMiddleware");
const PORT = 3000;
const app = express();
app.use(express.json());

// Public routes
app.post("/register", userController.registerUser);
app.post("/login", userController.loginUser);
app.get("/blogs", blogController.getAllBlogs); // Public access to view all blogs
app.get("/blogs/:id", blogController.getBlogById); // Public access to view a specific blog
app.get("/blogs/:blogId/comments", commentController.getComments); // Public access to view comments on a blog

// Protected routes Working
app.post("/blogs", authMiddleware, blogController.createBlog);
app.put("/blogs/:id", authMiddleware, blogController.updateBlog);
app.delete("/blogs/:id", authMiddleware, blogController.deleteBlog);

//Working
app.post("/blogs/:blogId/comments", commentController.addComment); // Add a root-level comment
app.post("/blogs/:blogId/comments/:commentId/reply", commentController.addReply); // Add a reply to a specific comment
app.delete("/blogs/:blogId/comments/:commentId", commentController.deleteComment); // Delete a comment or reply by ID


app.post("/follow/:id", authMiddleware, followController.followUser);
app.post("/unfollow/:id", authMiddleware, followController.unfollowUser);
app.post("/follow/approve", authMiddleware, followController.approveFollowRequest);
app.post("/follow/reject", authMiddleware, followController.rejectFollowRequest);
app.post("/privacy", authMiddleware, userController.updatePrivacy);

app.post("/like/:id", authMiddleware, likeController.likeBlog);
app.delete("/like/:id", authMiddleware, likeController.unlikeBlog);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
