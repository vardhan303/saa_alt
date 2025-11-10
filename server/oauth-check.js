import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

// Proper path resolution for server/.env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '.env');
console.log(`Looking for .env at: ${envPath}`);

// Load from proper path
const result = dotenv.config({ path: envPath });
console.log('dotenv result:', result.error ? 'ERROR' : 'OK');

// Output comprehensive debug info
console.log({
  GOOGLE_CLIENT_ID: {
    value: process.env.GOOGLE_CLIENT_ID || '[MISSING]',
    length: (process.env.GOOGLE_CLIENT_ID || '').length,
    starts: (process.env.GOOGLE_CLIENT_ID || '').slice(0, 10) + '...',
    ends: '...' + (process.env.GOOGLE_CLIENT_ID || '').slice(-10),
    containsApps: (process.env.GOOGLE_CLIENT_ID || '').includes('apps.googleusercontent.com')
  },
  GOOGLE_CLIENT_SECRET: {
    present: !!process.env.GOOGLE_CLIENT_SECRET,
    length: (process.env.GOOGLE_CLIENT_SECRET || '').length,
    starts: (process.env.GOOGLE_CLIENT_SECRET || '').slice(0, 10) + '...',
    ends: '...' + (process.env.GOOGLE_CLIENT_SECRET || '').slice(-5),
    containsGOCSPX: (process.env.GOOGLE_CLIENT_SECRET || '').includes('GOCSPX')
  },
  SERVER_BASE_URL: {
    value: process.env.SERVER_BASE_URL || '[MISSING]', 
    endsWithSlash: (process.env.SERVER_BASE_URL || '').endsWith('/')
  },
  CLIENT_ORIGIN: {
    value: process.env.CLIENT_ORIGIN || '[MISSING]',
    endsWithSlash: (process.env.CLIENT_ORIGIN || '').endsWith('/')
  },
  PORT: process.env.PORT || '5000 (default)',
  JWT_SECRET: {
    present: !!process.env.JWT_SECRET,
    length: (process.env.JWT_SECRET || '').length
  },
  EXPECTED_CALLBACK: `${process.env.SERVER_BASE_URL}/auth/google/callback`
});

// Test URL construction
const client_id = process.env.GOOGLE_CLIENT_ID;
const redirect_uri = `${process.env.SERVER_BASE_URL}/auth/google/callback`;
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
console.log('\nGoogle OAuth URL:');
console.log(url);

// Verify client_id and redirect_uri with actual test
console.log('\nValidating client_id and redirect_uri...');
const clientIdValid = client_id?.length > 20;
if (!clientIdValid) {
  console.error('ERROR: client_id appears invalid (too short or missing)');
}

const redirectValid = redirect_uri?.startsWith('http');
if (!redirectValid) {
  console.error('ERROR: redirect_uri appears invalid');
}

// Check if SERVER_BASE_URL matches what server actually runs on
console.log('\nServer should be running on port:', process.env.PORT || '5000 (default)');
console.log('SERVER_BASE_URL should match that port:', process.env.SERVER_BASE_URL);
if (!process.env.SERVER_BASE_URL?.includes(process.env.PORT || '5000')) {
  console.warn('WARNING: SERVER_BASE_URL port may not match actual server port');
}
