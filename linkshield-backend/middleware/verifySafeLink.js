import safeBrowsingService from '../services/safeBrowsingService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import Link from '../models/Link.js';

export const verifySafeLink = asyncHandler(async (req, res, next) => {
    const { originalUrl } = req.body;

    if (!originalUrl) {
        return res.status(400).json({
            success: false,
            message: 'URL is required'
        });
    }

    try {
        // Check if URL is already in database and safety status is still valid
        const existingLink = await Link.findOne({ originalUrl });
        
        if (existingLink && existingLink.safetyStatus.lastChecked) {
            const needsRefresh = safeBrowsingService.shouldRefreshCheck(
                existingLink.safetyStatus.lastChecked,
                existingLink.safetyStatus.cacheExpiry
            );

            if (!needsRefresh) {
                req.linkSafetyStatus = existingLink.safetyStatus;
                return next();
            }
        }

        // Check URL safety
        const safetyStatus = await safeBrowsingService.checkUrl(originalUrl);
        
        // Store safety status in request for later use
        req.linkSafetyStatus = safetyStatus;

        // If URL is not safe, return error
        if (!safetyStatus.isSafe) {
            return res.status(400).json({
                success: false,
                message: 'This URL has been flagged as potentially unsafe',
                details: {
                    threatTypes: safetyStatus.threatTypes,
                    platformStatus: safetyStatus.platformStatus
                }
            });
        }

        next();
    } catch (error) {
        console.error('Link Safety Check Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error checking URL safety'
        });
    }
});

// Middleware to check if a link is safe before redirecting
export const checkLinkSafety = asyncHandler(async (req, res, next) => {
    const { shortCode } = req.params;

    try {
        const link = await Link.findOne({ shortCode });
        
        if (!link) {
            return res.status(404).json({
                success: false,
                message: 'Link not found'
            });
        }

        // If link is disabled, return error
        if (link.status === 'disabled') {
            return res.status(403).json({
                success: false,
                message: 'This link has been disabled'
            });
        }

        // If link is flagged, check if safety status needs refresh
        if (link.status === 'flagged') {
            const needsRefresh = safeBrowsingService.shouldRefreshCheck(
                link.safetyStatus.lastChecked,
                link.safetyStatus.cacheExpiry
            );

            if (needsRefresh) {
                const safetyStatus = await safeBrowsingService.checkUrl(link.originalUrl);
                await link.updateSafetyStatus(safetyStatus);
                
                if (!safetyStatus.isSafe) {
                    return res.status(403).json({
                        success: false,
                        message: 'This link has been flagged as unsafe',
                        details: {
                            threatTypes: safetyStatus.threatTypes,
                            platformStatus: safetyStatus.platformStatus
                        }
                    });
                }
            } else if (!link.safetyStatus.isSafe) {
                return res.status(403).json({
                    success: false,
                    message: 'This link has been flagged as unsafe',
                    details: {
                        threatTypes: link.safetyStatus.threatTypes,
                        platformStatus: link.safetyStatus.platformStatus
                    }
                });
            }
        }

        // Add link to request for later use
        req.link = link;
        next();
    } catch (error) {
        console.error('Link Safety Check Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error checking link safety'
        });
    }
}); 