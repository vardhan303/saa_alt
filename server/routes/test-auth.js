import { Router } from 'express';

const router = Router();

// Manual builder: bypass Passport to isolate if strategy layer causes 400
router.get('/google/manual', (req, res) => {
  const client_id = process.env.GOOGLE_CLIENT_ID;
  const redirect_uri = `${process.env.SERVER_BASE_URL}/auth/google/callback`;
  if (!client_id) return res.status(500).send('Missing client id');
  
  // Display URL instead of redirecting
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
  
  res.send(`
    <html>
    <head>
      <title>OAuth Manual Test</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .url { word-break: break-all; background: #f5f5f5; padding: 15px; border: 1px solid #ddd; }
        .highlight { color: #e63946; font-weight: bold; }
        table { border-collapse: collapse; width: 100%; }
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
      
      <h2>Testing:</h2>
      <p>
        <a href="${url}" target="_blank"><button>Try OAuth Flow (New Tab)</button></a>
      </p>
    </body>
    </html>
  `);
});

export default router;
