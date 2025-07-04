import asyncHandler from '../utils/asyncHandler.js';
import User from '../models/User.js';
import Link from '../models/Link.js';
import Click from '../models/Click.js';

// @desc    Get platform statistics
// @route   GET /api/analytics/platform
// @access  Private/Admin
export const getPlatformStats = asyncHandler(async (req, res) => {
    const totalUsers = await User.countDocuments();
    const totalLinks = await Link.countDocuments();
    const totalClicks = await Click.countDocuments();
    const activeLinks = await Link.countDocuments({ status: 'active' });
    const flaggedLinks = await Link.countDocuments({ isFlagged: true });

    // Get clicks by date (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const clicksByDate = await Click.aggregate([
        {
            $match: {
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

    // Get top countries
    const topCountries = await Click.aggregate([
        {
            $group: {
                _id: '$location.country',
                count: { $sum: 1 }
            }
        },
        {
            $sort: { count: -1 }
        },
        {
            $limit: 10
        }
    ]);

    res.json({
        success: true,
        data: {
            totalUsers,
            totalLinks,
            totalClicks,
            activeLinks,
            flaggedLinks,
            clicksByDate,
            topCountries
        }
    });
});

// @desc    Get user statistics
// @route   GET /api/analytics/user
// @access  Private
export const getUserStats = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const totalLinks = await Link.countDocuments({ user: userId });
    const totalClicks = await Click.countDocuments({ link: { $in: await Link.find({ user: userId }).select('_id') } });
    const activeLinks = await Link.countDocuments({ user: userId, status: 'active' });
    const flaggedLinks = await Link.countDocuments({ user: userId, isFlagged: true });

    // Get clicks by date (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const userLinks = await Link.find({ user: userId }).select('_id');
    const clicksByDate = await Click.aggregate([
        {
            $match: {
                link: { $in: userLinks },
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

    // Get top performing links
    const topLinks = await Click.aggregate([
        {
            $match: {
                link: { $in: userLinks }
            }
        },
        {
            $group: {
                _id: '$link',
                count: { $sum: 1 }
            }
        },
        {
            $sort: { count: -1 }
        },
        {
            $limit: 5
        },
        {
            $lookup: {
                from: 'links',
                localField: '_id',
                foreignField: '_id',
                as: 'linkDetails'
            }
        },
        {
            $unwind: '$linkDetails'
        }
    ]);

    res.json({
        success: true,
        data: {
            totalLinks,
            totalClicks,
            activeLinks,
            flaggedLinks,
            clicksByDate,
            topLinks
        }
    });
});

// @desc    Get link statistics
// @route   GET /api/analytics/link/:id
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