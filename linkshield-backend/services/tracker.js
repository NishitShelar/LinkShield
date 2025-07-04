import UAParser from 'ua-parser-js';
import Click from '../models/Click.js';
import Link from '../models/Link.js';
import geolocationService from './geolocationService.js';

class TrackerService {
    constructor() {
        this.uaParser = new UAParser();
    }

    async trackClick(linkId, req, sessionId) {
        const startTime = Date.now();
        
        try {
            console.log('Starting click tracking for link:', linkId);
            
            // Parse user agent
            const userAgent = req.headers['user-agent'] || 'Unknown';
            console.log('User Agent:', userAgent);
            
            const parsedUA = this.uaParser.setUA(userAgent).getResult();
            console.log('Parsed UA:', JSON.stringify(parsedUA, null, 2));
            
            // Get device type
            const deviceType = this.getDeviceType(parsedUA);
            console.log('Device Type:', deviceType);
            
            // Get IP address
            const ipAddress = this.getClientIP(req);
            console.log('IP Address:', ipAddress);
            
            // Get location data
            const location = await geolocationService.getLocation(ipAddress);
            console.log('Location:', location);
            
            // Get referrer
            const referrer = req.headers.referer || null;
            
            // Create click data
            const clickData = {
                link: linkId,
                sessionId,
                ipAddress,
                userAgent,
                referrer,
                location,
                device: {
                    type: deviceType,
                    browser: parsedUA.browser?.name || 'Unknown',
                    os: parsedUA.os?.name || 'Unknown'
                },
                metadata: {
                    screenResolution: req.headers['sec-ch-viewport-width'] 
                        ? `${req.headers['sec-ch-viewport-width']}x${req.headers['sec-ch-viewport-height']}`
                        : null,
                    language: req.headers['accept-language'],
                    platform: parsedUA.platform?.type || 'Unknown',
                    doNotTrack: req.headers['dnt'] === '1',
                    adBlock: this.detectAdBlock(req)
                }
            };

            console.log('Click Data:', JSON.stringify(clickData, null, 2));

            // Create click record
            const click = await Click.create(clickData);
            console.log('Click created:', click._id);
            
            // Update link analytics
            await this.updateLinkAnalytics(linkId, clickData);
            console.log('Link analytics updated');
            
            // Calculate response time
            const responseTime = Date.now() - startTime;
            click.responseTime = responseTime;
            await click.save();

            console.log('Click tracking completed successfully');
            return click;

        } catch (error) {
            console.error('Click Tracking Error:', error);
            console.error('Error stack:', error.stack);
            throw error;
        }
    }

    getDeviceType(parsedUA) {
        // Check if device object exists and has type
        if (parsedUA.device && parsedUA.device.type) {
            return parsedUA.device.type;
        }
        
        // Fallback to OS-based detection
        if (parsedUA.os && parsedUA.os.name) {
        if (parsedUA.os.name === 'iOS' || parsedUA.os.name === 'Android') {
            return 'mobile';
        }
        
        if (parsedUA.os.name === 'iPadOS') {
            return 'tablet';
            }
        }
        
        // Default to desktop
        return 'desktop';
    }

    getClientIP(req) {
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
    }

    isBot(parsedUA) {
        const botPatterns = [
            /bot/i,
            /crawler/i,
            /spider/i,
            /slurp/i,
            /search/i,
            /mediapartners/i,
            /nagios/i,
            /monitoring/i,
            /pingdom/i
        ];
        
        const ua = parsedUA.ua || '';
        const browserName = parsedUA.browser?.name || '';
        
        return botPatterns.some(pattern => 
            pattern.test(ua) || 
            pattern.test(browserName)
        );
    }

    detectAdBlock(req) {
        // This is a simple check - in production you'd want a more sophisticated method
        return req.headers['x-adblock'] === 'true';
    }

    async updateLinkAnalytics(linkId, clickData) {
        try {
            const link = await Link.findById(linkId);
            if (!link) return;

            // Update link analytics using the correct method
            await link.updateAnalytics(clickData);
            
            // If the link is anonymous, check if we need to disable it
            if (link.isAnonymous) {
                const anonymousClicks = await Click.countDocuments({
                    link: linkId,
                    createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
                });
                
                if (anonymousClicks >= 3) {
                    link.status = 'disabled';
                    await link.save();
                }
            }

        } catch (error) {
            console.error('Link Analytics Update Error:', error);
            throw error;
        }
    }

    async getClickStats(linkId, timeRange = '7d') {
        try {
            const [clickStats, deviceStats, geoStats] = await Promise.all([
                Click.getStats(linkId, timeRange),
                Click.getDeviceStats(linkId),
                Click.getGeoStats(linkId)
            ]);

            return {
                clickStats,
                deviceStats,
                geoStats
            };
        } catch (error) {
            console.error('Stats Retrieval Error:', error);
            throw error;
        }
    }
}

export default new TrackerService(); 