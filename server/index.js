import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Ensure we load the server/.env even when process CWD differs
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '.env');

// Check if the .env file exists
if (!fs.existsSync(envPath)) {
  console.error(`ERROR: Environment file not found at ${envPath}`);
  console.error('Create .env file with GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and other required variables');
} else {
  console.log(`Loading env from: ${envPath}`);
  const result = dotenv.config({ path: envPath });
  if (result.error) {
    console.error(`Error loading .env file: ${result.error.message}`);
  } else {
    console.log('Environment loaded successfully');
  }
}
import express from 'express';
import http from 'http';
import { initSocket } from './socket.js';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import authRouter from './routes/auth.js';
import hackathonRouter from './routes/hackathons.js';
import teamsRouter from './routes/teams.js';
import registrationsRouter from './routes/registrations.js';
import adminRouter from './routes/admin.js';
import devpostRouter from './routes/devpost.js';
import './config/passport.js';
import helmet from 'helmet';
import userRouter from './routes/users.js';
import crypto from 'crypto';
import { connectMongo } from './db/mongo.js';

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
const NODE_ENV = process.env.NODE_ENV || 'development';
const isDev = NODE_ENV !== 'production';

// CORS configuration with explicit origin function (helps when future multiple origins needed)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin === CLIENT_ORIGIN) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Vary', 'Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// JSON body parsing (before routes)
app.use(express.json({ limit: '256kb' }));

// Per-request nonce for CSP
app.use((req, res, next) => {
  res.locals.cspNonce = crypto.randomBytes(16).toString('base64');
  next();
});

// Build CSP directives dynamically so we can loosen in dev (for Vite HMR) and tighten in prod.
app.use(helmet({
  contentSecurityPolicy: {
    // Do NOT useDefaults because we want full explicitness.
    directives: (() => {
      const scriptSrc = [
        "'self'",
        (req, res) => `'nonce-${res.locals.cspNonce}'`,
        'https://accounts.google.com',
        'https://apis.google.com'
      ];
      // Vite / React Fast Refresh sometimes needs eval and module preload in dev only.
      if (isDev) {
        scriptSrc.push("'unsafe-eval'");
        scriptSrc.push('http://localhost:5173');
      }

      const styleSrc = ["'self'"]; // Tailwind emits a static file; inline styles not required.
      if (isDev) {
        // Allow inline styles in dev (e.g., browser extensions, vite injected) – remove for production.
        styleSrc.push("'unsafe-inline'");
      }

      const connectSrc = [
        "'self'",
        'https://accounts.google.com',
        'https://oauth2.googleapis.com'
      ];
      if (isDev) {
        connectSrc.push('ws://localhost:5173'); // Vite HMR websocket
        connectSrc.push('http://localhost:5173');
      }

      return {
        'default-src': ["'self'"],
        'base-uri': ["'self'"],
        'script-src': scriptSrc,
        // Disallow inline event handlers without nonce; this reduces XSS surface.
        'script-src-attr': ["'none'"],
        'style-src': styleSrc,
        'img-src': ["'self'", 'data:', 'https://lh3.googleusercontent.com'],
        'connect-src': connectSrc,
        'frame-src': ['https://accounts.google.com'],
        'object-src': ["'none'"],
        'frame-ancestors': ["'self'"],
        // Empty array acts as a flag; browsers that support upgrade will act, others ignore.
        'upgrade-insecure-requests': []
      };
    })()
  },
  crossOriginEmbedderPolicy: false
}));
app.use(cookieParser());
app.use(passport.initialize());

app.get('/health', (_req, res) => res.json({ ok: true }));
app.get('/debug/cors', (req, res) => {
  res.json({
    originHeader: req.headers.origin || null,
    clientOriginConfigured: CLIENT_ORIGIN,
    allowed: req.headers.origin === CLIENT_ORIGIN,
    note: 'If allowed=false, ensure frontend URL matches CLIENT_ORIGIN exactly (protocol/host/port)'
  });
});
app.use('/auth', authRouter);
app.use('/api/hackathons', hackathonRouter);
app.use('/api/teams', teamsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/users', userRouter);
app.use('/api/registrations', registrationsRouter);
app.use('/api/devpost', devpostRouter);

// Initialize MongoDB connection
connectMongo().then(() => {
  // Initialize socket.io server
  initSocket(server);
  server.listen(PORT, () => {
    console.log(`Auth server running on http://localhost:${PORT}`);
    console.log(`Socket.io running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
