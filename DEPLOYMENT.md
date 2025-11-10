# Vercel Deployment Guide

## Pre-Deployment Checklist

### 1. Set up MongoDB Atlas (if not already done)
- Go to https://cloud.mongodb.com/
- Create a free cluster
- Create a database user
- Whitelist all IPs (0.0.0.0/0) for Vercel access
- Get your connection string

### 2. Set up Google OAuth
- Go to https://console.cloud.google.com/
- Create a new project or select existing
- Enable Google+ API
- Create OAuth 2.0 credentials
- Add authorized redirect URIs:
  - `https://your-app.vercel.app/auth/google/callback`
  - Add your actual Vercel domain

## Deployment Steps

### Step 1: Install Vercel CLI (optional but recommended)
```bash
npm install -g vercel
```

### Step 2: Configure Environment Variables in Vercel

Go to your Vercel project settings → Environment Variables and add:

**Required Variables:**
- `MONGO_URI` - Your MongoDB connection string
- `JWT_SECRET` - A random secret key (generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
- `GOOGLE_CLIENT_ID` - From Google Console
- `GOOGLE_CLIENT_SECRET` - From Google Console
- `GOOGLE_CALLBACK_URL` - `https://your-app.vercel.app/auth/google/callback`
- `CLIENT_ORIGIN` - `https://your-app.vercel.app`
- `SESSION_SECRET` - Another random secret key
- `NODE_ENV` - Set to `production`

### Step 3: Update Google OAuth Redirect URIs
After deploying, update your Google OAuth credentials:
1. Go to Google Cloud Console
2. Navigate to APIs & Services → Credentials
3. Edit your OAuth 2.0 Client ID
4. Add Authorized redirect URIs:
   - `https://your-actual-domain.vercel.app/auth/google/callback`

### Step 4: Deploy to Vercel

**Option A: Via Vercel Dashboard**
1. Go to https://vercel.com/
2. Import your Git repository
3. Vercel will auto-detect settings
4. Add environment variables
5. Deploy

**Option B: Via CLI**
```bash
vercel
```

Follow the prompts to deploy.

### Step 5: Update Environment Variables
After first deployment, update `CLIENT_ORIGIN` and `GOOGLE_CALLBACK_URL` with your actual Vercel URL.

## Troubleshooting

### 404 Errors on Routes
- Ensure `vercel.json` is properly configured
- Check that all routes are defined
- Verify the build completed successfully

### OAuth Not Working
- Check `GOOGLE_CALLBACK_URL` matches exactly in both Vercel env vars and Google Console
- Ensure `CLIENT_ORIGIN` is set to your Vercel domain
- Verify all Google OAuth credentials are correct

### Database Connection Issues
- Check MongoDB Atlas IP whitelist includes 0.0.0.0/0
- Verify `MONGO_URI` is correct and URL-encoded
- Check MongoDB Atlas cluster is running

### API Requests Failing
- Open browser console and check the API endpoint being called
- Verify environment variables are set in Vercel
- Check Vercel function logs for errors

## Testing Deployment

After deployment:
1. Visit your Vercel URL
2. Test Google login
3. Check that navigation works
4. Verify API calls are successful

## Local Development vs Production

- Local: Uses Vite proxy for API calls
- Production: Direct API calls handled by Vercel routing

## Important Notes

- Vercel serverless functions have a 10-second timeout on free tier
- Socket.IO may not work on Vercel serverless (consider alternative like Pusher for production)
- Environment variables must be set in Vercel dashboard, not in `.env` file
