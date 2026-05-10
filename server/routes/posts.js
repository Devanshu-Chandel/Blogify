import express from "express";
import Post from "../models/Post.js";

const router = express.Router();

// Create post
router.post("/", async (req, res) => {
  try {
    const { title, content } = req.body;
    const post = await new Post({ title, content, author: req.user }).save();
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Get all posts
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find().populate("author", "name email");
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

router.get("/me", async (req, res) => {
  const posts = await Post.find({ author: req.user });
  res.json(posts);
});

// Update post
router.put("/:id", async (req, res) => {
  try {
    const updated = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Delete post
router.delete("/:id", async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.status(200).json({ msg: "Post deleted" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

export default router;
