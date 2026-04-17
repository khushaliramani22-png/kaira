import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseClient = createClient(supabaseUrl, anonKey);

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, current_password } = body;

    if (!email || !current_password) {
      return Response.json({ success: false, message: 'Email and current password required' }, { status: 400 });
    }

    console.log('🔍 Verifying password for:', email);

    const { error } = await supabaseClient.auth.signInWithPassword({
      email,
      password: current_password
    });

    if (error) {
      console.log('❌ Verification failed:', error.message);
      return Response.json({ success: false, message: 'Invalid current password' }, { status: 401 });
    }

    // Success - sign out
    await supabaseClient.auth.signOut();
    console.log('✅ Password verified');

    return Response.json({ success: true, message: 'Password verified successfully' });

  } catch (err) {
    console.error('🚨 Verify error:', err);
    return Response.json({ success: false, message: err.message }, { status: 500 });
  }
}
