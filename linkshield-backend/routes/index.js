import express from 'express';
import adminRoutes from './adminRoutes.js';

const router = express.Router();

// Test route
router.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'LinkShield API is running',
        version: '1.0.0',
        environment: process.env.NODE_ENV
    });
});

// Health check route
router.get('/health', (req, res) => {
    res.json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString()
    });
});

router.use('/api', adminRoutes);

export default router; 