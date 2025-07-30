import express from "express";
import { createUserProfile, getNextEmployeeId } from "../controllers/userController.js";

const router = express.Router();

router.post("/create", createUserProfile); 
router.get("/next-id", getNextEmployeeId);

export default router;
