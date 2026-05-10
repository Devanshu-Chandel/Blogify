import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

//import authRoutes from "./routes/auth.js";
import authRoutes from   './routes/auth.js'
import postRoutes from "./routes/posts.js";
import { verifyToken } from "./middleware/authMiddleware.js";

dotenv.config();
const app = express();
const PORT =  3000;

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/posts", verifyToken, postRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error(err)); 