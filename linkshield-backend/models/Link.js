import mongoose from 'mongoose';
import { nanoid } from 'nanoid';

const linkSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        index: true,
    },
    shortCode: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    originalUrl: {
        type: String,
        required: true,
        trim: true,
    },
    customAlias: {
        type: String,
        sparse: true,
        trim: true,
    },
    title: {
        type: String,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    tags: [{
        type: String,
        trim: true,
    }],
    status: {
        type: String,
        enum: ['active', 'disabled', 'flagged'],
        default: 'active',
        index: true,
    },
    safetyStatus: {
        isSafe: {
            type: Boolean,
            default: true,
        },
        lastChecked: {
            type: Date,
            default: Date.now,
        },
        threatTypes: [{
            type: String,
        }],
        platformStatus: {
            type: String,
            enum: ['safe', 'unsafe', 'unknown'],
            default: 'unknown',
        },
    },
    expiresAt: {
        type: Date,
        index: true,
    },
    isAnonymous: {
        type: Boolean,
        default: false,
    },
    ipAddress: {
        type: String,
    },
    password: {
        type: String,
        select: false,
    },
    maxClicks: {
        type: Number,
        min: 0,
    },
    clickCount: {
        type: Number,
        default: 0,
    },
    analytics: {
        totalClicks: {
            type: Number,
            default: 0,
        },
        uniqueVisitors: {
            type: Number,
            default: 0,
        },
        lastClicked: {
            type: Date,
        },
        countries: [{
            country: String,
            count: Number,
        }],
        devices: [{
            type: String,
            count: Number,
        }],
    },
    metadata: {
        createdAt: {
            type: Date,
            default: Date.now,
        },
        lastModified: {
            type: Date,
            default: Date.now,
        },
        createdBy: {
            type: String,
            enum: ['api', 'web', 'mobile'],
            default: 'web',
        },
    },
    visitorId: {
        type: String,
        index: true,
    },
}, {
    timestamps: true,
});

// Indexes
linkSchema.index({ user: 1, createdAt: -1 });
linkSchema.index({ status: 1, expiresAt: 1 });
linkSchema.index({ 'safetyStatus.isSafe': 1, 'safetyStatus.lastChecked': 1 });

// Generate short code before saving
linkSchema.pre('save', async function(next) {
    if (this.isNew && !this.shortCode) {
        let isUnique = false;
        let attempts = 0;
        const maxAttempts = 5;

        while (!isUnique && attempts < maxAttempts) {
            const shortCode = nanoid(8);
            const existingLink = await this.constructor.findOne({ shortCode });
            if (!existingLink) {
                this.shortCode = shortCode;
                isUnique = true;
            }
            attempts++;
        }

        if (!isUnique) {
            throw new Error('Failed to generate unique short code');
        }
    }

    if (this.isModified('originalUrl')) {
        this.metadata.lastModified = new Date();
    }

    next();
});

// Update analytics when a click is recorded
linkSchema.methods.updateAnalytics = async function(clickData) {
    const update = {
        $inc: {
            'analytics.totalClicks': 1,
            clickCount: 1,
        },
        $set: {
            'analytics.lastClicked': new Date(),
        },
    };

    // Update unique visitors count
    if (clickData.isUniqueVisitor) {
        update.$inc['analytics.uniqueVisitors'] = 1;
    }

    // Update country statistics
    if (clickData.location?.country) {
        const countryIndex = this.analytics.countries.findIndex(
            (c) => c.country === clickData.location.country,
        );

        if (countryIndex === -1) {
            update.$push = {
                'analytics.countries': {
                    country: clickData.location.country,
                    count: 1,
                },
            };
        } else {
            update.$inc[`analytics.countries.${countryIndex}.count`] = 1;
        }
    }

    // Update device statistics
    if (clickData.device?.type) {
        const deviceIndex = this.analytics.devices.findIndex(
            (d) => d.type === clickData.device.type,
        );

        if (deviceIndex === -1) {
            update.$push = {
                'analytics.devices': {
                    type: clickData.device.type,
                    count: 1,
                },
            };
        } else {
            update.$inc[`analytics.devices.${deviceIndex}.count`] = 1;
        }
    }

    await this.updateOne(update);
};

// Check if link is expired
linkSchema.methods.isExpired = function() {
    return this.expiresAt && new Date() > this.expiresAt;
};

// Check if link has reached max clicks
linkSchema.methods.hasReachedMaxClicks = function() {
    return this.maxClicks && this.clickCount >= this.maxClicks;
};

// Check if link is accessible
linkSchema.methods.isAccessible = function() {
    return (
        this.status === 'active' &&
        !this.isExpired() &&
        !this.hasReachedMaxClicks() &&
        this.safetyStatus.isSafe
    );
};

const Link = mongoose.model('Link', linkSchema);

export default Link;