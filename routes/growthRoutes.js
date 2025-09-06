import express from "express";
import {
  updateClientGrowth,
  addFollowup,
  getFollowups,
  deleteFollowups,getClientById 
} from "../controllers/growthController.js";



const router = express.Router();
router.get("/client/:id", getClientById);

/* Client Growth Updates */
router.put("/client/:id", updateClientGrowth);

/* Followups */
router.post("/followup", addFollowup);
router.get("/followup", getFollowups);
router.delete("/followup", deleteFollowups);

export default router;
