import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true, // આ સેશનને યાદ રાખશે
    autoRefreshToken: true,
    detectSessionInUrl: true, // URL માંથી ટોકન આપમેળે શોધી લેશે
  },
});