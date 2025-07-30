import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { isAdminOrManager } from '../middleware/roleMiddleware.js';
import { isAdmin } from '../middleware/roleMiddleware.js';
import { createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject } from '../controllers/projectController.js';

const router = express.Router();

router.post('/', protect, isAdmin, createProject,  (req, res) => {
  res.status(201).json({ message: 'Project created successfully' });
});

router.get('/', protect, isAdminOrManager, getAllProjects);
router.get('/:id', protect, isAdminOrManager, getProjectById);
router.put('/:id', protect, isAdmin, updateProject);
router.delete('/:id', protect, isAdmin, deleteProject);

// Admin-only: Delete a project
// router.delete('/:id', protect, isAdmin, (req, res) => {
//   res.json({ message: `Project ${req.params.id} deleted` });
// });

// Manager-only: View dashboard
// router.get('/manager-view', protect, isManager, (req, res) => {
//   res.json({ message: 'Manager dashboard view' });
// });

export default router;
