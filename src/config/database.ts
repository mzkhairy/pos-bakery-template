import mongoose from 'mongoose';

export async function connectDatabase(): Promise<void> {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error('MONGO_URI is not defined in environment variables');
  }

  try {
    await mongoose.connect(uri);
    console.log(`[DB] Connected to MongoDB — Branch: ${process.env.BRANCH_ID}`);
  } catch (error) {
    console.error('[DB] Connection failed:', error);
    process.exit(1);
  }

  mongoose.connection.on('disconnected', () => {
    console.warn('[DB] MongoDB disconnected');
  });

  mongoose.connection.on('error', (err) => {
    console.error('[DB] MongoDB error:', err);
  });
}
