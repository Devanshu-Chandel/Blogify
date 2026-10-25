import express from "express";
import mongoose from "mongoose";
import Comment from "../models/Comment.js";
import Post from "../models/Post.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Bad comment id in the URL -> 404 instead of crashing
router.param("id", (req, res, next, id) => {
  if (!mongoose.isValidObjectId(id)) {
    return res.status(404).json({ msg: "Comment not found" });
  }
  next();
});

// Bad post id in the URL -> 404 instead of crashing
router.param("postId", (req, res, next, postId) => {
  if (!mongoose.isValidObjectId(postId)) {
    return res.status(404).json({ msg: "Post not found" });
  }
  next();
});

// Get comments of a post (PUBLIC), oldest first
router.get("/post/:postId", async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .populate("author", "name")
      .sort({ createdAt: 1 });
    res.status(200).json(comments);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Add a comment (login required)
router.post("/post/:postId", verifyToken, async (req, res) => {
  try {
    const text = (req.body.text || "").trim();
    if (!text) return res.status(400).json({ msg: "Comment cannot be empty" });
    if (text.length > 500) {
      return res.status(400).json({ msg: "Comment must be 500 characters or less" });
    }

    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ msg: "Post not found" });

    const comment = await new Comment({
      post: post._id,
      author: req.user,
      text,
    }).save();
    await comment.populate("author", "name");

    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Delete my comment (owner only)
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ msg: "Comment not found" });
    if (comment.author.toString() !== req.user) {
      return res.status(403).json({ msg: "You can only delete your own comments" });
    }

    await comment.deleteOne();
    res.status(200).json({ msg: "Comment deleted" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

export default router;