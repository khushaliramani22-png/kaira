import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

async function verifyAdmin(request) {
  try {
    const cookieStore = await cookies();
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
        },
      }
    );

    let user = null;
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    console.log('🔍 Admin auth check started. Token present:', !!token, 'Cookies:', cookieStore.getAll().length);

    // 1. PRIORITIZE COOKIES FIRST (client session)
    console.log('🔍 [1] Checking cookies/session...');
    const { data: { user: cookieUser }, error: cookieError } = await supabase.auth.getUser();
    if (!cookieError && cookieUser) {
      user = cookieUser;
      console.log('✅ Cookie session found:', cookieUser.email);
    }

    // 2. FALLBACK to Bearer token if no cookies
    if (!user && token) {
      console.log('🔍 [2] Checking Bearer token...');
      const { data: { user: tokenUser }, error: tokenError } = await supabase.auth.getUser(token);
      if (!tokenError && tokenUser) {
        user = tokenUser;
        console.log('✅ Bearer token valid:', tokenUser.email);
      } else {
        console.log('❌ Bearer token invalid:', tokenError?.message);
      }
    }

    if (!user) {
      console.error('❌ NO VALID SESSION: cookies failed, token failed');
      return { error: 'No session found - Please login again', status: 401 };
    }

    // 3. Admin email/role check
    const adminEmail = 'khushaliramani22@gmail.com';
    if (user.email !== adminEmail) {
      console.log(`🚫 Unauthorized email: ${user.email} (expected: ${adminEmail})`);
      return { error: `Forbidden: Admin access required (use ${adminEmail})`, status: 403 };
    }

    // 4. Check token expiry (simple)
    const now = Math.floor(Date.now() / 1000);
    if (user.expires_at && user.expires_at < now + 60) {
      console.log('⚠️ Token expiring soon, recommend refresh');
    }

    console.log(`✅ ADMIN VERIFIED: ${user.email} | expires: ${user.expires_at}`);
    return { user, status: 200 };
  } catch (error) {
    console.error('💥 verifyAdmin CRASHED:', error.message, error.stack);
    return { error: `Auth error: ${error.message}`, status: 500 };
  }
}

// GET - Fetch all banners (no auth needed)
export async function GET(request) {
  try {
    const { data, error } = await supabaseAdmin
      .from('banners')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return Response.json({ data }, { status: 200 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// POST - Add banner (Admin only)
export async function POST(request) {
  try {
    const auth = await verifyAdmin(request);
    if (auth.error) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const { title, subtitle, description, image_url } = body;

    if (!title || !image_url) {
      return Response.json(
        { error: 'Title and image_url are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('banners')
      .insert([
        {
          title,
          subtitle: subtitle || null,
          description: description || null,
          image_url,
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) throw error;
    return Response.json({ data }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Update banner (Admin only)
export async function PUT(request) {
  try {
    const auth = await verifyAdmin(request);
    if (auth.error) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const { id, title, subtitle, description, image_url } = body;

    if (!id) {
      return Response.json({ error: 'ID is required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('banners')
      .update({
        title,
        subtitle: subtitle || null,
        description: description || null,
        image_url,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select();

    if (error) throw error;
    return Response.json({ data }, { status: 200 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Delete banner (Admin only)
export async function DELETE(request) {
  try {
    const auth = await verifyAdmin(request);
    if (auth.error) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return Response.json({ error: 'ID is required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('banners')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return Response.json({ message: 'Banner deleted successfully' }, { status: 200 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
