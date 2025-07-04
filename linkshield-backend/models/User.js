import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        trim: true,
        maxlength: [50, 'Name cannot be more than 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationToken: String,
    verificationExpires: Date,
    // OTP fields for inactive account verification
    otp: {
        code: String,
        expires: Date,
        attempts: {
            type: Number,
            default: 0
        },
        lastSent: Date
    },
    // Account activity tracking
    lastActive: {
        type: Date,
        default: Date.now,
    },
    // Force email verification on signup
    emailVerified: {
        type: Boolean,
        default: false
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    subscriptionPlan: {
        type: String,
        enum: ['free', 'pro', 'enterprise'],
        default: 'free'
    },
    settings: {
        notifications: {
            email: {
                type: Boolean,
                default: true
            },
            securityAlerts: {
                type: Boolean,
                default: true
            },
            marketing: {
                type: Boolean,
                default: false
            }
        }
    },
    loginHistory: [{
        timestamp: Date,
        ip: String,
        location: {
            country: String,
            city: String,
            latitude: Number,
            longitude: Number,
            isp: String,
            timezone: String
        },
        userAgent: String
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    notificationSettings: {
        email: {
            enabled: {
                type: Boolean,
                default: true,
            },
            securityAlerts: {
                type: Boolean,
                default: true,
            },
            linkAlerts: {
                type: Boolean,
                default: true,
            },
            marketing: {
                type: Boolean,
                default: false,
            },
        },
        push: {
            enabled: {
                type: Boolean,
                default: false,
            },
            securityAlerts: {
                type: Boolean,
                default: true,
            },
            linkAlerts: {
                type: Boolean,
                default: true,
            },
        },
    },
    apiKey: {
        key: String,
        name: String,
        createdAt: Date,
        lastUsed: Date,
        permissions: [{
            type: String,
            enum: ['read', 'write', 'delete'],
        }],
    },
    subscription: {
        plan: {
            type: String,
            enum: ['free', 'pro', 'enterprise'],
            default: 'free',
        },
        status: {
            type: String,
            enum: ['active', 'trial', 'expired', 'cancelled'],
            default: 'active',
        },
        startDate: {
            type: Date,
            default: Date.now,
        },
        endDate: Date,
        features: {
            maxLinks: {
                type: Number,
                default: 10,
            },
            customDomains: {
                type: Number,
                default: 0,
            },
            teamMembers: {
                type: Number,
                default: 1,
            },
            apiAccess: {
                type: Boolean,
                default: false,
            },
            advancedAnalytics: {
                type: Boolean,
                default: false,
            },
        },
    },
    metadata: {
        signupSource: {
            type: String,
            enum: ['web', 'mobile', 'api'],
            default: 'web',
        },
        signupDate: {
            type: Date,
            default: Date.now,
        },
        lastLogin: {
            type: Date,
            default: Date.now,
        },
        loginCount: {
            type: Number,
            default: 0,
        },
    },
}, {
    timestamps: true,
});

// Indexes
userSchema.index({ 'subscription.plan': 1, 'subscription.status': 1 });
userSchema.index({ 'metadata.lastLogin': -1 });

// Encrypt password using bcrypt
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Generate verification token
userSchema.methods.generateVerificationToken = function() {
    const token = crypto.randomBytes(32).toString('hex');
    this.verificationToken = token;
    this.verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    return token;
};

// Generate password reset token
userSchema.methods.generateResetToken = function() {
    const token = crypto.randomBytes(32).toString('hex');
    this.resetPasswordToken = token;
    this.resetPasswordExpires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour
    return token;
};

// Generate API key
userSchema.methods.generateApiKey = function(name, permissions) {
    const key = crypto.randomBytes(32).toString('hex');
    this.apiKey = {
        key,
        name,
        createdAt: new Date(),
        permissions: permissions || ['read'],
    };
    return key;
};

// Add login attempt to history
userSchema.methods.addLoginAttempt = async function(loginData) {
    const update = {
        $push: {
            loginHistory: {
                $each: [loginData],
                $slice: -10, // Keep only last 10 login attempts
            },
        },
        $set: {
            'metadata.lastLogin': new Date(),
        },
        $inc: {
            'metadata.loginCount': 1,
        },
    };

    if (loginData.isSuccessful) {
        update.$set.lastActive = new Date();
    }

    await this.updateOne(update);
};

// Check if user has reached link limit
userSchema.methods.hasReachedLinkLimit = async function() {
    const linkCount = await mongoose.model('Link').countDocuments({ user: this._id });
    return linkCount >= this.subscription.features.maxLinks;
};

// Check if user can create custom domain
userSchema.methods.canCreateCustomDomain = async function() {
    const domainCount = await mongoose.model('Domain').countDocuments({ user: this._id });
    return domainCount < this.subscription.features.customDomains;
};

// Check if user has access to a feature
userSchema.methods.hasFeatureAccess = function(feature) {
    return this.subscription.features[feature] === true;
};

// Check if subscription is active
userSchema.methods.hasActiveSubscription = function() {
    return (
        this.subscription.status === 'active' &&
        (!this.subscription.endDate || new Date() < this.subscription.endDate)
    );
};

const User = mongoose.model('User', userSchema);

export default User; 