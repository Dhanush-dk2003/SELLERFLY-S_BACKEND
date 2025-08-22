import express from "express";
import {
  createPortals,
  getPortals,
  getPortalsByClient,
  getCatalogByClient,
  updatePortal,
  deletePortal,
  getPortalsGrouped,
  updatePortalsForClient
} from "../controllers/portalController.js";

const router = express.Router();

// Create multiple portals
router.post("/", createPortals);

// Get all portals
router.get("/", getPortals);

// Get portals of a specific client
router.get("/client/:clientId", getPortalsByClient);

// Catalog (KEY ACC MANAGEMENT only)
router.get("/catalog/:clientId", getCatalogByClient);

// Update portal
router.put("/:id", updatePortal);

// Delete portal
router.delete("/:id", deletePortal);

// Grouped portals by client
router.get("/grouped", getPortalsGrouped);

// Update portals for a client (catalog update)
router.put("/catalog/:clientId", updatePortalsForClient);


export default router;
