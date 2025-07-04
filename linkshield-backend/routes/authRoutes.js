import express from 'express';
import {
    register,
    login,
    logout,
    getMe,
    updateProfile,
    verifyEmail,
    forgotPassword,
    resetPassword,
    updateNotificationSettings,
    resendOTP,
    manualVerifyEmail,
    googleAuth
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);
router.get('/logout', logout);
router.get('/verify-email/:token', verifyEmail);
router.get('/manual-verify/:userId', manualVerifyEmail);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:resetToken', resetPassword);
router.post('/resend-otp', resendOTP);

// Protected routes
router.get('/me', protect, getMe);
router.put('/update-profile', protect, updateProfile);
router.put('/notification-settings', protect, updateNotificationSettings);

export default router; 