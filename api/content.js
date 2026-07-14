const fs = require('fs');
const path = require('path');

const CONTENT_FILE = path.join(process.cwd(), 'assets', 'data', 'content.json');

module.exports = async (req, res) => {
  const method = req.method;
  const KV_URL = process.env.KV_REST_API_URL;
  const KV_TOKEN = process.env.KV_REST_API_TOKEN;

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // ── GET CONTENT ──
  if (method === 'GET') {
    if (KV_URL && KV_TOKEN) {
      try {
        const response = await fetch(`${KV_URL}/get/site_content`, {
          headers: { Authorization: `Bearer ${KV_TOKEN}` }
        });
        const data = await response.json();
        
        if (data.result) {
          res.status(200).json(JSON.parse(data.result));
        } else {
          // Serve static file config as fallback
          let content = {};
          if (fs.existsSync(CONTENT_FILE)) {
            content = JSON.parse(fs.readFileSync(CONTENT_FILE, 'utf8'));
          }
          res.status(200).json(content);
        }
      } catch (err) {
        res.status(500).json({ error: 'Failed to fetch from KV database: ' + err.message });
      }
    } else {
      // Local fallback
      let content = {};
      if (fs.existsSync(CONTENT_FILE)) {
        try {
          content = JSON.parse(fs.readFileSync(CONTENT_FILE, 'utf8'));
        } catch (e) {}
      }
      res.status(200).json(content);
    }
    return;
  }

  // ── POST CONTENT ──
  if (method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', async () => {
      let newContent;
      try {
        newContent = JSON.parse(body || '{}');
      } catch (err) {
        res.status(400).json({ error: 'Invalid JSON payload' });
        return;
      }

      if (KV_URL && KV_TOKEN) {
        try {
          await fetch(`${KV_URL}/set/site_content`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${KV_TOKEN}` },
            body: JSON.stringify(newContent)
          });
          res.status(200).json({ success: true });
        } catch (err) {
          res.status(500).json({ error: 'Failed to save to KV database: ' + err.message });
        }
      } else {
        // Local fallback
        fs.writeFileSync(CONTENT_FILE, JSON.stringify(newContent, null, 2), 'utf8');
        res.status(200).json({ success: true });
      }
    });
    return;
  }

  res.status(405).json({ error: 'Method Not Allowed' });
};
