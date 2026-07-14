const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const LEADS_FILE = path.join(process.cwd(), 'leads.json');

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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // ── GET LEADS ──
  if (method === 'GET') {
    if (!validateToken(req)) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
      try {
        const r = await supabaseFetch('/leads?order=timestamp.desc&limit=500');
        const data = await r.json();
        res.status(r.status).json(data);
      } catch (err) {
        res.status(500).json({ error: 'Supabase fetch error: ' + err.message });
      }
    } else {
      let leads = [];
      if (fs.existsSync(LEADS_FILE)) {
        try {
          leads = JSON.parse(fs.readFileSync(LEADS_FILE, 'utf8'));
        } catch (e) {
          leads = [];
        }
      }
      res.status(200).json(leads);
    }
    return;
  }

  // ── POST LEAD ──
  if (method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', async () => {
      let lead;
      try {
        lead = JSON.parse(body || '{}');
      } catch (err) {
        res.status(400).json({ error: 'Invalid JSON payload' });
        return;
      }

      if (!lead.name || !lead.phone) {
        res.status(400).json({ error: 'Name and Phone are required' });
        return;
      }

      // Add ID and Timestamp
      lead.id = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
      lead.timestamp = new Date().toISOString();

      if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
        try {
          const r = await supabaseFetch('/leads', {
            method: 'POST',
            body: JSON.stringify(lead)
          });
          const data = await r.json();
          res.status(r.status).json({ success: r.ok, lead: data[0] || lead });
        } catch (err) {
          res.status(500).json({ error: 'Supabase insert error: ' + err.message });
        }
      } else {
        // Local fallback (primarily for local dev)
        let leads = [];
        if (fs.existsSync(LEADS_FILE)) {
          try {
            leads = JSON.parse(fs.readFileSync(LEADS_FILE, 'utf8'));
          } catch (e) {
            leads = [];
          }
        }
        leads.push(lead);
        try {
          fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2), 'utf8');
        } catch (e) {
          console.warn('Failed to write leads.json to disk:', e.message);
        }
        res.status(200).json({ success: true, lead });
      }
    });
    return;
  }

  // ── DELETE LEAD ──
  if (method === 'DELETE') {
    if (!validateToken(req)) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const id = req.query ? req.query.id : new URL(req.url, 'http://localhost').searchParams.get('id');
    if (!id) {
      res.status(400).json({ error: 'Lead ID required' });
      return;
    }

    if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
      try {
        const r = await supabaseFetch(`/leads?id=eq.${encodeURIComponent(id)}`, {
          method: 'DELETE'
        });
        res.status(r.ok ? 200 : r.status).json(r.ok ? { success: true } : { error: 'Failed to delete' });
      } catch (err) {
        res.status(500).json({ error: 'Supabase delete error: ' + err.message });
      }
    } else {
      let leads = [];
      if (fs.existsSync(LEADS_FILE)) {
        try {
          leads = JSON.parse(fs.readFileSync(LEADS_FILE, 'utf8'));
        } catch (e) {}
      }
      const filteredLeads = leads.filter(l => l.id !== id);
      try {
        fs.writeFileSync(LEADS_FILE, JSON.stringify(filteredLeads, null, 2), 'utf8');
      } catch (e) {}
      res.status(200).json({ success: true });
    }
    return;
  }

  res.status(405).json({ error: 'Method Not Allowed' });
};
