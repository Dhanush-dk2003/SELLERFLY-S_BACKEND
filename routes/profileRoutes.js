import express from 'express';
import {
  getAllProfiles,
  getProfileById,
  getsearchProfile,
  updateProfile,
  deleteProfile
} from '../controllers/profileController.js';


const router = express.Router();

router.get('/', getAllProfiles);               // Admin: All profiles
router.get('/:employeeId', getProfileById);    // All roles: Get by ID
router.get("/search/:term", getsearchProfile);    // All roles: Get by search term
router.put('/:employeeId', updateProfile); // ✅ only this one needed
router.delete('/:employeeId', deleteProfile);  // Admin/Manager: Delete

export default router;
