const express = require('express');
const fetch = require('node-fetch'); // Required for Render Node builds
const app = express();

// Render will set this via env var, but default to 3000 for local testing
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('SmartFrame OAuth backend is running.');
});

app.get('/oauth-callback', async (req, res) => {
  const authCode = req.query.code;

  if (!authCode) {
    return res.status(400).send('No "code" parameter received from HubSpot.');
  }

  console.log('Received HubSpot auth code:', authCode);

  try {
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: process.env.HUBSPOT_CLIENT_ID,
      client_secret: process.env.HUBSPOT_CLIENT_SECRET,
      redirect_uri: process.env.HUBSPOT_REDIRECT_URI,
      code: authCode,
    });

    const tokenResponse = await fetch('https://api.hubapi.com/oauth/v1/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
      },
      body: params.toString(),
    });

    const tokens = await tokenResponse.json();

    console.log('Token exchange response from HubSpot:');
    console.dir(tokens, { depth: null });

    if (!tokenResponse.ok) {
      return res
        .status(500)
        .send('Token exchange failed. Check the Render logs for details.');
    }

    res.send(`
      <h2>SmartFrame installed successfully 🎉</h2>
      <p>You can close this window and return to HubSpot.</p>
    `);
  } catch (err) {
    console.error('Error during OAuth callback:', err);
    res.status(500).send('Server error during OAuth callback.');
  }
});

app.listen(PORT, () => {
  console.log(`SmartFrame OAuth backend listening on port ${PORT}`);
});
