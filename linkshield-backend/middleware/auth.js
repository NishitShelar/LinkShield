import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Link from '../models/Link.js';
import asyncHandler from '../utils/asyncHandler.js';

// Protect routes - verify JWT token
export const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        // Set token from Bearer token in header
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.token) {
        // Set token from cookie
        token = req.cookies.token;
    }

    // Make sure token exists
    if (!token) {
        return res.status(401).json({
            success: false,
            error: 'Not authorized to access this route'
        });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = await User.findById(decoded.id);

        // Check if user is verified (email verification is now required for all users)
        if (!req.user.emailVerified) {
            return res.status(403).json({
                success: false,
                error: 'Please verify your email address before accessing this route'
            });
        }

        next();
    } catch (err) {
        return res.status(401).json({
            success: false,
            error: 'Not authorized to access this route'
        });
    }
});

// Grant access to specific roles
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: `User role ${req.user.role} is not authorized to access this route`
            });
        }
        next();
    };
};

// Check if user is authenticated (but don't require it)
export const optionalAuth = asyncHandler(async (req, res, next) => {
    let token;

    if (req.cookies.token) {
        token = req.cookies.token;
    } else if (req.headers.authorization?.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id);
            if (user) {
                req.user = user;
            }
        } catch (error) {
            // Token is invalid but we don't want to block the request
            console.error('Optional auth error:', error.message);
        }
    }

    next();
});

// Rate limiting middleware
export const rateLimit = (windowMs = 15 * 60 * 1000, max = 100) => {
    const requests = new Map();

    return (req, res, next) => {
        const ip = req.ip;
        const now = Date.now();
        const windowStart = now - windowMs;

        // Clean up old requests
        for (const [key, timestamp] of requests.entries()) {
            if (timestamp < windowStart) {
                requests.delete(key);
            }
        }

        // Count requests in current window
        const requestCount = Array.from(requests.values())
            .filter(timestamp => timestamp > windowStart)
            .length;

        if (requestCount >= max) {
            return res.status(429).json({
                success: false,
                message: 'Too many requests, please try again later'
            });
        }

        // Add current request
        requests.set(ip, now);
        next();
    };
};

// Check if user has reached anonymous link limit
export const checkAnonymousLimit = asyncHandler(async (req, res, next) => {
    if (!req.user) {
        const visitorId = req.body.visitorId;
        let query = {
            isAnonymous: true,
            createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        };
        if (visitorId) {
            query.visitorId = visitorId;
        } else {
            query.ipAddress = req.ip;
        }
        const linkCount = await Link.countDocuments(query);

        if (linkCount >= 3) {
            return res.status(403).json({
                success: false,
                message: 'Anonymous users are limited to 3 links per 24 hours. Please sign up for unlimited access.'
            });
        }
    }
    next();
}); 