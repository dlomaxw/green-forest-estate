const crypto = require('crypto');

module.exports = async (req, res) => {
  const method = req.method;

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  let body = '';
  req.on('data', chunk => { body += chunk.toString(); });
  req.on('end', () => {
    let payload;
    try {
      payload = JSON.parse(body || '{}');
    } catch (err) {
      res.status(400).json({ error: 'Invalid JSON payload' });
      return;
    }

    const { username, password } = payload;

    // Primary credentials (configurable via Vercel Environment Variables)
    const expectedUsername = process.env.ADMIN_USERNAME || 'manager@greenforest.com';
    const expectedPassword = process.env.ADMIN_PASSWORD || 'Greenforest2026!';

    if (username === expectedUsername && password === expectedPassword) {
      const secret = process.env.JWT_SECRET || 'forest-green-estates-jwt-secret-2026';
      const token = crypto.createHmac('sha256', secret)
                          .update(username + ':' + expectedPassword + ':session')
                          .digest('hex');

      res.status(200).json({ success: true, token });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  });
};
