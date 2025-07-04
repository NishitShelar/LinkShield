import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Link from '../models/Link.js';
import connectDB from '../config/db.js';

dotenv.config();

// Connect to database
connectDB();

const adminEmail = process.env.ADMIN_EMAIL || 'admin@linkshield.pro';
const adminPassword = process.env.ADMIN_PASSWORD || 'admin@2107';

// Admin user data
const adminUser = {
    name: 'Admin User',
    email: adminEmail,
    password: adminPassword,
    role: 'admin',
    isVerified: true,
    subscriptionPlan: 'enterprise',
    settings: {
        notifications: {
            email: true,
            securityAlerts: true,
            marketing: false
        }
    }
};

// Sample users
const sampleUsers = [
    {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'user',
        isVerified: true,
        subscriptionPlan: 'pro',
        settings: {
            notifications: {
                email: true,
                securityAlerts: true,
                marketing: false
            }
        }
    },
    {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'password123',
        role: 'user',
        isVerified: true,
        subscriptionPlan: 'free',
        settings: {
            notifications: {
                email: true,
                securityAlerts: true,
                marketing: true
            }
        }
    }
];

// Sample links
const sampleLinks = [
    {
        originalUrl: 'https://www.google.com',
        shortCode: 'google',
        customAlias: 'google',
        tags: ['search', 'tech'],
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        isEnabled: true,
        safetyStatus: {
            isSafe: true,
            lastChecked: new Date(),
            threatTypes: [],
            platformStatus: 'unknown'
        }
    },
    {
        originalUrl: 'https://www.github.com',
        shortCode: 'github',
        customAlias: 'github',
        tags: ['development', 'tech'],
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
        isEnabled: true,
        safetyStatus: {
            isSafe: true,
            lastChecked: new Date(),
            threatTypes: [],
            platformStatus: 'unknown'
        }
    }
];

// Sample clicks
const sampleClicks = [
    {
        device: {
            type: 'desktop',
            browser: 'Chrome',
            os: 'Windows',
            version: '120.0.0'
        },
        location: {
            country: 'United States',
            city: 'New York',
            latitude: 40.7128,
            longitude: -74.0060
        },
        referrer: 'https://www.google.com',
        timestamp: new Date()
    },
    {
        device: {
            type: 'mobile',
            browser: 'Safari',
            os: 'iOS',
            version: '17.0.0'
        },
        location: {
            country: 'United Kingdom',
            city: 'London',
            latitude: 51.5074,
            longitude: -0.1278
        },
        referrer: 'https://www.facebook.com',
        timestamp: new Date()
    }
];

async function seedAdmin() {
    await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    await User.updateOne(
        { email: adminEmail },
        {
            $set: {
                name: 'Admin',
                password: hashedPassword,
                role: 'admin',
                emailVerified: true,
            }
        },
        { upsert: true }
    );
    console.log('Admin user upserted:', adminEmail);

    await mongoose.disconnect();
    process.exit();
}

async function seedDatabase() {
    try {
        // Clear existing data
        await User.deleteMany({});
        await Link.deleteMany({});

        // Hash passwords
        const hashedAdminPassword = await bcrypt.hash(adminUser.password, 10);
        const hashedSamplePasswords = await Promise.all(
            sampleUsers.map(user => bcrypt.hash(user.password, 10))
        );

        // Create admin user
        const admin = await User.create({
            ...adminUser,
            password: hashedAdminPassword
        });

        // Create sample users
        const users = await Promise.all(
            sampleUsers.map((user, index) => 
                User.create({
                    ...user,
                    password: hashedSamplePasswords[index]
                })
            )
        );

        // Create sample links
        const links = await Promise.all(
            sampleLinks.map((link, index) => 
                Link.create({
                    ...link,
                    userId: users[index % users.length]._id,
                    clicks: sampleClicks.map(click => ({
                        ...click,
                        sessionId: `session_${index}_${Date.now()}`
                    }))
                })
            )
        );

        console.log('Database seeded successfully!');
        console.log('Admin user created:', admin.email);
        console.log('Sample users created:', users.length);
        console.log('Sample links created:', links.length);

        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
}

seedAdmin().catch((err) => {
    console.error('Error seeding admin user:', err);
    process.exit(1);
});

//seedDatabase(); 