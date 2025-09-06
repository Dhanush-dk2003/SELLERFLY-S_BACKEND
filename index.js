import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import multer from "multer";


import authRoutes from "./routes/authRoutes.js";
import { protect } from "./middleware/authMiddleware.js";
import { isAdmin } from "./middleware/roleMiddleware.js";
import projectRoutes from "./routes/projectRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import apiLimiter from "./middleware/rateLimiter.js";
import messageRoutes from "./routes/messageRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import clientRoutes from "./routes/clientsRoutes.js";
import portalRoutes from "./routes/portalRoutes.js";
import growthRoutes from "./routes/growthRoutes.js";

dotenv.config();
const app = express();

// Apply body parser with increased limit BEFORE routes
app.use(express.json({ limit: '20mb' })); // You can increase to 20mb if needed
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

app.use(
  cors({
    // origin: "http://localhost:3000",
    origin: "https://crm.sellerfly.in",
    credentials: true,
  })
);

app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/auth/login", apiLimiter);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api/clients", clientRoutes);
app.use("/api/portals", portalRoutes);
app.use("/api/growth", growthRoutes);

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ message: "File too large. Maximum size is 5MB." });
    }
    return res.status(400).json({ message: "File upload error." });
  }
  console.error("Unexpected error:", err);
  res.status(500).json({ message: "Internal server error" });
});

app.get("/", (req, res) => {
  res.send("API is running");
});

app.get("/api/profile", protect, (req, res) => {
  res.json({ message: "Welcome!", user: req.user });
});

app.get("/api/admin-only", protect, isAdmin, (req, res) => {
  res.json({ message: "Welcome Admin!", user: req.user });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
