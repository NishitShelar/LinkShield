import Link from '../models/Link.js';
import asyncHandler from '../utils/asyncHandler.js';
import trackerService from '../services/tracker.js';
import emailService from '../services/emailService.js';
import { nanoid } from 'nanoid';
import Click from '../models/Click.js';
import geolocationService from '../services/geolocationService.js';
import { isUrlSafe } from '../services/safeBrowsingService.js';

// @desc    Create new link
// @route   POST /api/links
// @access  Private
export const createLink = asyncHandler(async (req, res) => {
    const { originalUrl, customCode, title, description } = req.body;

    // Check if the URL is safe
    const safe = await isUrlSafe(originalUrl);
    if (!safe) {
        return res.status(400).json({
            success: false,
            error: 'This link is flagged as unsafe (phishing, scam, or malware) and cannot be shortened.'
        });
    }

    // Generate short code if not provided
    let shortCode = customCode;
    if (!shortCode) {
        shortCode = Math.random().toString(36).substring(2, 8);
    }

    // Check if short code already exists
    const existingLink = await Link.findOne({ shortCode });
    if (existingLink) {
        return res.status(400).json({
            success: false,
            error: 'Custom code already in use'
        });
    }

    // Build link data
    const linkData = {
        originalUrl,
        shortCode,
        title,
        description,
        isAnonymous: !req.user,
        ipAddress: req.ip
    };
    if (req.user) {
        linkData.user = req.user.id;
    }
    if (req.body.visitorId) {
        linkData.visitorId = req.body.visitorId;
    }

    // Create link
    const link = await Link.create(linkData);

    res.status(201).json({
        success: true,
        data: link
    });
});

// @desc    Get all links for user
// @route   GET /api/links
// @access  Private
export const getLinks = asyncHandler(async (req, res) => {
    const links = await Link.find({ user: req.user.id })
        .sort({ createdAt: -1 });

    // Fetch totalClicks for each link
    const linkIds = links.map(link => link._id);
    const clickCounts = await Click.aggregate([
        { $match: { link: { $in: linkIds } } },
        { $group: { _id: "$link", totalClicks: { $sum: 1 } } }
    ]);
    const clickCountMap = {};
    clickCounts.forEach(cc => {
        clickCountMap[cc._id.toString()] = cc.totalClicks;
    });

    // Attach analytics to each link
    const linksWithAnalytics = links.map(link => {
        const totalClicks = clickCountMap[link._id.toString()] || 0;
        return {
            ...link.toObject(),
            analytics: { totalClicks }
        };
    });

    res.json({
        success: true,
        data: linksWithAnalytics
    });
});

// @desc    Get single link
// @route   GET /api/links/:id
// @access  Private
export const getLink = asyncHandler(async (req, res) => {
    const link = await Link.findById(req.params.id);

    if (!link) {
        return res.status(404).json({
            success: false,
            error: 'Link not found'
        });
    }

    // Check if user owns the link or is admin
    if (link.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            error: 'Not authorized to access this link'
        });
    }

    res.json({
        success: true,
        data: link
    });
});

// @desc    Update link
// @route   PUT /api/links/:id
// @access  Private
export const updateLink = asyncHandler(async (req, res) => {
    const { title, description, status } = req.body;

    let link = await Link.findById(req.params.id);

    if (!link) {
        return res.status(404).json({
            success: false,
            error: 'Link not found'
        });
    }

    // Check if user owns the link or is admin
    if (link.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            error: 'Not authorized to update this link'
        });
    }

    // Update fields
    if (title) link.title = title;
    if (description) link.description = description;
    if (status) link.status = status;

    await link.save();

    res.json({
        success: true,
        data: link
    });
});

// @desc    Delete link
// @route   DELETE /api/links/:id
// @access  Private
export const deleteLink = asyncHandler(async (req, res) => {
    const link = await Link.findById(req.params.id);

    if (!link) {
        return res.status(404).json({
            success: false,
            error: 'Link not found'
        });
    }

    // Check if user owns the link or is admin
    if (link.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            error: 'Not authorized to delete this link'
        });
    }

    await link.remove();

    res.json({
        success: true,
        data: {}
    });
});

/**
 * @desc    Redirect to original URL
 * @route   GET /api/links/r/:shortCode
 * @access  Public
 */
export const redirectToOriginal = asyncHandler(async (req, res) => {
    const { shortCode } = req.params;

    // Find the link by shortCode
    const link = await Link.findOne({ shortCode });

    if (!link) {
        res.status(404);
        throw new Error('Link not found');
    }

    // Check if link is expired
    if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
        res.status(410);
        throw new Error('Link has expired');
    }

    // Check if link is disabled
    if (link.status === 'disabled') {
        res.status(410);
        throw new Error('Link has been disabled');
    }

    // Generate session ID for tracking
    const sessionId = req.session?.id || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
        // Track the click with full details using tracker service
        await trackerService.trackClick(link._id, req, sessionId);
    } catch (error) {
        console.error('Error tracking click:', error);
        // Don't fail the redirect if tracking fails
    }

    // Redirect to original URL
    res.redirect(link.originalUrl);
});

// Get link QR code
export const getLinkQR = asyncHandler(async (req, res) => {
    const { shortCode } = req.params;
    
    const link = await Link.findOne({
        shortCode,
        $or: [
            { user: req.user?._id },
            { isAnonymous: true, ipAddress: req.ip }
        ]
    });

    if (!link) {
        return res.status(404).json({
            success: false,
            message: 'Link not found'
        });
    }

    const shortUrl = `${req.protocol}://${req.get('host')}/${link.shortCode}`;
    
    // Generate QR code (you'll need to implement this or use a library)
    // For now, we'll just return the URL
    res.json({
        success: true,
        data: {
            url: shortUrl,
            qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shortUrl)}`
        }
    });
});

// @desc    Get link statistics
// @route   GET /api/links/:id/stats
// @access  Private
export const getLinkStats = asyncHandler(async (req, res) => {
    const link = await Link.findById(req.params.id);

    if (!link) {
        return res.status(404).json({
            success: false,
            error: 'Link not found'
        });
    }

    // Check if user owns the link or is admin
    if (link.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            error: 'Not authorized to access this link'
        });
    }

    const totalClicks = await Click.countDocuments({ link: link._id });

    // Get clicks by date (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const clicksByDate = await Click.aggregate([
        {
            $match: {
                link: link._id,
                createdAt: { $gte: thirtyDaysAgo }
            }
        },
        {
            $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                count: { $sum: 1 }
            }
        },
        {
            $sort: { _id: 1 }
        }
    ]);

    // Get clicks by country
    const clicksByCountry = await Click.aggregate([
        {
            $match: {
                link: link._id
            }
        },
        {
            $group: {
                _id: '$location.country',
                count: { $sum: 1 }
            }
        },
        {
            $sort: { count: -1 }
        }
    ]);

    // Get clicks by device
    const clicksByDevice = await Click.aggregate([
        {
            $match: {
                link: link._id
            }
        },
        {
            $group: {
                _id: '$device.type',
                count: { $sum: 1 }
            }
        },
        {
            $sort: { count: -1 }
        }
    ]);

    res.json({
        success: true,
        data: {
            link: {
                originalUrl: link.originalUrl,
                shortCode: link.shortCode,
                status: link.status,
                isFlagged: link.isFlagged,
                createdAt: link.createdAt
            },
            totalClicks,
            clicksByDate,
            clicksByCountry,
            clicksByDevice
        }
    });
});

// @desc    Create anonymous link
// @route   POST /api/links/anonymous
// @access  Public
export const createAnonymousLink = asyncHandler(async (req, res) => {
    const { originalUrl } = req.body;

    if (!originalUrl) {
        return res.status(400).json({
            success: false,
            error: 'Please provide a URL to shorten'
        });
    }

    // Generate short code
    const shortCode = Math.random().toString(36).substring(2, 8);

    // Create link
    const link = await Link.create({
        originalUrl,
        shortCode,
        isAnonymous: true,
        ipAddress: req.ip,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days expiry
    });

    res.status(201).json({
        success: true,
        data: {
            originalUrl: link.originalUrl,
            shortUrl: `${req.protocol}://${req.get('host')}/r/${link.shortCode}`,
            shortCode: link.shortCode,
            expiresAt: link.expiresAt
        }
    });
});
