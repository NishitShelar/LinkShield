import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

async function deleteAllUsers() {
    await mongoose.connect(process.env.MONGODB_URI);
    const result = await User.deleteMany({});
    console.log(`Deleted ${result.deletedCount} users.`);
    await mongoose.disconnect();
}

deleteAllUsers(); 