import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// જો કી લોડ ન થઈ હોય તો એરર બતાવો
if (!supabaseServiceKey) {
  console.error("ADMIN ERROR: SUPABASE_SERVICE_ROLE_KEY is missing! Check your .env.local file.");
}

export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceKey || "" // કી ખાલી હોય તો એરરથી બચવા માટે
);