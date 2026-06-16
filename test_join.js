const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function test() {
  const { data, error } = await supabase
    .from('orders')
    .select('id, profiles:user_id(first_name, last_name)');
  
  if (error) console.error("Error with profiles:user_id:", error);
  else console.log("Success with profiles:user_id:", data?.length);

  const { data: d2, error: e2 } = await supabase
    .from('orders')
    .select('id, profiles(first_name, last_name)');
  
  if (e2) console.error("Error with profiles():", e2);
  else console.log("Success with profiles():", d2?.length);
}

test();
