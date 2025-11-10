import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { findOrCreateUser } from '../userStore.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Ensure environment variables are loaded
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '..', '.env');

// Try to load .env again directly here
console.log(`Passport: Loading env from: ${envPath}`);
dotenv.config({ path: envPath });

// Get environment variables and print them for debugging
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const SERVER_BASE_URL = process.env.SERVER_BASE_URL || 'http://localhost:5000';

// Log to help debug
console.log('GOOGLE_CLIENT_ID exists:', !!GOOGLE_CLIENT_ID);
console.log('GOOGLE_CLIENT_SECRET exists:', !!GOOGLE_CLIENT_SECRET);
console.log('SERVER_BASE_URL:', SERVER_BASE_URL);

// Validate required OAuth credentials
if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  console.error('ERROR: Missing Google OAuth credentials. Check your server/.env file.');
}

passport.serializeUser((user, done) => {
  done(null, user?._id || user?.googleId || user?.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await findOrCreateUser({ googleId: id });
    done(null, user);
  } catch (e) {
    done(e);
  }
});

// Only setup strategy if credentials are available
if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
  try {
    passport.use(new GoogleStrategy({
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: `${SERVER_BASE_URL}/auth/google/callback`
    }, async (_accessToken, _refreshToken, profile, done) => {
      try {
        const user = await findOrCreateUser({
          googleId: profile.id,
          displayName: profile.displayName,
          emails: profile.emails,
          photo: profile.photos?.[0]?.value
        });
        return done(null, user);
      } catch (e) {
        return done(e);
      }
    }));
    console.log('Google OAuth strategy configured successfully');
  } catch (error) {
    console.error('Failed to setup Google OAuth strategy:', error.message);
  }
} else {
  console.error('Google OAuth strategy NOT configured due to missing credentials');
}
