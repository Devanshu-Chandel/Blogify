import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/auth.js";
import postRoutes from "./routes/posts.js";
import commentRoutes from "./routes/comments.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
// Local: CLIENT_URL not set -> any port allowed. Live: only your frontend URL.
app.use(cors({ origin: process.env.CLIENT_URL || true }));
app.use(express.json({ limit: "100kb" }));

// max 30 login/signup attempts per IP every 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  message: { msg: "Too many attempts. Please try again later." },
});
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/signup", authLimiter);

// Health check (handy to test that the live server is awake)
app.get("/", (req, res) => res.json({ msg: "Blogify API is running" }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);

// Unknown route
app.use((req, res) => res.status(404).json({ msg: "Route not found" }));

// Central error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ msg: "Something went wrong on the server" });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error(err));