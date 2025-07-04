import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
    getUsers,
    getUser,
    deleteUser,
    getLinks,
    getLink,
    deleteLink,
    getDashboardStats,
    getLinkClicks,
    createFeedback,
    getAllFeedback
} from '../controllers/adminController.js';

const router = express.Router();

// All routes are protected and admin-only
router.use(protect, authorize('admin'));

// Dashboard
router.get('/dashboard', getDashboardStats);

// User management
router.get('/users', getUsers);
router.get('/users/:id', getUser);
router.delete('/users/:id', deleteUser);

// Link management
router.get('/links', getLinks);
router.get('/links/:id', getLink);
router.delete('/links/:id', deleteLink);
router.get('/links/:id/clicks', getLinkClicks);

// Feedback
router.get('/feedback', getAllFeedback);

export default router; 