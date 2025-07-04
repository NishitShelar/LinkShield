import mongoose from 'mongoose';

const clickSchema = new mongoose.Schema({
    link: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Link',
        required: true
    },
    ipAddress: {
        type: String,
        required: true
    },
    userAgent: {
        type: String,
        required: true
    },
    device: {
        type: {
            type: String,
            enum: ['desktop', 'mobile', 'tablet', 'other'],
            default: 'other'
        },
        browser: String,
        os: String
    },
    location: {
        country: String,
        countryCode: String,
        region: String,
        city: String,
        lat: Number,
        lon: Number,
        isp: String,
        timezone: String
    },
    referrer: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Add indexes for better query performance
clickSchema.index({ link: 1, createdAt: -1 });
clickSchema.index({ createdAt: -1 });
clickSchema.index({ 'location.country': 1 });

const Click = mongoose.model('Click', clickSchema);

export default Click; 