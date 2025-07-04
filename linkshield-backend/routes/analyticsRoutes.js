import express from 'express';
import {
    getPlatformStats,
    getUserStats,
    getLinkStats
} from '../controllers/analyticsController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Platform statistics (admin only)
router.get('/platform', protect, getPlatformStats);

// User statistics
router.get('/user', getUserStats);

// Link statistics
router.get('/link/:id', getLinkStats);

export default router; 