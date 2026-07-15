// Load .env for local development (Vercel injects env vars automatically in production)
require('./load-env');

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const crypto = require('crypto');

const PORT = 8080;
const LEADS_FILE = path.join(__dirname, 'leads.json');
const CONTENT_FILE = path.join(__dirname, 'assets', 'data', 'content.json');

// ── Admin Credentials ──
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'manager@greenforest.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Greenforest2026!';
const JWT_SECRET = process.env.JWT_SECRET || 'forest-green-estates-jwt-secret-2026';

// ── Supabase Config (optional) ──
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm'
};

// Helper: Send JSON
function sendJSON(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
  res.end(JSON.stringify(data));
}

// Helper: Read POST body
function getRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try { resolve(JSON.parse(body || '{}')); }
      catch (err) { reject(err); }
    });
    req.on('error', err => reject(err));
  });
}

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
async function supabaseFetch(path, options = {}) {
  const resp = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
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

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  let pathname = parsedUrl.pathname;

  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end();
    return;
  }

  // ════════════════════════════════════════
  // ── API: POST /api/login ──
  // ════════════════════════════════════════
  if (pathname === '/api/login' && req.method === 'POST') {
    try {
      const { username, password } = await getRequestBody(req);
      if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        const token = crypto.createHmac('sha256', JWT_SECRET)
          .update(ADMIN_USERNAME + ':' + ADMIN_PASSWORD + ':session')
          .digest('hex');
        sendJSON(res, 200, { success: true, token });
      } else {
        sendJSON(res, 401, { error: 'Invalid credentials' });
      }
    } catch (e) {
      sendJSON(res, 400, { error: 'Invalid JSON payload' });
    }
    return;
  }

  // ════════════════════════════════════════
  // ── API: GET /api/leads ──
  // ════════════════════════════════════════
  if (pathname === '/api/leads' && req.method === 'GET') {
    if (!validateToken(req)) { sendJSON(res, 401, { error: 'Unauthorized' }); return; }

    if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
      try {
        const r = await supabaseFetch('/leads?order=timestamp.desc&limit=500');
        const data = await r.json();
        sendJSON(res, r.status, data);
      } catch (e) {
        sendJSON(res, 500, { error: 'Supabase fetch error: ' + e.message });
      }
    } else {
      let leads = [];
      if (fs.existsSync(LEADS_FILE)) {
        try { leads = JSON.parse(fs.readFileSync(LEADS_FILE, 'utf8')); } catch (e) {}
      }
      sendJSON(res, 200, leads);
    }
    return;
  }

  // ════════════════════════════════════════
  // ── API: POST /api/leads ──
  // ════════════════════════════════════════
  if (pathname === '/api/leads' && req.method === 'POST') {
    try {
      const lead = await getRequestBody(req);
      if (!lead.name || !lead.phone) { sendJSON(res, 400, { error: 'Name and Phone are required' }); return; }

      lead.id = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
      lead.timestamp = new Date().toISOString();

      if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
        try {
          const r = await supabaseFetch('/leads', { method: 'POST', body: JSON.stringify(lead) });
          const data = await r.json();
          sendJSON(res, r.status, { success: r.ok, lead: data[0] || lead });
        } catch (e) {
          sendJSON(res, 500, { error: 'Supabase insert error: ' + e.message });
        }
      } else {
        let leads = [];
        if (fs.existsSync(LEADS_FILE)) {
          try { leads = JSON.parse(fs.readFileSync(LEADS_FILE, 'utf8')); } catch (e) {}
        }
        leads.push(lead);
        fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2), 'utf8');
        sendJSON(res, 200, { success: true, lead });
      }
    } catch (e) {
      sendJSON(res, 400, { error: 'Invalid JSON payload' });
    }
    return;
  }

  // ════════════════════════════════════════
  // ── API: DELETE /api/leads?id=xxx ──
  // ════════════════════════════════════════
  if (pathname === '/api/leads' && req.method === 'DELETE') {
    if (!validateToken(req)) { sendJSON(res, 401, { error: 'Unauthorized' }); return; }
    const id = parsedUrl.query.id;
    if (!id) { sendJSON(res, 400, { error: 'Lead ID required' }); return; }

    if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
      try {
        const r = await supabaseFetch(`/leads?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE' });
        sendJSON(res, r.ok ? 200 : r.status, r.ok ? { success: true } : { error: 'Failed to delete' });
      } catch (e) {
        sendJSON(res, 500, { error: 'Supabase delete error: ' + e.message });
      }
    } else {
      let leads = [];
      if (fs.existsSync(LEADS_FILE)) {
        try { leads = JSON.parse(fs.readFileSync(LEADS_FILE, 'utf8')); } catch (e) {}
      }
      const filtered = leads.filter(l => l.id !== id);
      fs.writeFileSync(LEADS_FILE, JSON.stringify(filtered, null, 2), 'utf8');
      sendJSON(res, 200, { success: true });
    }
    return;
  }

  // ════════════════════════════════════════
  // ── API: GET /api/content ──
  // ════════════════════════════════════════
  if (pathname === '/api/content' && req.method === 'GET') {
    if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
      try {
        const r = await supabaseFetch('/content?select=key,value');
        const rows = await r.json();
        // Convert [{key, value}] array → flat object
        const config = {};
        if (Array.isArray(rows)) rows.forEach(row => { config[row.key] = row.value; });
        sendJSON(res, 200, config);
      } catch (e) {
        sendJSON(res, 500, { error: 'Supabase fetch error: ' + e.message });
      }
    } else {
      let content = {};
      if (fs.existsSync(CONTENT_FILE)) {
        try { content = JSON.parse(fs.readFileSync(CONTENT_FILE, 'utf8')); } catch (e) {}
      }
      sendJSON(res, 200, content);
    }
    return;
  }

  // ════════════════════════════════════════
  // ── API: POST /api/content ──
  // ════════════════════════════════════════
  if (pathname === '/api/content' && req.method === 'POST') {
    if (!validateToken(req)) { sendJSON(res, 401, { error: 'Unauthorized' }); return; }

    try {
      const newContent = await getRequestBody(req);

      if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
        // Upsert each key-value pair
        const rows = Object.entries(newContent).map(([key, value]) => ({ key, value }));
        try {
          const r = await supabaseFetch('/content', {
            method: 'POST',
            body: JSON.stringify(rows),
            headers: { Prefer: 'resolution=merge-duplicates,return=representation' }
          });
          sendJSON(res, r.ok ? 200 : r.status, r.ok ? { success: true } : { error: 'Failed to save' });
        } catch (e) {
          sendJSON(res, 500, { error: 'Supabase upsert error: ' + e.message });
        }
      } else {
        fs.writeFileSync(CONTENT_FILE, JSON.stringify(newContent, null, 2), 'utf8');
        sendJSON(res, 200, { success: true });
      }
    } catch (e) {
      sendJSON(res, 400, { error: 'Invalid JSON payload' });
    }
    return;
  }

  // ════════════════════════════════════════
  // ── STATIC FILE SERVING ──
  // ════════════════════════════════════════

  // Clean URL rewrites
  if (pathname === '/') {
    pathname = '/index.html';
  } else {
    const cleanPages = [
      '/overview',
      '/location',
      '/features',
      '/gallery',
      '/amenities',
      '/payment',
      '/manager/login',
      '/manager/dashboard'
    ];
    const normPath = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
    if (cleanPages.includes(normPath)) {
      pathname = normPath + '.html';
    }
  }

  // URL-decode so %20 (and similar) resolves to actual filenames with spaces
  try { pathname = decodeURIComponent(pathname); } catch (e) {}

  const safePath = path.normalize(pathname).replace(/^(\.\.[\\/])+/, '');
  let filePath = path.join(__dirname, safePath);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  fs.exists(filePath, exists => {
    if (!exists) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    const stream = fs.createReadStream(filePath);
    stream.on('error', () => {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('500 Internal Server Error');
    });
    stream.pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`✅  Server running at http://localhost:${PORT}/`);
  console.log(`🔐  Manager Login:     http://localhost:${PORT}/manager/login`);
  console.log(`📊  Admin Dashboard:   http://localhost:${PORT}/manager/dashboard`);
  console.log(`    Login → ${ADMIN_USERNAME}`);
  if (SUPABASE_URL) {
    console.log(`🗄️  Supabase: ${SUPABASE_URL}`);
  } else {
    console.log(`📁  Database: Local JSON files (no Supabase configured)`);
  }
});
