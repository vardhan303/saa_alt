import { Router } from 'express';
import passport from 'passport';
import crypto from 'crypto';
import { signJwt, setAuthCookie, clearAuthCookie, verifyJwt } from '../utils/jwt.js';
import { User } from '../models/User.js';

const router = Router();

// Debug: show lengths (not values) to ensure no hidden whitespace
router.get('/debug', (_req, res) => {
  const cid = process.env.GOOGLE_CLIENT_ID || '';
  const secret = process.env.GOOGLE_CLIENT_SECRET || '';
  res.json({
    clientIdLength: cid.length,
    clientIdStartsWith: cid.slice(0, 15),
    clientIdEndsWith: cid.slice(-10),
    secretLength: secret.length,
    callback: `${process.env.SERVER_BASE_URL}/auth/google/callback`,
    serverBaseUrl: process.env.SERVER_BASE_URL,
    googleEnvVarsSet: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
  });
});

// In-memory map for state validation (short-lived)
const oauthState = new Map();

router.get('/google', (req, res, next) => {
  // Check if OAuth is configured before proceeding
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(503).send(`
      <html>
        <head>
          <title>OAuth Not Configured</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            .error { color: #e63946; }
            .code { background: #f5f5f5; padding: 15px; border: 1px solid #ddd; }
          </style>
        </head>
        <body>
          <h1 class="error">Google OAuth Not Configured</h1>
          
          <p>Your OAuth credentials are not properly configured.</p>
          
          <h2>Required Steps:</h2>
          <ol>
            <li>Create <code>server/.env</code> file (if it doesn't exist)</li>
            <li>Add Google OAuth credentials to your .env file:
              <pre class="code">
GOOGLE_CLIENT_ID=your-client-id-here
GOOGLE_CLIENT_SECRET=your-client-secret-here
SERVER_BASE_URL=http://localhost:5000
CLIENT_ORIGIN=http://localhost:5173
PORT=5000
JWT_SECRET=generate-a-secure-random-string
              </pre>
            </li>
            <li>Restart the server after saving the .env file</li>
          </ol>
          
          <p>Note: Verify your credentials are from a properly configured Google Cloud Console OAuth project.</p>
        </body>
      </html>
    `);
  }

  const state = crypto.randomBytes(8).toString('hex');
  oauthState.set(state, Date.now());
  console.log('[OAuth] Initiating Google auth', {
    clientIdSet: !!process.env.GOOGLE_CLIENT_ID,
    callback: `${process.env.SERVER_BASE_URL}/auth/google/callback`,
    state
  });
  
  // Try-catch to handle potential errors from passport
  try {
    passport.authenticate('google', {
      scope: ['openid', 'profile', 'email'],
      state,
      prompt: 'select_account',
      session: false
    })(req, res, next);
  } catch (error) {
    console.error('Error during passport authentication:', error);
    return res.status(500).send('Authentication failed. Check server logs for details.');
  }
});

// Manual builder: bypass Passport to isolate if strategy layer causes 400
router.get('/google/manual', (req, res) => {
  const client_id = process.env.GOOGLE_CLIENT_ID;
  const redirect_uri = `${process.env.SERVER_BASE_URL}/auth/google/callback`;
  if (!client_id) return res.status(500).send('Missing client id');
  const params = new URLSearchParams({
    client_id,
    redirect_uri,
    response_type: 'code',
    scope: 'openid profile email',
    access_type: 'online',
    include_granted_scopes: 'true',
    state: 'manualtest',
    prompt: 'select_account'
  });
  const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  
  // Display URL for debugging instead of redirecting
  if (req.query.inspect === 'true') {
    return res.send(`
      <html>
      <head>
        <title>OAuth Manual Test</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          .url { word-break: break-all; background: #f5f5f5; padding: 15px; border: 1px solid #ddd; }
          .highlight { color: #e63946; font-weight: bold; }
          table { border-collapse: collapse; width: 100%; margin: 20px 0; }
          th, td { text-align: left; padding: 8px; border-bottom: 1px solid #ddd; }
          button { padding: 10px 15px; background: #4285F4; color: white; border: none; cursor: pointer; }
        </style>
      </head>
      <body>
        <h1>OAuth Manual Test</h1>
        
        <h2>Full Google Auth URL:</h2>
        <div class="url">${url}</div>
        
        <h2>URL Parameters:</h2>
        <table>
          <tr><th>Parameter</th><th>Value</th></tr>
          <tr><td>client_id</td><td>${client_id}</td></tr>
          <tr><td>redirect_uri</td><td>${redirect_uri}</td></tr>
          <tr><td>response_type</td><td>code</td></tr>
          <tr><td>scope</td><td>openid profile email</td></tr>
          <tr><td>state</td><td>manualtest</td></tr>
        </table>
        
        <h2>Troubleshooting 400 Errors:</h2>
        <ul>
          <li>Ensure the redirect_uri <span class="highlight">exactly</span> matches one registered in Google Cloud Console</li>
          <li>Check that there are no trailing slashes or typos</li>
          <li>Verify your CLIENT_ID belongs to a project with the Google OAuth API enabled</li>
          <li>Make sure your OAuth Consent Screen is configured</li>
        </ul>
        
        <h2>Environment Variables:</h2>
        <table>
          <tr><th>Variable</th><th>Status</th></tr>
          <tr>
            <td>GOOGLE_CLIENT_ID</td>
            <td>${client_id ? '✅ Set' : '❌ Missing'}</td>
          </tr>
          <tr>
            <td>GOOGLE_CLIENT_SECRET</td>
            <td>${process.env.GOOGLE_CLIENT_SECRET ? '✅ Set' : '❌ Missing'}</td>
          </tr>
          <tr>
            <td>SERVER_BASE_URL</td>
            <td>${process.env.SERVER_BASE_URL ? '✅ Set' : '❌ Missing'}</td>
          </tr>
        </table>
        
        <h2>Testing:</h2>
        <p>
          <a href="${url}" target="_blank"><button>Try OAuth Flow (New Tab)</button></a>
        </p>
      </body>
      </html>
    `);
  }
  
  res.redirect(url);
});

router.get('/google/callback', (req, res, next) => {
  const { state } = req.query;
  if (!state || !oauthState.has(state)) {
    console.warn('[OAuth] Missing or unknown state', state);
    return res.redirect('/auth/failure?reason=missing_state');
  }
  // Expire used state
  oauthState.delete(state);
  passport.authenticate('google', { failureRedirect: '/auth/failure', session: false })(req, res, next);
}, async (req, res) => {
  // Build JWT payload with roles + roleRequests
  const user = req.user || {};
  try {
    const dbUser = await User.findById(user._id);
    const subject = dbUser?._id?.toString?.() || user._id?.toString?.() || user.googleId || user.id;
    const token = signJwt({
      sub: subject,
      googleId: dbUser?.googleId || user.googleId || user.id,
      displayName: dbUser?.displayName || user.displayName,
      name: dbUser?.displayName || user.displayName,
      emails: dbUser?.emails || user.emails,
      photo: dbUser?.photo || user.photo,
      roles: dbUser?.roles || ['participant'],
      roleRequests: dbUser?.roleRequests || []
    });
    setAuthCookie(res, token);
  } catch (e) {
    console.error('Error enriching login token with roles', e);
  }
  const target = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
  res.redirect(`${target}/?login=success`);
});

router.get('/me', async (req, res) => {
  const token = req.cookies?.auth_token;
  if (!token) return res.status(401).json({ authenticated: false });
  const decoded = verifyJwt(token);
  if (!decoded) return res.status(401).json({ authenticated: false });
  // Refresh roles/roleRequests from DB for accuracy
  try {
    const dbUser = await User.findById(decoded.sub).select('roles roleRequests displayName emails googleId photo university currentSem currentCGPA universityEmail');
    if (dbUser) {
      decoded.roles = dbUser.roles || ['participant'];
      decoded.roleRequests = dbUser.roleRequests || [];
      decoded.displayName = dbUser.displayName || decoded.displayName;
      decoded.name = decoded.displayName;
      decoded.emails = dbUser.emails || decoded.emails;
      decoded.photo = dbUser.photo || decoded.photo;
      decoded.university = dbUser.university;
      decoded.currentSem = dbUser.currentSem;
      decoded.currentCGPA = dbUser.currentCGPA;
      decoded.universityEmail = dbUser.universityEmail;
    }
  } catch (e) {
    console.error('Error refreshing /me user roles', e);
  }
  res.json({ authenticated: true, user: decoded });
});

// Update profile (academic fields) - authenticated via JWT cookie
router.put('/profile', async (req, res) => {
  try {
    const token = req.cookies?.auth_token;
    if (!token) return res.status(401).json({ error: 'Not authenticated' });
    const decoded = verifyJwt(token);
    if (!decoded?.sub) return res.status(401).json({ error: 'Invalid token' });

    const { university, currentSem, currentCGPA, universityEmail } = req.body || {};

    // Basic validation
    const updates = {};
    if (university !== undefined) {
      if (typeof university !== 'string' || university.length > 200) return res.status(400).json({ error: 'Invalid university' });
      updates.university = university.trim();
    }
    if (currentSem !== undefined) {
      if (typeof currentSem !== 'string' || currentSem.length > 50) return res.status(400).json({ error: 'Invalid currentSem' });
      updates.currentSem = currentSem.trim();
    }
    if (currentCGPA !== undefined) {
      const num = Number(currentCGPA);
      if (Number.isNaN(num) || num < 0 || num > 10) return res.status(400).json({ error: 'Invalid currentCGPA (0-10)' });
      updates.currentCGPA = num;
    }
    if (universityEmail !== undefined) {
      if (typeof universityEmail !== 'string' || universityEmail.length > 200) return res.status(400).json({ error: 'Invalid universityEmail' });
      const emailTrim = universityEmail.trim().toLowerCase();
      // Basic RFC-like pattern (simple) permitting any domain
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(emailTrim)) return res.status(400).json({ error: 'Invalid email format' });
      updates.universityEmail = emailTrim;
    }

    if (Object.keys(updates).length === 0) {
      // No changes provided; return current user payload gracefully (no-op)
      console.log('[ProfileUpdate] No fields changed for user', decoded.sub);
      return res.json({
        ok: true,
        unchanged: true,
        user: {
          sub: decoded.sub,
          googleId: decoded.googleId,
          displayName: decoded.displayName,
          name: decoded.name,
          emails: decoded.emails,
          photo: decoded.photo,
          university: decoded.university,
          currentSem: decoded.currentSem,
          currentCGPA: decoded.currentCGPA,
          universityEmail: decoded.universityEmail
        }
      });
    }

    const userDoc = await User.findById(decoded.sub);
    if (!userDoc) return res.status(404).json({ error: 'User not found' });

    Object.assign(userDoc, updates);
    await userDoc.save();

    console.log('[ProfileUpdate] Updated fields for user', decoded.sub, Object.keys(updates));

    // Issue updated JWT with added fields (so client reflects new data via /me or immediate response)
    const newToken = signJwt({
      sub: userDoc._id.toString(),
      googleId: userDoc.googleId,
      displayName: userDoc.displayName,
      name: userDoc.displayName,
      emails: userDoc.emails,
      photo: userDoc.photo,
      university: userDoc.university,
      currentSem: userDoc.currentSem,
      currentCGPA: userDoc.currentCGPA,
      universityEmail: userDoc.universityEmail,
      roles: userDoc.roles || ['participant'],
      roleRequests: userDoc.roleRequests || []
    });
    setAuthCookie(res, newToken);

    res.json({
      ok: true,
      user: {
        sub: userDoc._id.toString(),
        googleId: userDoc.googleId,
        displayName: userDoc.displayName,
        name: userDoc.displayName,
        emails: userDoc.emails,
        photo: userDoc.photo,
        university: userDoc.university,
        currentSem: userDoc.currentSem,
        currentCGPA: userDoc.currentCGPA,
        universityEmail: userDoc.universityEmail,
        roles: userDoc.roles || ['participant'],
        roleRequests: userDoc.roleRequests || []
      }
    });
  } catch (err) {
    console.error('Profile update error', err);
    res.status(500).json({ error: 'Server error updating profile' });
  }
});

router.get('/logout', (req, res) => {
  clearAuthCookie(res);
  res.json({ ok: true });
});

router.get('/failure', (req, res) => {
  res.status(401).json({ error: 'Authentication Failed', query: req.query });
});

export default router;
