import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, 'server', '.env');

console.log('Current directory:', __dirname);
console.log('Looking for .env at:', envPath);

try {
  const result = dotenv.config({ path: envPath });
  console.log('dotenv result:', result.error ? 'ERROR: ' + result.error.message : 'OK');
} catch (err) {
  console.error('Error loading dotenv:', err);
}

console.log('\nEnvironment variables:');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID || 'undefined');
console.log('GOOGLE_CLIENT_SECRET present:', !!process.env.GOOGLE_CLIENT_SECRET);
console.log('SERVER_BASE_URL:', process.env.SERVER_BASE_URL || 'undefined');
