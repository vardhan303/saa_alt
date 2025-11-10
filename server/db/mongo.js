import mongoose from 'mongoose';

let cached = global.__MONGO_CONN__;
if (!cached) {
  cached = global.__MONGO_CONN__ = { conn: null, promise: null };
}

export async function connectMongo(uri = process.env.MONGODB_URI) {
  if (!uri) {
    console.warn('[Mongo] MONGODB_URI not set; continuing without DB.');
    return null;
  }
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, {
      dbName: process.env.MONGODB_DB || undefined,
      autoIndex: true
    }).then((m) => {
      console.log('[Mongo] Connected');
      return m;
    }).catch(err => {
      console.error('[Mongo] Connection error', err.message);
      cached.promise = null;
      return null;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
