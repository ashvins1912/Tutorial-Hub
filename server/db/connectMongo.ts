import mongoose from 'mongoose';

let mongoConnected = false;

export function isMongoConnected(): boolean {
  return mongoConnected && mongoose.connection.readyState === 1;
}

export async function connectMongo(): Promise<boolean> {
  const uri = process.env.MONGODB_URI?.trim();

  if (!uri || uri.includes('<username>') || uri.includes('<password>')) {
    console.log(
      '[PatternForge DB] MONGODB_URI not configured — running in zero-config in-memory + browser storage mode.'
    );
    mongoConnected = false;
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
    console.warn(
      `[PatternForge DB] Could not connect to MONGODB_URI (${message}). Falling back to in-memory storage.`
    );
    return false;
  }
}
