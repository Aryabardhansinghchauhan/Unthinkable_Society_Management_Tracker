import mongoose from 'mongoose';
import { env } from './env';

let mongoMemoryServer: any = null;

export const connectDB = async (): Promise<void> => {
  try {
    // If MONGODB_URI is provided or memory DB is explicitly disabled, connect to URI
    if (process.env.MONGODB_URI || process.env.USE_MEMORY_DB === 'false') {
      await mongoose.connect(env.MONGODB_URI);
      console.log(`[MongoDB] Connected successfully to ${env.MONGODB_URI}`);
      return;
    }

    // Try standard connection with 1.5s timeout; fall back to Memory DB smoothly in local development
    try {
      await mongoose.connect(env.MONGODB_URI, {
        serverSelectionTimeoutMS: 1500,
      });
      console.log(`[MongoDB] Connected successfully to ${env.MONGODB_URI}`);
    } catch (localErr) {
      console.warn('[MongoDB] Local MongoDB connection failed. Initializing in-memory MongoDB fallback...');
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        mongoMemoryServer = await MongoMemoryServer.create();
        const memoryUri = mongoMemoryServer.getUri();
        await mongoose.connect(memoryUri);
        console.log(`[MongoDB] Connected to In-Memory MongoDB at ${memoryUri}`);
      } catch (memErr) {
        console.error('[MongoDB] In-Memory DB could not be started. Please provide a valid MONGODB_URI.');
        throw localErr;
      }
    }
  } catch (error) {
    console.error('[MongoDB] Fatal Connection Error:', error);
    process.exit(1);
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    if (mongoMemoryServer) {
      await mongoMemoryServer.stop();
    }
  } catch (error) {
    console.error('[MongoDB] Disconnection error:', error);
  }
};

