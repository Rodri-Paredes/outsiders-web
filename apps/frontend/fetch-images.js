
import fs from 'fs';

const env = fs.readFileSync('.env', 'utf-8').split('\n');
const supabaseUrl = env.find(l => l.startsWith('NEXT_PUBLIC_SUPABASE_URL='))?.split('=')[1].replace(/"/g, '').trim();
const supabaseKey = env.find(l => l.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY='))?.split('=')[1].replace(/"/g, '').trim();

async function run() {
  const res = await fetch(`${supabaseUrl}/rest/v1/products?select=id,name,images,image_url&order=created_at.desc&limit=5`, {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    }
  });
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}

run();
