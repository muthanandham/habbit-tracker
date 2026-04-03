import mongoose from 'mongoose';
import { Logger } from '../utils/logger.js';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod: MongoMemoryServer | null = null;

const connectDB = async (): Promise<void> => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/life-os';

  try {
    // Attempt local connection
    Logger.info('⏳ Attempting to connect to MongoDB...');
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s
    });
    Logger.info(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    Logger.warn('❌ Local MongoDB connection failed. Starting in-memory fallback...');
    
    try {
      // Start Memory Server Fallback
      mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      await mongoose.connect(uri);
      Logger.info('🚀 In-memory MongoDB started and connected successfully!');
    } catch (innerError) {
      Logger.error('💀 Failed to start in-memory MongoDB:', innerError);
      process.exit(1);
    }
  }
};

mongoose.connection.on('disconnected', () => {
  Logger.warn('⚠️  MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  Logger.error(`❌ MongoDB Error: ${err.message}`);
});

export default connectDB;
