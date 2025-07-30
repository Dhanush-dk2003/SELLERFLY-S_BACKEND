import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  isAdmin,
  isUser
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
router.post('/', protect, isAdmin, createTask);

// Get tasks by project (any authenticated user)
router.get('/', protect, getTasksByProject);

// Delete task (Admin only)
router.delete('/:id', protect, isAdmin, deleteTask);

// Get tasks for current user
router.get('/user', protect, getUserTasks);

// Update task status (User only, on own tasks)
router.put('/:id', protect, isUser, updateTaskStatus);

export default router;
