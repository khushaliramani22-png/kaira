import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function PUT(request, { params }) {
  try {
    // ૧. Next.js 15+ માં params ને await કરવું જરૂરી છે
    const { id } = await params; 

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch (err) {
              console.log("Error setting cookies:", err);
            }
          },
        },
      }
    );

    // ૨. યુઝર ઓથેન્ટિકેશન ચેક કરો
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // ૩. એડમિન એક્સેસ વેરીફાય કરો
    const allowedAdmins = ["admin@gmail.com", "khushaliramani22@gmail.com"];
    if (!allowedAdmins.includes(user.email)) {
      return new Response(
        JSON.stringify({ error: "Admin access required" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    // ૪. રિક્વેસ્ટ બોડી પાર્સ કરો
    const body = await request.json();
    const { title, description, content, category, status, image_url } = body;

    if (!title || !content) {
      return new Response(
        JSON.stringify({ error: "Title and content are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // ૫. Service Role સાથે Admin Client બનાવો (ડેટા અપડેટ કરવા માટે)
    const supabaseAdmin = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(cookiesToSet) { /* ... */ },
        },
      }
    );

    const { data, error } = await supabaseAdmin
      .from("blogs")
      .update({
        title,
        description: description || "",
        content,
        category: category || "Fashion",
        status: status || "draft",
        image_url: image_url || "",
        updated_at: new Date().toISOString(), // અપડેટ ટાઈમ ઉમેરો
      })
      .eq("id", id)
      .select();

    if (error) {
      console.error("Blog update error:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, data: data[0] }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("API error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params; // અહીં પણ await કરો
    const cookieStore = await cookies();
    
    // ... બાકીનો તમારો DELETE કોડ અહીં ચાલુ રહેશે (params.id ને બદલે ફક્ત id વાપરવું)
    const supabaseAdmin = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(cookiesToSet) { /* ... */ },
        },
      }
    );

    // ૧. પહેલા ઈમેજ URL મેળવો (ડીલીટ કરવા માટે)
    const { data: blog } = await supabaseAdmin
      .from("blogs")
      .select("image_url")
      .eq("id", id)
      .single();

    if (blog?.image_url) {
      const urlParts = blog.image_url.split("/storage/v1/object/public/products/");
      if (urlParts[1]) {
        await supabaseAdmin.storage.from("products").remove([urlParts[1]]);
      }
    }

    // ૨. બ્લોગ ડીલીટ કરો
    const { error: deleteError } = await supabaseAdmin
      .from("blogs")
      .delete()
      .eq("id", id);

    if (deleteError) throw deleteError;

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}