/**
 * setup-db.js  —  Run this ONCE to create the required Supabase tables.
 * Usage:  node setup-db.js
 * Requires: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env
 */

require('./load-env');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌  Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

async function runSQL(sql) {
  const resp = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ sql })
  });
  return resp;
}

// Use the Supabase Management API SQL endpoint instead
async function execSQL(sql) {
  const projectRef = SUPABASE_URL.replace('https://', '').split('.')[0];
  const resp = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query: sql })
  });
  const text = await resp.text();
  return { status: resp.status, body: text };
}

async function setup() {
  console.log('🔧  Setting up Supabase database tables...');
  console.log(`🌐  Project: ${SUPABASE_URL}`);

  // ── 1. Try to create leads table via PostgREST (check if exists) ──
  const checkLeads = await fetch(`${SUPABASE_URL}/rest/v1/leads?limit=1`, {
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`
    }
  });

  if (checkLeads.status === 200) {
    console.log('✅  leads table already exists.');
  } else {
    console.log('⚠️   leads table not found (HTTP', checkLeads.status, ')');
    console.log('\n📋  Please run the following SQL in your Supabase SQL Editor:');
    console.log('    https://supabase.com/dashboard/project/cmfzxxtduigjxzlbauis/sql\n');
    console.log(`-- ══════════ COPY AND RUN THIS SQL ══════════

-- Leads table (stores interest registrations)
create table if not exists leads (
  id          text primary key,
  timestamp   timestamptz default now(),
  name        text not null,
  phone       text not null,
  email       text,
  rooms       text
);

-- Allow anyone to INSERT leads (from the registration popup)
alter table leads enable row level security;
create policy "Allow public lead insert" on leads
  for insert with check (true);

-- Allow service role to read/delete leads (admin dashboard)
create policy "Allow service read leads" on leads
  for select using (true);
create policy "Allow service delete leads" on leads
  for delete using (true);

-- Content table (stores dynamic site configuration)
create table if not exists content (
  key   text primary key,
  value text not null
);

-- Allow anyone to read content
alter table content enable row level security;
create policy "Allow public read content" on content
  for select using (true);
create policy "Allow service write content" on content
  for all using (true);

-- Insert default content values
insert into content (key, value) values
  ('startingPrice',         '145,000'),
  ('maxPrice',              '160,000'),
  ('currency',              'USD'),
  ('heroSub',               'Luxury 3BHK Fully Furnished Condominiums • From USD 145,000'),
  ('locationMapUrl',        'https://maps.google.com/maps?q=0.333661,32.609139&z=17&output=embed'),
  ('locationDirectionsUrl', 'https://www.google.com/maps/place/0%C2%B020%2701.2%22N+32%C2%B036%2732.9%22E/@0.333661,32.6065641,991m')
on conflict (key) do nothing;

-- ══════════ END OF SQL ══════════`);
    return;
  }

  // ── 2. Check content table ──
  const checkContent = await fetch(`${SUPABASE_URL}/rest/v1/content?limit=1`, {
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`
    }
  });

  if (checkContent.status === 200) {
    const rows = await checkContent.json();
    console.log(`✅  content table exists with ${rows.length} row(s).`);
  } else {
    console.log('⚠️   content table not found.');
  }

  // ── 3. Seed default content if table is empty ──
  const contentRows = await fetch(`${SUPABASE_URL}/rest/v1/content?select=key,value`, {
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`
    }
  });

  if (contentRows.ok) {
    const data = await contentRows.json();
    if (data.length === 0) {
      console.log('📝  Seeding default content values...');
      const defaults = [
        { key: 'startingPrice',         value: '145,000' },
        { key: 'maxPrice',              value: '160,000' },
        { key: 'currency',              value: 'USD' },
        { key: 'heroSub',               value: 'Luxury 3BHK Fully Furnished Condominiums • From USD 145,000' },
        { key: 'locationMapUrl',        value: 'https://maps.google.com/maps?q=0.333661,32.609139&z=17&output=embed' },
        { key: 'locationDirectionsUrl', value: 'https://www.google.com/maps/place/0%C2%B020%2701.2%22N+32%C2%B036%2732.9%22E/@0.333661,32.6065641,991m' }
      ];

      const seedResp = await fetch(`${SUPABASE_URL}/rest/v1/content`, {
        method: 'POST',
        headers: {
          apikey: SERVICE_KEY,
          Authorization: `Bearer ${SERVICE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'resolution=merge-duplicates'
        },
        body: JSON.stringify(defaults)
      });

      if (seedResp.ok) {
        console.log('✅  Default content values seeded!');
      } else {
        const err = await seedResp.text();
        console.log('⚠️   Seeding failed:', err);
      }
    } else {
      console.log(`✅  Content table already has ${data.length} row(s) — skipping seed.`);
    }
  }

  console.log('\n🎉  Database setup complete!');
  console.log('🔐  Admin login: manager@greenforest.com / Greenforest2026!');
  console.log('📊  Dashboard:   http://localhost:8080/manager/dashboard');
}

setup().catch(err => {
  console.error('❌  Setup error:', err.message);
  process.exit(1);
});
