const express = require("express");
const app = express();

app.use(express.json());

const port = 3000;

// Import controllers
const userController = require("./controllers/usercontroller");
const adminController = require("./controllers/admincontroller");
const blogController = require("./controllers/blogcontroller");
const commentController = require("./controllers/commentcontroller");

// Routes
app.get("/", (req, res) => res.send("WELCOME TO THE BLOG APP"));
app.post("/register", userController.registerUser);
app.post("/login", userController.loginUser);
app.post("/admin/promote", adminController.promoteUserToAdmin);
app.post("/blog/create", blogController.createBlog);
app.put("/blog/update/:id", blogController.updateBlog);
app.delete("/blog/delete/:id", blogController.deleteBlog);
app.post("/blog/:id/comment", commentController.addComment);
app.get("/blog/:id/comments", commentController.getComments);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
