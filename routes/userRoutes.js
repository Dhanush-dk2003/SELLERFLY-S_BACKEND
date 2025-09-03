import express from "express";
import {
  createUserProfile,
  getNextEmployeeId,
  getAllProfiles,
  getProfileById,
  getsearchProfile,
  getProfilePic,
  updateProfile,
  deleteProfile,
} from "../controllers/userController.js";
import multer from "multer";

const upload = multer({
  storage: multer.memoryStorage(),   // ✅ Store file in memory, so buffer is available
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

const router = express.Router();

router.post("/create", upload.single("profilePic"), createUserProfile);
router.get("/next-id", getNextEmployeeId);
router.get("/profile", getAllProfiles);
router.get("/profile/:employeeId", getProfileById);
router.get("/search/:term", getsearchProfile);
router.get("/profile-pic/:employeeId", getProfilePic);
router.put("/profile/:employeeId", upload.single("profilePic"), updateProfile);
router.delete("/profile/:employeeId", deleteProfile);

export default router;