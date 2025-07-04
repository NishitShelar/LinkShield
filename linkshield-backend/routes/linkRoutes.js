import express from 'express';
import {
    createLink,
    getLinks,
    getLink,
    updateLink,
    deleteLink,
    getLinkStats,
    createAnonymousLink,
    redirectToOriginal
} from '../controllers/linkController.js';
import { protect, checkAnonymousLimit } from '../middleware/auth.js';

const router = express.Router();

// Only allow public routes for now
router.get('/:shortCode', redirectToOriginal);
router.post('/', protect, createLink);
router.post('/anonymous', checkAnonymousLimit, createLink);

// Add protected routes for dashboard functionality
router.get('/', protect, getLinks);
router.delete('/:id', protect, deleteLink);

export default router;
