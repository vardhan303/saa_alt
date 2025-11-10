// User persistence with Mongo fallback to in-memory if DB unavailable
import { connectMongo } from './db/mongo.js';
import { User } from './models/User.js';

// Memory fallback cache keyed by googleId
const memoryUsers = new Map();

export async function findOrCreateUser({ googleId, displayName, emails, photo }) {
  if (!googleId) return null;
  // Try Mongo first
  try {
    const conn = await connectMongo();
    if (conn) {
      let user = await User.findOne({ googleId }).lean();
      if (!user) {
        user = await User.create({ googleId, displayName, emails, photo });
      } else {
        await User.updateOne({ _id: user._id }, { lastLoginAt: new Date(), displayName, emails, photo });
        user = await User.findById(user._id).lean();
      }
      return user;
    }
  } catch (err) {
    console.warn('[UserStore] Mongo error, falling back to memory:', err.message);
  }
  // Memory fallback
  if (!memoryUsers.has(googleId)) {
    memoryUsers.set(googleId, { googleId, displayName, emails, photo, createdAt: Date.now(), lastLoginAt: Date.now() });
  } else {
    const existing = memoryUsers.get(googleId);
    memoryUsers.set(googleId, { ...existing, displayName, emails, photo, lastLoginAt: Date.now() });
  }
  return memoryUsers.get(googleId);
}

export function memoryUserCount() {
  return memoryUsers.size;
}
