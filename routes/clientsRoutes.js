// In your routes file (e.g., clientRoutes.js)
import express from "express";
import {
  createClient,
  getClients,
  getClientById,
  updateClient,
  deleteClient,
  searchClients, // Add this
  getActiveClients,
  activateClient
} from "../controllers/clientController.js";

const router = express.Router();
// ✅ fetch only active clients
router.get("/active", getActiveClients);

router.put("/activate/:id", activateClient);


router.post("/create", createClient);
router.get("/", getClients);
router.get("/:id", getClientById);
router.put("/:id", updateClient);
router.delete("/:id", deleteClient);
router.get("/search/:query", searchClients); // Add search route

export default router;