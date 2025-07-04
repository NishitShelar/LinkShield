import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';
dotenv.config();

// Debug logging
console.log('Environment variables:', {
    SENDGRID_API_KEY: process.env.SENDGRID_API_KEY ? 'Present' : 'Missing',
    NODE_ENV: process.env.NODE_ENV,
    CLIENT_URL: process.env.CLIENT_URL,
    FROM_EMAIL: process.env.FROM_EMAIL
});

// Initialize SendGrid
const initializeSendGrid = () => {
    const apiKey = process.env.SENDGRID_API_KEY;
    console.log('SendGrid initialization:', {
        apiKeyPresent: !!apiKey,
        apiKeyFormat: apiKey ? `${apiKey.substring(0, 5)}...` : 'none',
        fromEmail: process.env.FROM_EMAIL
    });

    if (!apiKey) {
        console.warn('SENDGRID_API_KEY is not set. Email service will be disabled.');
        return false;
    }

    if (!apiKey.startsWith('SG.')) {
        console.warn('Invalid SENDGRID_API_KEY format. API key should start with "SG."');
        return false;
    }

    try {
        sgMail.setApiKey(apiKey);
        console.log('SendGrid initialized successfully');
        return true;
    } catch (error) {
        console.error('Error initializing SendGrid:', error);
        return false;
    }
};

const isSendGridInitialized = initializeSendGrid();

const sendVerificationEmail = async (email, token) => {
    if (!isSendGridInitialized) {
        throw new Error('Email service is not initialized');
    }

    const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${token}`;
    const fromEmail = process.env.FROM_EMAIL;

    if (!fromEmail) {
        throw new Error('FROM_EMAIL is not configured');
    }

    const msg = {
        to: email,
        from: fromEmail,
        subject: 'Verify Your Email',
        html: `
            <h1>Email Verification</h1>
            <p>Please click the link below to verify your email address:</p>
            <a href="${verificationUrl}">${verificationUrl}</a>
            <p>This link will expire in 24 hours.</p>
        `
    };

    try {
        await sgMail.send(msg);
        console.log(`Verification email sent to ${email}`);
    } catch (error) {
        console.error('Error sending verification email:', error);
        throw new Error('Failed to send verification email');
    }
};

const sendPasswordResetEmail = async (email, token) => {
    if (!isSendGridInitialized) {
        throw new Error('Email service is not initialized');
    }

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;
    const fromEmail = process.env.FROM_EMAIL;

    if (!fromEmail) {
        throw new Error('FROM_EMAIL is not configured');
    }

    const msg = {
        to: email,
        from: fromEmail,
        subject: 'Password Reset Request',
        html: `
            <h1>Password Reset</h1>
            <p>You requested a password reset. Please click the link below to reset your password:</p>
            <a href="${resetUrl}">${resetUrl}</a>
            <p>This link will expire in 10 minutes.</p>
            <p>If you did not request this, please ignore this email.</p>
        `
    };

    try {
        await sgMail.send(msg);
        console.log(`Password reset email sent to ${email}`);
    } catch (error) {
        console.error('Error sending password reset email:', error);
        throw new Error('Failed to send password reset email');
    }
};

const sendSecurityAlert = async (email, alert) => {
    if (!isSendGridInitialized) {
        throw new Error('Email service is not initialized');
    }

    const fromEmail = process.env.FROM_EMAIL;

    if (!fromEmail) {
        throw new Error('FROM_EMAIL is not configured');
    }

    const msg = {
        to: email,
        from: fromEmail,
        subject: 'Security Alert',
        html: `
            <h1>Security Alert</h1>
            <p>We detected a new login to your account from:</p>
            <ul>
                <li>Location: ${alert.location.city}, ${alert.location.country}</li>
                <li>Time: ${new Date(alert.timestamp).toLocaleString()}</li>
            </ul>
            <p>If this was you, you can ignore this email. If not, please secure your account immediately.</p>
        `
    };

    try {
        await sgMail.send(msg);
        console.log(`Security alert sent to ${email}`);
    } catch (error) {
        console.error('Error sending security alert:', error);
        throw new Error('Failed to send security alert');
    }
};

const sendOTPEmail = async (email, otpCode, userName) => {
    if (!isSendGridInitialized) {
        throw new Error('Email service is not initialized');
    }

    const fromEmail = process.env.FROM_EMAIL;

    if (!fromEmail) {
        throw new Error('FROM_EMAIL is not configured');
    }

    const msg = {
        to: email,
        from: fromEmail,
        subject: 'Account Verification Required - OTP Code',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #333;">Account Verification Required</h1>
                <p>Hello ${userName},</p>
                <p>Your account has been inactive for a while. To ensure your account security, please verify your identity using the OTP code below:</p>
                
                <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
                    <h2 style="color: #007bff; font-size: 32px; letter-spacing: 8px; margin: 0;">${otpCode}</h2>
                </div>
                
                <p><strong>This OTP code will expire in 10 minutes.</strong></p>
                
                <p>If you didn't attempt to log in, please ignore this email and consider changing your password.</p>
                
                <p>Best regards,<br>LinkShield Team</p>
            </div>
        `
    };

    try {
        await sgMail.send(msg);
        console.log(`OTP email sent to ${email}`);
    } catch (error) {
        console.error('Error sending OTP email:', error);
        throw new Error('Failed to send OTP email');
    }
};

export default {
    sendVerificationEmail,
    sendPasswordResetEmail,
    sendSecurityAlert,
    sendOTPEmail
}; 