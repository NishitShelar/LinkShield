import asyncHandler from '../utils/asyncHandler.js';
import User from '../models/User.js';
import Link from '../models/Link.js';
import Click from '../models/Click.js';
import Feedback from '../models/Feedback.js';

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
export const getDashboardStats = asyncHandler(async (req, res) => {
    console.log('Fetching dashboard stats...');
    
    const totalUsers = await User.countDocuments();
    const totalLinks = await Link.countDocuments();
    const totalClicks = await Click.countDocuments();
    const activeLinks = await Link.countDocuments({ status: 'active' });
    const flaggedLinks = await Link.countDocuments({ 'safetyStatus.isSafe': false });

    console.log('Dashboard stats:', {
        totalUsers,
        totalLinks,
        totalClicks,
        activeLinks,
        flaggedLinks
    });

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

    // Get top countries by clicks
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

    console.log('Analytics data:', {
        clicksByDate: clicksByDate.length,
        topCountries: topCountries.length
    });

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

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getUsers = asyncHandler(async (req, res) => {
    const users = await User.find()
        .select('-password')
        .sort({ createdAt: -1 });

    res.json({
        success: true,
        data: users
    });
});

// @desc    Get single user
// @route   GET /api/admin/users/:id
// @access  Private/Admin
export const getUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id)
        .select('-password');

    if (!user) {
        return res.status(404).json({
            success: false,
            error: 'User not found'
        });
    }

    res.json({
        success: true,
        data: user
    });
});

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
export const updateUser = asyncHandler(async (req, res) => {
    const { name, email, role, isVerified, subscriptionPlan } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
        return res.status(404).json({
            success: false,
            error: 'User not found'
        });
    }

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (typeof isVerified === 'boolean') user.isVerified = isVerified;
    if (subscriptionPlan) user.subscriptionPlan = subscriptionPlan;

    await user.save();

    res.json({
        success: true,
        data: user
    });
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return res.status(404).json({
            success: false,
            error: 'User not found'
        });
    }

    // Delete all user's links
    await Link.deleteMany({ user: user._id });

    // Delete user
    await user.remove();

    res.json({
        success: true,
        data: {}
    });
});

// @desc    Get all links
// @route   GET /api/admin/links
// @access  Private/Admin
export const getLinks = asyncHandler(async (req, res) => {
    // Get links with user data
    const links = await Link.find()
        .populate('user', 'name email')
        .sort({ createdAt: -1 });

    // Get click counts for each link
    const clickCounts = await Click.aggregate([
        {
            $group: {
                _id: '$link',
                totalClicks: { $sum: 1 }
            }
        }
    ]);

    // Create a map of link ID to click count
    const clickCountMap = {};
    clickCounts.forEach(item => {
        clickCountMap[item._id.toString()] = item.totalClicks;
    });

    // Add analytics data to each link
    const linksWithAnalytics = links.map(link => {
        const linkObj = link.toObject();
        linkObj.analytics = {
            totalClicks: clickCountMap[link._id.toString()] || 0
        };
        return linkObj;
    });

    res.json({
        success: true,
        data: linksWithAnalytics
    });
});

// @desc    Get single link
// @route   GET /api/admin/links/:id
// @access  Private/Admin
export const getLink = asyncHandler(async (req, res) => {
    const link = await Link.findById(req.params.id)
        .populate('user', 'name email');

    if (!link) {
        return res.status(404).json({
            success: false,
            error: 'Link not found'
        });
    }

    res.json({
        success: true,
        data: link
    });
});

// @desc    Update link
// @route   PUT /api/admin/links/:id
// @access  Private/Admin
export const updateLink = asyncHandler(async (req, res) => {
    const { title, description, status, isFlagged } = req.body;

    const link = await Link.findById(req.params.id);

    if (!link) {
        return res.status(404).json({
            success: false,
            error: 'Link not found'
        });
    }

    // Update fields
    if (title) link.title = title;
    if (description) link.description = description;
    if (status) link.status = status;
    if (typeof isFlagged === 'boolean') link.isFlagged = isFlagged;

    await link.save();

    res.json({
        success: true,
        data: link
    });
});

// @desc    Delete link
// @route   DELETE /api/admin/links/:id
// @access  Private/Admin
export const deleteLink = asyncHandler(async (req, res) => {
    const link = await Link.findById(req.params.id);

    if (!link) {
        return res.status(404).json({
            success: false,
            error: 'Link not found'
        });
    }

    // Delete all clicks for this link
    await Click.deleteMany({ link: link._id });

    // Delete link
    await link.remove();

    res.json({
        success: true,
        data: {}
    });
});

// @desc    Get all clicks for a link
// @route   GET /api/admin/links/:id/clicks
// @access  Private/Admin
export const getLinkClicks = asyncHandler(async (req, res) => {
    const clicks = await Click.find({ link: req.params.id }).sort({ createdAt: -1 });
    res.json({
        success: true,
        data: clicks
    });
}); 

// Create feedback (public, now in feedbackRoutes.js)
export const createFeedback = async (req, res) => {
  try {
    const { feedback } = req.body;
    const user = req.user ? req.user._id : undefined;
    const fb = await Feedback.create({ message: feedback, user });
    res.status(201).json({ success: true, data: fb });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to submit feedback' });
  }
};

// Get all feedback (admin)
export const getAllFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 }).populate('user', 'name email');
    res.json({ success: true, data: feedbacks });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch feedback' });
  }
}; 