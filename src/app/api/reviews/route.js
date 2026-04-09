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

async function getUser(request) {
  try {
    const supabase = createSupabaseClientFromRequest(request);

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      return { user: null, error: userError?.message || 'Not authenticated' };
    }

    return { user: userData.user };
  } catch (err) {
    console.error('User auth validation failed:', err);
    return { user: null, error: err?.message || 'Auth validation failed' };
  }
}

export async function POST(request) {
  try {
    const auth = await getUser(request);
    if (!auth.user) {
      return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
    }

    const body = await request.json();
    const {
      product_id,
      rating,
      fabric_rating,
      comment,
      review_image,
    } = body;

    if (!product_id || !rating) {
      return NextResponse.json({ success: false, error: 'Product and rating are required' }, { status: 400 });
    }

    const existingReviewQuery = await supabaseAdmin
      .from('product_reviews')
      .select('id,user_id')
      .eq('product_id', product_id)
      .eq('user_id', auth.user.id)
      .maybeSingle();

    if (existingReviewQuery.error) {
      return NextResponse.json({ success: false, error: existingReviewQuery.error.message }, { status: 500 });
    }

    const payload = {
      product_id,
      user_id: auth.user.id,
      customer_name: auth.user.user_metadata?.full_name || auth.user.email || 'Guest',
      rating,
      fabric_rating,
      comment,
      review_image: review_image || null,
      status: 'pending',
    };

    let result;
    if (existingReviewQuery.data) {
      result = await supabaseAdmin
        .from('product_reviews')
        .update(payload)
        .eq('id', existingReviewQuery.data.id)
        .select();
    } else {
      result = await supabaseAdmin
        .from('product_reviews')
        .insert([payload])
        .select();
    }

    if (result.error) {
      return NextResponse.json({ success: false, error: result.error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (err) {
    console.error('User reviews POST error:', err);
    return NextResponse.json({ success: false, error: err?.message || 'Internal Server Error' }, { status: 500 });
  }
}
