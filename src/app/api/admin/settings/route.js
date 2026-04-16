import { createClient } from "@supabase/supabase-js";

export async function POST(req) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseServiceKey) {
      return new Response(JSON.stringify({ success: false, error: 'Service key missing' }), { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body = await req.json();
    const { settings_json } = body;

    if (!settings_json) {
      return new Response(JSON.stringify({ success: false, error: "settings_json is required" }), { 
        status: 400, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    const { data, error } = await supabase
      .from("store_settings")
      .upsert([{ id: 1, settings_json }])
      .select();

    if (error) throw error;

    return new Response(JSON.stringify({ success: true, data }), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' } 
    });
  } catch (err) {
    console.error("API Error:", err);
    return new Response(JSON.stringify({ success: false, error: err.message }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }
}
