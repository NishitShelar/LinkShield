import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import emailService from '../services/emailService.js';
import geolocationService from '../services/geolocationService.js';
import { OAuth2Client } from 'google-auth-library';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
};

// Set token cookie
const setTokenCookie = (res, token) => {
    const options = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    };

    res.cookie('token', token, options);
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(400).json({
            success: false,
            error: 'User already exists'
        });
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    // Create user (email not verified by default)
    const user = await User.create({
        name,
        email,
        password,
        verificationToken,
        verificationExpires,
        emailVerified: false, // Force email verification
        isVerified: false
    });

    // Send verification email (always required)
    try {
        console.log('Attempting to send verification email to:', user.email);
        await emailService.sendVerificationEmail(user.email, verificationToken);
        console.log('Verification email sent successfully to:', user.email);
    } catch (error) {
        console.error('Failed to send verification email:', error);
        console.error('Error details:', {
            message: error.message,
            response: error.response?.body,
            statusCode: error.response?.statusCode
        });
        
        // Delete the user if email sending fails
        await User.findByIdAndDelete(user._id);
        return res.status(500).json({
            success: false,
            error: 'Failed to send verification email. Please try again.',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }

    res.status(201).json({
        success: true,
        message: 'Registration successful. Please check your email to verify your account.',
        data: {
            _id: user._id,
            name: user.name,
            email: user.email,
            emailVerified: user.emailVerified,
            isVerified: user.isVerified
        }
    });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
    const { email, password, otp } = req.body;

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
        return res.status(401).json({
            success: false,
            error: 'Invalid credentials'
        });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
        return res.status(401).json({
            success: false,
            error: 'Invalid credentials'
        });
    }

    // Check if email is verified
    if (!user.emailVerified) {
        return res.status(401).json({
            success: false,
            error: 'Please verify your email before logging in',
            requiresEmailVerification: true
        });
    }

    // Check for inactive account (30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const isInactive = user.lastActive < thirtyDaysAgo;

    if (isInactive && !otp) {
        // Generate and send OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        user.otp = {
            code: otpCode,
            expires: otpExpires,
            attempts: 0,
            lastSent: new Date()
        };

        try {
            await emailService.sendOTPEmail(user.email, otpCode, user.name);
            await user.save();

            return res.status(200).json({
                success: false,
                error: 'Account verification required. Please check your email for OTP.',
                requiresOTP: true,
                message: 'OTP sent to your email'
            });
        } catch (error) {
            console.error('Failed to send OTP:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to send OTP. Please try again.'
            });
        }
    }

    // Verify OTP if provided
    if (otp) {
        if (!user.otp || !user.otp.code) {
            return res.status(400).json({
                success: false,
                error: 'No OTP requested or OTP expired'
            });
        }

        if (user.otp.attempts >= 3) {
            return res.status(400).json({
                success: false,
                error: 'Too many OTP attempts. Please request a new OTP.'
            });
        }

        if (user.otp.expires < new Date()) {
            return res.status(400).json({
                success: false,
                error: 'OTP expired. Please request a new OTP.'
            });
        }

        if (user.otp.code !== otp) {
            user.otp.attempts += 1;
            await user.save();
            return res.status(400).json({
                success: false,
                error: 'Invalid OTP code'
            });
        }

        // Clear OTP after successful verification
        user.otp = undefined;
    }

    // Get location data
    const getClientIP = (req) => {
        // Check for forwarded headers first
        const forwardedFor = req.headers['x-forwarded-for'];
        if (forwardedFor) {
            const ips = forwardedFor.split(',').map(ip => ip.trim());
            return ips[0];
        }

        // Check for real IP header
        const realIP = req.headers['x-real-ip'];
        if (realIP) {
            return realIP;
        }

        // Check for CF-Connecting-IP (Cloudflare)
        const cfIP = req.headers['cf-connecting-ip'];
        if (cfIP) {
            return cfIP;
        }

        // Use connection remote address
        const remoteAddr = req.connection?.remoteAddress || req.socket?.remoteAddress;
        if (remoteAddr) {
            // Remove IPv6 prefix if present
            return remoteAddr.replace(/^::ffff:/, '');
        }

        // Fallback to req.ip (Express.js)
        return req.ip || '127.0.0.1';
    };

    const ip = getClientIP(req);
    const location = await geolocationService.getLocation(ip);

    // Add to login history
    user.loginHistory.push({
        timestamp: new Date(),
        ip,
        location,
        userAgent: req.headers['user-agent']
    });

    // Update last active
    user.lastActive = new Date();
    user.metadata.lastLogin = new Date();
    user.metadata.loginCount += 1;

    // Check for suspicious login
    const lastLogin = user.loginHistory[user.loginHistory.length - 2];
    if (lastLogin && lastLogin.location.country !== location.country) {
        await emailService.sendSecurityAlert(user.email, {
            type: 'new_location',
            location,
            timestamp: new Date()
        });
    }

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Set cookie
    setTokenCookie(res, token);

    res.json({
        success: true,
        data: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified,
            emailVerified: user.emailVerified,
            token
        }
    });
});

// @desc    Logout user
// @route   GET /api/auth/logout
// @access  Public
export const logout = (req, res) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });

    res.json({
        success: true,
        message: 'User logged out successfully'
    });
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);

    res.json({
        success: true,
        data: user
    });
});

// @desc    Update user profile
// @route   PUT /api/auth/update-profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res) => {
    const { name, email, currentPassword, newPassword } = req.body;

    // Get user
    const user = await User.findById(req.user.id);

    // Update name
    if (name) user.name = name;

    // Update email
    if (email && email !== user.email) {
        // Check if email exists
        const emailExists = await User.findOne({ email });
        if (emailExists) {
            return res.status(400).json({
                success: false,
                error: 'Email already in use'
            });
        }

        // Generate verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

        user.email = email;
        user.isVerified = false;
        user.verificationToken = verificationToken;
        user.verificationExpires = verificationExpires;

        // Send verification email
        await emailService.sendVerificationEmail(email, verificationToken);
    }

    // Update password
    if (currentPassword && newPassword) {
        // Check current password
        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: 'Current password is incorrect'
            });
        }

        user.password = newPassword;
    }

    await user.save();

    res.json({
        success: true,
        data: user
    });
});

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
export const verifyEmail = asyncHandler(async (req, res) => {
    const { token } = req.params;

    const user = await User.findOne({
        verificationToken: token,
        verificationExpires: { $gt: Date.now() }
    });

    if (!user) {
        return res.status(400).json({
            success: false,
            error: 'Invalid or expired verification token'
        });
    }

    // Mark email as verified
    user.emailVerified = true;
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationExpires = undefined;

    await user.save();

    res.json({
        success: true,
        message: 'Email verified successfully. You can now log in.'
    });
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json({
            success: false,
            error: 'User not found'
        });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetExpires;

    await user.save();

    // Send reset email
    await emailService.sendPasswordResetEmail(email, resetToken);

    res.json({
        success: true,
        message: 'Password reset email sent'
    });
});

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:resetToken
// @access  Public
export const resetPassword = asyncHandler(async (req, res) => {
    const { resetToken } = req.params;
    const { password } = req.body;

    // Find user with token
    const user = await User.findOne({
        resetPasswordToken: resetToken,
        resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
        return res.status(400).json({
            success: false,
            error: 'Invalid or expired token'
        });
    }

    // Update password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.json({
        success: true,
        message: 'Password reset successful'
    });
});

// @desc    Update notification settings
// @route   PUT /api/auth/notification-settings
// @access  Private
export const updateNotificationSettings = asyncHandler(async (req, res) => {
    const { email, securityAlerts, marketing } = req.body;

    const user = await User.findById(req.user.id);
    user.settings.notifications = {
        email,
        securityAlerts,
        marketing
    };

    await user.save();

    res.json({
        success: true,
        data: user.settings.notifications
    });
});

// @desc    Resend OTP for inactive account
// @route   POST /api/auth/resend-otp
// @access  Public
export const resendOTP = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json({
            success: false,
            error: 'User not found'
        });
    }

    // Check if user needs OTP (inactive for 30+ days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const isInactive = user.lastActive < thirtyDaysAgo;

    if (!isInactive) {
        return res.status(400).json({
            success: false,
            error: 'OTP not required for active accounts'
        });
    }

    // Check if OTP was sent recently (prevent spam)
    if (user.otp && user.otp.lastSent) {
        const timeSinceLastOTP = Date.now() - user.otp.lastSent.getTime();
        if (timeSinceLastOTP < 2 * 60 * 1000) { // 2 minutes
            return res.status(429).json({
                success: false,
                error: 'Please wait 2 minutes before requesting another OTP'
            });
        }
    }

    // Generate new OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.otp = {
        code: otpCode,
        expires: otpExpires,
        attempts: 0,
        lastSent: new Date()
    };

    try {
        await emailService.sendOTPEmail(user.email, otpCode, user.name);
        await user.save();

        res.json({
            success: true,
            message: 'OTP sent successfully'
        });
    } catch (error) {
        console.error('Failed to send OTP:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to send OTP. Please try again.'
        });
    }
});

// @desc    Manual email verification for testing
// @route   GET /api/auth/manual-verify/:userId
// @access  Public (for testing only)
export const manualVerifyEmail = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json({
            success: false,
            error: 'User not found'
        });
    }

    // Mark email as verified
    user.emailVerified = true;
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationExpires = undefined;

    await user.save();

    res.json({
        success: true,
        message: 'Email manually verified for testing. You can now log in.',
        data: {
            _id: user._id,
            name: user.name,
            email: user.email,
            emailVerified: user.emailVerified,
            isVerified: user.isVerified
        }
    });
});

// @desc    Google OAuth login/signup
// @route   POST /api/auth/google
// @access  Public
export const googleAuth = asyncHandler(async (req, res) => {
    const { idToken } = req.body;
    if (!idToken) {
        return res.status(400).json({ success: false, error: 'No ID token provided' });
    }
    let ticket;
    try {
        ticket = await googleClient.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID
        });
    } catch (err) {
        return res.status(401).json({ success: false, error: 'Invalid Google ID token' });
    }
    const payload = ticket.getPayload();
    const email = payload.email;
    const name = payload.name || email.split('@')[0];
    if (!email) {
        return res.status(400).json({ success: false, error: 'Google account has no email' });
    }
    let user = await User.findOne({ email });
    if (!user) {
        user = await User.create({
            name,
            email,
            password: crypto.randomBytes(16).toString('hex'), // random password
            emailVerified: true,
            isVerified: true
        });
    }
    // Generate token
    const token = generateToken(user._id);
    setTokenCookie(res, token);
    res.json({
        success: true,
        data: {
            _id: user._id,
            name: user.name,
            email: user.email,
            token
        }
    });
}); 