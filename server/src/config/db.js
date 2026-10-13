import mongoose from 'mongoose';
import { config } from './env.js';

let memoryServer = null;

export async function connectDB() {
  if (mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2) {
    return;
  }
  try {
    if (config.mongodbUri) {
      console.log('Connecting to provided MongoDB URI...');
      await mongoose.connect(config.mongodbUri);
      console.log('Connected to MongoDB successfully.');
      return;
    }

    // If no URI is provided, attempt in-memory server in development for seamless zero-config local testing
    console.log('No MONGODB_URI provided. Starting in-memory MongoDB for local development...');
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      memoryServer = await MongoMemoryServer.create();
      const uri = memoryServer.getUri();
      await mongoose.connect(uri);
      console.log('Connected to in-memory MongoDB successfully (local zero-config mode).');
    } catch (memErr) {
      console.warn('Could not start in-memory MongoDB:', memErr.message);
      console.warn('Please provide a valid MONGODB_URI in your server .env file.');
    }
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    if (config.nodeEnv === 'production') {
      process.exit(1);
    }
  }
}

export async function disconnectDB() {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
  }
}
