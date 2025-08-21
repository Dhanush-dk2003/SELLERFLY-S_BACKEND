import express from "express";
import {
  createPortals,
  getPortals,
  getPortalsByClient,
  updatePortal,
  deletePortal,
  getPortalsGrouped
} from "../controllers/portalController.js";

const router = express.Router();

// Create multiple portals for a client
router.post("/", createPortals);

// Get all portals
router.get("/", getPortals);

// Get portals of a specific client
router.get("/client/:clientId", getPortalsByClient);

// Update single portal
router.put("/:id", updatePortal);

// Delete single portal
router.delete("/:id", deletePortal);

// Get all portals grouped by client
router.get("/grouped", getPortalsGrouped);


export default router;
