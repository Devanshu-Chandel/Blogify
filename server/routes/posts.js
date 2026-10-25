import express from "express";
import mongoose from "mongoose";
import Post from "../models/Post.js";
import Comment from "../models/Comment.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// If the :id in the URL isn't a valid Mongo id, answer 404 instead of crashing
router.param("id", (req, res, next, id) => {
  if (!mongoose.isValidObjectId(id)) {
    return res.status(404).json({ msg: "Post not found" });
  }
  next();
});

const validatePost = (title, content) => {
  if (!title?.trim() || !content?.trim()) return "Title and content are required";
  if (title.trim().length > 120) return "Title must be 120 characters or less";
  if (content.length > 10000) return "Content must be 10,000 characters or less";
  return null;
};

// Get posts (PUBLIC) - supports ?page=1&limit=6&search=text
router.get("/", async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 6, 1), 20);
    const search = (req.query.search || "").trim();

    const filter = {};
    if (search) {
      // escape regex special characters so "c++" or "(" don't break the query
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { title: { $regex: escaped, $options: "i" } },
        { content: { $regex: escaped, $options: "i" } },
      ];
    }

    const [posts, total] = await Promise.all([
      Post.find(filter)
        .populate("author", "name email")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Post.countDocuments(filter),
    ]);

    res.status(200).json({
      posts,
      page,
      total,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Get my posts (login required) - must stay ABOVE "/:id"
router.get("/me", verifyToken, async (req, res) => {
  try {
    const posts = await Post.find({ author: req.user })
      .populate("author", "name email")
      .sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Get single post (PUBLIC)
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate("author", "name email");
    if (!post) return res.status(404).json({ msg: "Post not found" });
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Create post (login required)
router.post("/", verifyToken, async (req, res) => {
  try {
    const { title, content } = req.body;
    const problem = validatePost(title, content);
    if (problem) return res.status(400).json({ msg: problem });

    const post = await new Post({
      title: title.trim(),
      content: content.trim(),
      author: req.user,
    }).save();
    await post.populate("author", "name email");

    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Toggle like (login required)
router.put("/:id/like", verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: "Post not found" });

    const alreadyLiked = post.likes.some((uid) => uid.toString() === req.user);
    if (alreadyLiked) {
      post.likes.pull(req.user); // remove my like
    } else {
      post.likes.push(req.user); // add my like
    }

    await post.save();
    res.status(200).json({ likes: post.likes });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Update post (owner only)
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: "Post not found" });
    if (post.author.toString() !== req.user) {
      return res.status(403).json({ msg: "You can only edit your own posts" });
    }

    const { title, content } = req.body;
    const problem = validatePost(title, content);
    if (problem) return res.status(400).json({ msg: problem });

    post.title = title.trim();
    post.content = content.trim();

    await post.save();
    await post.populate("author", "name email");
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Delete post (owner only) - also deletes its comments
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: "Post not found" });
    if (post.author.toString() !== req.user) {
      return res.status(403).json({ msg: "You can only delete your own posts" });
    }

    await Comment.deleteMany({ post: post._id });
    await post.deleteOne();
    res.status(200).json({ msg: "Post deleted" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

export default router;