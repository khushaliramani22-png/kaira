import { createBrowserClient } from '@supabase/ssr'

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: true, // સેશનને બ્રાઉઝરમાં સાચવી રાખવા માટે
        autoRefreshToken: true, // ટોકન એક્સપાયર થાય તો ઓટોમેટિક અપડેટ કરવા
        detectSessionInUrl: true // ઈમેલ કન્ફર્મેશન લિંક્સ માટે
      }
    }
  )