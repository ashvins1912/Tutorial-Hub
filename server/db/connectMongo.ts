import mongoose from 'mongoose';

let mongoConnected = false;

export function isMongoConnected(): boolean {
  return mongoConnected && mongoose.connection.readyState === 1;
}

export async function connectMongo(): Promise<boolean> {
  const uri = process.env.MONGODB_URI?.trim();

  if (!uri || uri.includes('<username>') || uri.includes('<password>')) {
    mongoConnected = false;
    const message = 'MONGODB_URI is required. Configure a real MongoDB connection string.';
    if (process.env.NODE_ENV === 'production') throw new Error(message);
    console.log(`[PatternForge DB] ${message} Running in development in-memory mode.`);
    return false;
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    mongoConnected = true;
    console.log('[PatternForge DB] Connected to MongoDB successfully.');
    return true;
  } catch (err) {
    mongoConnected = false;
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[PatternForge DB] MongoDB connection failed: ${message}`);
    if (process.env.NODE_ENV === 'production') throw err;
    console.warn('[PatternForge DB] Development mode only: using in-memory storage.');
    return false;
  }
}
