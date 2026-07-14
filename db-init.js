/**
 * db-init.js — Initialize Supabase PostgreSQL tables for Forest Green Estates
 * Run: node db-init.js
 */

// Must be set BEFORE requiring pg to bypass Supabase's self-signed CA chain
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

require('./load-env');

const { Client } = require('pg');

const CONNECTION = 'postgres://postgres.cmfzxxtduigjxzlbauis:0te6hXcSponeO9pP@aws-0-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require';

const SQL = `
-- ═══════════════════════════════════════════════════
-- Forest Green Estates — Database Initialization
-- ═══════════════════════════════════════════════════

-- 1. LEADS TABLE — stores visitor interest registrations
create table if not exists public.leads (
  id          text        primary key default gen_random_uuid()::text,
  timestamp   timestamptz default now(),
  name        text        not null,
  phone       text        not null,
  email       text,
  rooms       text        default '3 BHK'
);

-- 2. CONTENT TABLE — stores dynamic site configuration
create table if not exists public.content (
  key   text primary key,
  value text not null
);

-- 3. SEED DEFAULT CONTENT
insert into public.content (key, value) values
  ('startingPrice',         '145,000'),
  ('maxPrice',              '160,000'),
  ('currency',              'USD'),
  ('heroSub',               'Luxury 3BHK Fully Furnished Condominiums • From USD 145,000'),
  ('locationMapUrl',        'https://maps.google.com/maps?q=0.333661,32.609139&z=17&output=embed'),
  ('locationDirectionsUrl', 'https://www.google.com/maps/place/0%C2%B020%2701.2%22N+32%C2%B036%2732.9%22E/@0.333661,32.6065641,991m/data=!3m2!1e3!4b1!4m4!3m3!8m2!3d0.333661!4d32.609139')
on conflict (key) do nothing;

-- 4. ENABLE ROW-LEVEL SECURITY
alter table public.leads   enable row level security;
alter table public.content enable row level security;

-- 5. RLS POLICIES — leads
drop policy if exists "Allow public lead insert"    on public.leads;
drop policy if exists "Allow service read leads"    on public.leads;
drop policy if exists "Allow service delete leads"  on public.leads;

create policy "Allow public lead insert"    on public.leads for insert with check (true);
create policy "Allow service read leads"    on public.leads for select using (true);
create policy "Allow service delete leads"  on public.leads for delete using (true);

-- 6. RLS POLICIES — content
drop policy if exists "Allow public read content"   on public.content;
drop policy if exists "Allow service write content" on public.content;

create policy "Allow public read content"   on public.content for select using (true);
create policy "Allow service write content" on public.content for all    using (true);
`;

async function main() {
  console.log('');
  console.log('🌿  Forest Green Estates — Supabase Database Setup');
  console.log('════════════════════════════════════════════════════');
  console.log('');

  const client = new Client({ connectionString: CONNECTION });

  try {
    process.stdout.write('🔌  Connecting to Supabase PostgreSQL... ');
    await client.connect();
    console.log('connected!');
    console.log('');

    process.stdout.write('🏗️   Creating tables & policies... ');
    await client.query(SQL);
    console.log('done!');
    console.log('');

    // Verify tables exist
    const { rows: tables } = await client.query(`
      select table_name from information_schema.tables
      where table_schema = 'public' and table_name in ('leads','content')
      order by table_name;
    `);
    console.log('📋  Tables created:');
    tables.forEach(r => console.log(`    ✅  ${r.table_name}`));
    console.log('');

    // Show seeded content
    const { rows: content } = await client.query(
      'select key, value from public.content order by key;'
    );
    console.log('📝  Seeded content values:');
    content.forEach(r => {
      const v = r.value.length > 55 ? r.value.slice(0, 55) + '...' : r.value;
      console.log(`    ✅  ${r.key.padEnd(24)} → ${v}`);
    });
    console.log('');

    // Leads count
    const { rows: [{ count }] } = await client.query('select count(*)::int from public.leads;');
    console.log(`👥  Leads in database: ${count}`);
    console.log('');

    console.log('════════════════════════════════════════════════════');
    console.log('🎉  Database ready!');
    console.log('');
    console.log('   🔐  Admin login  → manager@greenforest.com');
    console.log('   🔑  Password     → Greenforest2026!');
    console.log('   📊  Dashboard    → /manager/dashboard');
    console.log('');

  } catch (err) {
    console.log('');
    console.error('❌  Error:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
