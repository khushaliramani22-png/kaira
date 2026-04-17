import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Client for sign-in (public anon key)
const supabaseClient = createClient(supabaseUrl, anonKey);

export async function POST(req) {
  try {
    console.log('📥 API /admin/settings POST called');
    
    const body = await req.json();
    console.log('📦 Request Body:', JSON.stringify(body, null, 2));
    
    const { settings_json } = body;
    if (!settings_json) {
      return Response.json({ success: false, error: "settings_json is required" }, { status: 400 });
    }

    let passwordChanged = false;

    // Handle password change with verification
    const hasPasswordChange = settings_json.security?.current_password && settings_json.security?.new_password;
    
    console.log('🔑 Password change requested:', hasPasswordChange);
    
    if (hasPasswordChange) {
      try {
        // Admin email from your system
        const ADMIN_EMAIL = 'khushaliramani22@gmail.com';
        
        console.log('🔍 Verifying credentials for:', ADMIN_EMAIL);
        
        // Step 1: Verify current password using public client sign-in
        const { error: signInError } = await supabaseClient.auth.signInWithPassword({
          email: ADMIN_EMAIL,
          password: settings_json.security.current_password
        });

        if (signInError) {
          console.log('❌ Sign-in failed (wrong password):', signInError.message);
          return Response.json({ 
            success: false, 
            message: 'Invalid current password',
            passwordChanged: false 
          }, { status: 401 });
        }

        console.log('✅ Current password verified via sign-in');

        // Sign out immediately (security)
        await supabaseClient.auth.signOut();

        // Step 2: Update password with admin privileges
        const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();
        if (listError) throw listError;

        const targetUser = users.users.find(u => u.email === ADMIN_EMAIL);
        if (!targetUser) {
          throw new Error(`No user found with email: ${ADMIN_EMAIL}`);
        }

        console.log('📝 Updating password for user:', targetUser.id);

        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
          targetUser.id,
          { password: settings_json.security.new_password }
        );

        if (updateError) {
          console.error('Update error:', updateError);
          throw updateError;
        }

        passwordChanged = true;
        console.log('✅ Password updated successfully');

        // Clean sensitive fields
        settings_json.security.current_password = null;
        settings_json.security.new_password = null;

      } catch (passwordError) {
        console.error('Password change failed:', passwordError);
        return Response.json({ 
          success: false, 
          message: `Password change failed: ${passwordError.message}`,
          passwordChanged: false 
        }, { status: 500 });
      }
    }

    // Save settings
    console.log('💾 Saving settings...');
    
    const { data, error: upsertError } = await supabaseAdmin
      .from('store_settings')
      .upsert([{ id: 1, settings_json }])
      .select()
      .eq('id', 1)
      .single();

    if (upsertError) {
      console.error('Settings upsert error:', upsertError);
      return Response.json({ success: false, error: `Settings save failed: ${upsertError.message}` }, { status: 500 });
    }

    console.log('✅ Settings saved', { passwordChanged });

    return Response.json({ 
      success: true, 
      data, 
      passwordChanged,
      message: passwordChanged ? 'Password updated successfully' : 'Settings saved successfully'
    });

  } catch (err) {
    console.error('🚨 API Error:', err);
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
