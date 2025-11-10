import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

console.log({
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET_PRESENT: !!process.env.GOOGLE_CLIENT_SECRET,
  SERVER_BASE_URL: process.env.SERVER_BASE_URL,
  CALLBACK_EXPECTED: `${process.env.SERVER_BASE_URL}/auth/google/callback`
});import 'dotenv/config';
console.log({
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET_PRESENT: !!process.env.GOOGLE_CLIENT_SECRET,
  SERVER_BASE_URL: process.env.SERVER_BASE_URL,
  CALLBACK_EXPECTED: `${process.env.SERVER_BASE_URL}/auth/google/callback`
});