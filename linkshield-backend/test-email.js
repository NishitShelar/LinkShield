import dotenv from 'dotenv';
import emailService from './services/emailService.js';

// Load environment variables
dotenv.config();

console.log('=== Email Service Test ===');
console.log('Environment variables:');
console.log('- SENDGRID_API_KEY:', process.env.SENDGRID_API_KEY ? 'Present' : 'Missing');
console.log('- FROM_EMAIL:', process.env.FROM_EMAIL || 'Missing');
console.log('- CLIENT_URL:', process.env.CLIENT_URL || 'Missing');

async function testEmail() {
    try {
        console.log('\n=== Testing Email Service ===');
        
        // Test verification email
        const testToken = 'test-token-123';
        await emailService.sendVerificationEmail('nishit.shelar23@vit.edu', testToken);
        
        console.log('✅ Email test successful!');
        console.log('Check your email inbox for the test email.');
        
    } catch (error) {
        console.error('❌ Email test failed:', error.message);
        console.error('Full error:', error);
        
        if (error.response) {
            console.error('SendGrid API Error:', error.response.body);
        }
    }
}

testEmail(); 