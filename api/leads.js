const fs = require('fs');
const path = require('path');

const LEADS_FILE = path.join(process.cwd(), 'leads.json');

module.exports = async (req, res) => {
  const method = req.method;
  const KV_URL = process.env.KV_REST_API_URL;
  const KV_TOKEN = process.env.KV_REST_API_TOKEN;

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // ── GET LEADS ──
  if (method === 'GET') {
    if (KV_URL && KV_TOKEN) {
      try {
        const response = await fetch(`${KV_URL}/get/leads_list`, {
          headers: { Authorization: `Bearer ${KV_TOKEN}` }
        });
        const data = await response.json();
        const leads = data.result ? JSON.parse(data.result) : [];
        res.status(200).json(leads);
      } catch (err) {
        res.status(500).json({ error: 'Failed to fetch from KV database: ' + err.message });
      }
    } else {
      // Local fallback
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

      if (KV_URL && KV_TOKEN) {
        try {
          // Get current leads
          const getRes = await fetch(`${KV_URL}/get/leads_list`, {
            headers: { Authorization: `Bearer ${KV_TOKEN}` }
          });
          const getData = await getRes.json();
          let leads = getData.result ? JSON.parse(getData.result) : [];
          
          leads.push(lead);

          // Save back
          await fetch(`${KV_URL}/set/leads_list`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${KV_TOKEN}` },
            body: JSON.stringify(leads)
          });

          res.status(200).json({ success: true, lead });
        } catch (err) {
          res.status(500).json({ error: 'Failed to save to KV database: ' + err.message });
        }
      } else {
        // Local fallback
        let leads = [];
        if (fs.existsSync(LEADS_FILE)) {
          try {
            leads = JSON.parse(fs.readFileSync(LEADS_FILE, 'utf8'));
          } catch (e) {
            leads = [];
          }
        }
        leads.push(lead);
        fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2), 'utf8');
        res.status(200).json({ success: true, lead });
      }
    });
    return;
  }

  // ── DELETE LEAD ──
  if (method === 'DELETE') {
    const id = req.query ? req.query.id : new URL(req.url, 'http://localhost').searchParams.get('id');
    if (!id) {
      res.status(400).json({ error: 'Lead ID required' });
      return;
    }

    if (KV_URL && KV_TOKEN) {
      try {
        const getRes = await fetch(`${KV_URL}/get/leads_list`, {
          headers: { Authorization: `Bearer ${KV_TOKEN}` }
        });
        const getData = await getRes.json();
        let leads = getData.result ? JSON.parse(getData.result) : [];
        
        const filteredLeads = leads.filter(l => l.id !== id);

        await fetch(`${KV_URL}/set/leads_list`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${KV_TOKEN}` },
          body: JSON.stringify(filteredLeads)
        });

        res.status(200).json({ success: true });
      } catch (err) {
        res.status(500).json({ error: 'Failed to delete from KV database: ' + err.message });
      }
    } else {
      // Local fallback
      let leads = [];
      if (fs.existsSync(LEADS_FILE)) {
        try {
          leads = JSON.parse(fs.readFileSync(LEADS_FILE, 'utf8'));
        } catch (e) {}
      }
      const filteredLeads = leads.filter(l => l.id !== id);
      fs.writeFileSync(LEADS_FILE, JSON.stringify(filteredLeads, null, 2), 'utf8');
      res.status(200).json({ success: true });
    }
    return;
  }

  res.status(405).json({ error: 'Method Not Allowed' });
};
