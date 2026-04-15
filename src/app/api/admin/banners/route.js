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

    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      console.log(' No authenticated user');
      return { error: 'Unauthorized', status: 401 };
    }

    const adminEmail = 'khushaliramani22@gmail.com';
    if (user.email !== adminEmail) {
      console.log(' User not admin:', user.email);
      return { error: 'Forbidden - Admin access required', status: 403 };
    }

    console.log(' Admin verified:', user.email);
    return { user, status: 200 };
  } catch (error) {
    console.error(' Admin verification failed:', error.message);
    return { error: 'Server error', status: 500 };
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
