import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.log("Missing Supabase credentials in .env.local");
  process.exit(0);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase
    .from('user_collections')
    .select('id, name, collection_items(count)')
    .limit(5);

  console.log("Result:");
  console.log(JSON.stringify(data, null, 2));
  if (error) console.error("Error:", error);
}
run();
