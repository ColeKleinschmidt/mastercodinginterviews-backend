import mongoose from 'mongoose';
import env from './env.js';

export const connectDB = async (): Promise<typeof mongoose> => {
  try {
    const connection = await mongoose.connect(env.MONGO_URL);
    console.log('Connected to MongoDB');
    return connection;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};
