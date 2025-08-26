import express from "express";
import {
  updateClientGrowth,
  addFollowup,
  getFollowups,
  deleteFollowups,
} from "../controllers/growthController.js";

const router = express.Router();

/* Client Growth Updates */
router.put("/client/:id", updateClientGrowth);

/* Followups */
router.post("/followup", addFollowup);
router.get("/followup", getFollowups);
router.delete("/followup", deleteFollowups);

export default router;
