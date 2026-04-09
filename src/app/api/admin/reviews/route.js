import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const parseCookies = (cookieHeader = '') => {
  return Object.fromEntries(
    cookieHeader
      .split(';')
      .map((cookie) => cookie.split('='))
      .map(([name, ...rest]) => [name.trim(), decodeURIComponent(rest.join('=').trim())])
  );
};

const createSupabaseClientFromRequest = (request) => {
  const cookieHeader = request.headers.get('cookie') || '';
  const cookieMap = parseCookies(cookieHeader);

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name) {
        return cookieMap[name] || null;
      },
      set() {},
      remove() {},
    },
  });
};

async function getAdminUser(request) {
  try {
    const supabase = createSupabaseClientFromRequest(request);

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      return { user: null, error: userError?.message || 'Not authenticated' };
    }

    const { data, error } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', userData.user.id)
      .single();

    if (error || !data || data.role !== 'admin') {
      return { user: null, error: 'Unauthorized' };
    }

    return { user: userData.user, role: data.role };
  } catch (err) {
    console.error('Admin auth validation failed:', err);
    return { user: null, error: err?.message || 'Auth validation failed' };
  }
}

export async function PATCH(request) {
  try {
    const auth = await getAdminUser(request);
    if (!auth.user) {
      return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
    }

    const body = await request.json();
    const { id, status = 'approved' } = body;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Review ID is required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('product_reviews')
      .update({ status })
      .eq('id', id)
      .select();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('Admin reviews PATCH error:', err);
    return NextResponse.json({ success: false, error: err?.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const auth = await getAdminUser(request);
    if (!auth.user) {
      return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
    }

    const body = await request.json();
    const { id } = body;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Review ID is required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from('product_reviews').delete().eq('id', id);
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Admin reviews DELETE error:', err);
    return NextResponse.json({ success: false, error: err?.message || 'Internal Server Error' }, { status: 500 });
  }
}
