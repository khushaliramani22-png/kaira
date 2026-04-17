import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, new_password } = body;

    if (!email || !new_password) {
      return Response.json({ success: false, message: 'Email and new password required' }, { status: 400 });
    }

    console.log('📝 Updating password for:', email);

    // Find user
    const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) throw listError;

    const targetUser = users.users.find(u => u.email === email);
    if (!targetUser) {
      return Response.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    // Update password (Supabase auto-hashes)
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      targetUser.id,
      { password: new_password }
    );

    if (updateError) {
      console.error('Update error:', updateError);
      return Response.json({ success: false, message: updateError.message }, { status: 500 });
    }

    console.log('✅ Password updated for:', email);
    return Response.json({ success: true, message: 'Password updated successfully' });

  } catch (err) {
    console.error('🚨 Update password error:', err);
    return Response.json({ success: false, message: err.message }, { status: 500 });
  }
}
