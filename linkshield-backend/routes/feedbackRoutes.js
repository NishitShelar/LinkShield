import express from 'express';
import { protect } from '../middleware/auth.js';
import { createFeedback } from '../controllers/adminController.js';

const router = express.Router();

// Allow any logged-in user to submit feedback
router.post('/', protect, createFeedback);

export default router; 