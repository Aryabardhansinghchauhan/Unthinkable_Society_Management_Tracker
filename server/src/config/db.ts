import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { env } from './env';

let mongoMemoryServer: MongoMemoryServer | null = null;

export const connectDB = async (): Promise<void> => {
  try {
    // Try connecting to provided MONGODB_URI first if not forcing memory DB
    if (process.env.MONGODB_URI && process.env.USE_MEMORY_DB === 'false') {
      await mongoose.connect(env.MONGODB_URI);
      console.log(`[MongoDB] Connected successfully to ${env.MONGODB_URI}`);
      return;
    }

    // Try standard connection with 1.5s timeout; fall back to Memory DB smoothly
    try {
      await mongoose.connect(env.MONGODB_URI, {
        serverSelectionTimeoutMS: 1500,
      });
      console.log(`[MongoDB] Connected successfully to ${env.MONGODB_URI}`);
    } catch (localErr) {
      console.warn('[MongoDB] Local MongoDB connection failed or timed out. Initializing in-memory MongoDB fallback...');
      mongoMemoryServer = await MongoMemoryServer.create();
      const memoryUri = mongoMemoryServer.getUri();
      await mongoose.connect(memoryUri);
      console.log(`[MongoDB] Connected to In-Memory MongoDB at ${memoryUri}`);
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
