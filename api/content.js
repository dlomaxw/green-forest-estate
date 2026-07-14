const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const CONTENT_FILE = path.join(process.cwd(), 'assets', 'data', 'content.json');

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'manager@greenforest.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Greenforest2026!';
const JWT_SECRET = process.env.JWT_SECRET || 'forest-green-estates-jwt-secret-2026';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Helper: Validate session token
function validateToken(req) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) return false;
  const suppliedToken = authHeader.split(' ')[1];
  const expectedToken = crypto.createHmac('sha256', JWT_SECRET)
    .update(ADMIN_USERNAME + ':' + ADMIN_PASSWORD + ':session')
    .digest('hex');
  return suppliedToken === expectedToken;
}

// Helper: Supabase REST query wrapper
async function supabaseFetch(pathname, options = {}) {
  const url = `${SUPABASE_URL}/rest/v1${pathname}`;
  const resp = await fetch(url, {
    ...options,
    headers: {
      apikey: SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      ...(options.headers || {})
    }
  });
  return resp;
}

module.exports = async (req, res) => {
  const method = req.method;

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // ── GET CONTENT ──
  if (method === 'GET') {
    if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
      try {
        const r = await supabaseFetch('/content?select=key,value');
        const rows = await r.json();
        // Convert [{key, value}] array -> flat object
        const config = {};
        if (Array.isArray(rows)) {
          rows.forEach(row => {
            config[row.key] = row.value;
          });
        }
        res.status(200).json(config);
      } catch (err) {
        res.status(500).json({ error: 'Supabase fetch error: ' + err.message });
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
    if (!validateToken(req)) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

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

      if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
        // Upsert each key-value pair
        const rows = Object.entries(newContent).map(([key, value]) => ({ key, value }));
        try {
          const r = await supabaseFetch('/content', {
            method: 'POST',
            body: JSON.stringify(rows),
            headers: { Prefer: 'resolution=merge-duplicates,return=representation' }
          });
          res.status(r.ok ? 200 : r.status).json(r.ok ? { success: true } : { error: 'Failed to save' });
        } catch (err) {
          res.status(500).json({ error: 'Supabase upsert error: ' + err.message });
        }
      } else {
        // Local fallback
        try {
          fs.writeFileSync(CONTENT_FILE, JSON.stringify(newContent, null, 2), 'utf8');
          res.status(200).json({ success: true });
        } catch (e) {
          res.status(500).json({ error: 'Failed to write content file locally: ' + e.message });
        }
      }
    });
    return;
  }

  res.status(405).json({ error: 'Method Not Allowed' });
};
