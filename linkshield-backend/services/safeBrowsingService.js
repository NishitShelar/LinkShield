import axios from 'axios';
import crypto from 'crypto';

class SafeBrowsingService {
    constructor() {
        this.apiKey = process.env.GOOGLE_API_KEY;
        this.apiUrl = 'https://safebrowsing.googleapis.com/v4/threatMatches:find';
        this.clientId = 'linkshield-pro';
        this.clientVersion = '1.0.0';
    }

    async checkUrl(url) {
        try {
            // Generate hash of the URL
            const urlHash = this.generateUrlHash(url);
            
            const payload = {
                client: {
                    clientId: this.clientId,
                    clientVersion: this.clientVersion
                },
                threatInfo: {
                    threatTypes: [
                        'MALWARE',
                        'SOCIAL_ENGINEERING',
                        'UNWANTED_SOFTWARE',
                        'POTENTIALLY_HARMFUL_APPLICATION'
                    ],
                    platformTypes: ['ANY_PLATFORM'],
                    threatEntryTypes: ['URL'],
                    threatEntries: [
                        { url: url }
                    ]
                }
            };

            const response = await axios.post(
                `${this.apiUrl}?key=${this.apiKey}`,
                payload
            );

            // If response is empty, URL is safe
            if (!response.data || Object.keys(response.data).length === 0) {
                return {
                    isSafe: true,
                    threatTypes: [],
                    platformStatus: []
                };
            }

            // URL is not safe
            return {
                isSafe: false,
                threatTypes: response.data.matches.map(match => match.threatType),
                platformStatus: response.data.matches.map(match => match.platformType)
            };

        } catch (error) {
            console.error('Safe Browsing API Error:', error.message);
            
            // If it's an API key error or rate limit, we should be more cautious
            if (error.response?.status === 400 || error.response?.status === 429) {
                return {
                    isSafe: false,
                    threatTypes: ['API_ERROR'],
                    platformStatus: ['ERROR'],
                    error: error.message
                };
            }
            
            // For other errors, we'll assume the URL is safe but log the error
            return {
                isSafe: true,
                threatTypes: [],
                platformStatus: [],
                error: error.message
            };
        }
    }

    generateUrlHash(url) {
        return crypto.createHash('sha256')
            .update(url)
            .digest('hex');
    }

    // Batch check multiple URLs
    async checkUrls(urls) {
        const results = await Promise.all(
            urls.map(url => this.checkUrl(url))
        );

        return urls.reduce((acc, url, index) => {
            acc[url] = results[index];
            return acc;
        }, {});
    }

    // Check if a URL's safety status needs to be refreshed
    shouldRefreshCheck(lastChecked, cacheExpiry) {
        if (!lastChecked || !cacheExpiry) return true;
        
        const now = new Date();
        return now > new Date(cacheExpiry);
    }
}

export default new SafeBrowsingService();

const API_KEY = process.env.GOOGLE_SAFE_BROWSING_API_KEY;
const API_URL = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${API_KEY}`;

/**
 * Checks if a URL is safe using Google Safe Browsing API
 * @param {string} url
 * @returns {Promise<boolean>} true if safe, false if unsafe
 */
export async function isUrlSafe(url) {
    if (!API_KEY) {
        console.warn('GOOGLE_SAFE_BROWSING_API_KEY not set. Skipping safety check.');
        return true;
    }
    try {
        const body = {
            client: {
                clientId: 'linkshield-pro',
                clientVersion: '1.0.0'
            },
            threatInfo: {
                threatTypes: [
                    'MALWARE',
                    'SOCIAL_ENGINEERING',
                    'UNWANTED_SOFTWARE',
                    'POTENTIALLY_HARMFUL_APPLICATION'
                ],
                platformTypes: ['ANY_PLATFORM'],
                threatEntryTypes: ['URL'],
                threatEntries: [
                    { url }
                ]
            }
        };
        const response = await axios.post(API_URL, body);
        // If matches found, it's unsafe
        if (response.data && response.data.matches && response.data.matches.length > 0) {
            return false;
        }
        return true;
    } catch (error) {
        console.error('Safe Browsing API error:', error.message);
        // Fail open: allow link if API fails
        return true;
    }
} 