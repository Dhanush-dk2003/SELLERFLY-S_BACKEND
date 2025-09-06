import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  isAdminOrManager,
  isAdminOrManagerOrUser,
  
} from '../middleware/roleMiddleware.js';
import {
  createTask,
  getTasksByProject,
  deleteTask,
  getUserTasks,
  updateTaskStatus
} from '../controllers/taskController.js';

const router = express.Router();

// Task creation (Admin only)
router.post('/', protect, isAdminOrManager, createTask);

// Get tasks by project (any authenticated user)
router.get('/', protect, getTasksByProject);

// Delete task (Admin or Manager)
router.delete('/:id', protect, isAdminOrManager, deleteTask);

// Get tasks for current user
router.get('/user', protect, getUserTasks);

// Update task status (User only, on own tasks)
router.put('/:id', protect, isAdminOrManagerOrUser, updateTaskStatus);

export default router;
