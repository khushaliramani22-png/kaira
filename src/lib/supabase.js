import { createClient } from '@supabase/supabase-js'

// ખાતરી કરો કે આ Variables તમારા .env.local અને Vercel Settings માં સાચા છે
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase URL અથવા Anon Key ખૂટે છે!");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,      // સેશન બ્રાઉઝરમાં સેવ કરવા માટે
    autoRefreshToken: true,    // ટોકન એક્સપાયર થાય તો ઓટોમેટિક નવું મેળવવા
    detectSessionInUrl: true,  // ઈમેલ કન્ફર્મેશન લિંક માટે જરૂરી
    storageKey: 'kaira-auth-token' // સ્ટોરેજમાં અલગ કી રાખવા માટે
  }
})