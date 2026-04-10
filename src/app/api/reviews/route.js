import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const parseCookies = (cookieHeader = '') => {
  try {
    return Object.fromEntries(
      cookieHeader
        .split(';')
        .filter(cookie => cookie.includes('='))
        .map((cookie) => {
          const [name, ...rest] = cookie.split('=');
          const trimmedName = name.trim();
          const trimmedValue = rest.join('=').trim();
          try {
            return [trimmedName, decodeURIComponent(trimmedValue)];
          } catch (err) {
            console.warn(`Failed to decode cookie "${trimmedName}":`, err.message);
            return [trimmedName, trimmedValue];
          }
        })
    );
  } catch (err) {
    console.error('Cookie parsing failed:', err);
    return {};
  }
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
      const errorMsg = userError?.message || 'Not authenticated';
      console.warn('Auth error:', errorMsg);
      return { user: null, error: errorMsg };
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
      console.warn('POST /api/reviews: User not authenticated -', auth.error);
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

    const customerName = auth.user.user_metadata?.full_name || auth.user.email || 'Guest';

    // Check for existing review by product_id AND customer_name (matches the unique constraint)
    const existingReviewQuery = await supabaseAdmin
      .from('product_reviews')
      .select('id,user_id')
      .eq('product_id', product_id)
      .eq('customer_name', customerName)
      .maybeSingle();

    if (existingReviewQuery.error) {
      console.error('Query error checking existing review:', existingReviewQuery.error);
      return NextResponse.json({ success: false, error: existingReviewQuery.error.message }, { status: 500 });
    }

    const payload = {
      product_id,
      user_id: auth.user.id,
      customer_name: customerName,
      rating,
      fabric_rating,
      comment,
      review_image: review_image || null,
      status: 'pending',
    };

    let result;
    if (existingReviewQuery.data) {
      // Update existing review
      console.log('Updating existing review:', existingReviewQuery.data.id);
      result = await supabaseAdmin
        .from('product_reviews')
        .update(payload)
        .eq('id', existingReviewQuery.data.id)
        .select();
    } else {
      // Insert new review
      console.log('Inserting new review for product:', product_id);
      result = await supabaseAdmin
        .from('product_reviews')
        .insert([payload])
        .select();
    }

    if (result.error) {
      // Handle unique constraint violations (code 23505)
      if (result.error.code === '23505') {
        console.warn('Unique constraint violation - attempting recovery:', result.error.message);
        // Try to find and update by product_id and customer_name
        const recoveryQuery = await supabaseAdmin
          .from('product_reviews')
          .select('id')
          .eq('product_id', product_id)
          .eq('customer_name', customerName)
          .maybeSingle();

        if (recoveryQuery.data && recoveryQuery.data.id) {
          console.log('Found conflicting review, updating:', recoveryQuery.data.id);
          const recoveryResult = await supabaseAdmin
            .from('product_reviews')
            .update(payload)
            .eq('id', recoveryQuery.data.id)
            .select();

          if (recoveryResult.error) {
            console.error('Recovery update failed:', recoveryResult.error);
            return NextResponse.json({ 
              success: false, 
              error: 'Failed to update review: ' + recoveryResult.error.message 
            }, { status: 500 });
          }

          return NextResponse.json({ success: true, data: recoveryResult.data });
        }
      }

      console.error('Database operation error:', result.error);
      return NextResponse.json({ success: false, error: result.error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (err) {
    console.error('User reviews POST error:', err);
    return NextResponse.json({ success: false, error: err?.message || 'Internal Server Error' }, { status: 500 });
  }
}
