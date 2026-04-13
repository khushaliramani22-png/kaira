// import { createServerClient } from "@supabase/ssr";
// import { cookies } from "next/headers";

// export async function POST(request) {
//   try {
//     const cookieStore = await cookies();
//     const supabase = createServerClient(
//       process.env.NEXT_PUBLIC_SUPABASE_URL,
//       process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
//       {
//         cookies: {
//           getAll() {
//             return cookieStore.getAll();
//           },
//           setAll(cookiesToSet) {
//             try {
//               cookiesToSet.forEach(({ name, value, options }) =>
//                 cookieStore.set(name, value, options)
//               );
//             } catch (err) {
//               console.log("Error setting cookies:", err);
//             }
//           },
//         },
//       }
//     );

//     // Check if user is authenticated
//     const { data: { user }, error: authError } = await supabase.auth.getUser();
//     if (authError || !user) {
//       return new Response(
//         JSON.stringify({ error: "Unauthorized", details: authError?.message }),
//         { status: 401, headers: { "Content-Type": "application/json" } }
//       );
//     }

//     // Verify admin access
//     const allowedAdmins = ["admin@gmail.com", "khushaliramani22@gmail.com"];
//     if (!allowedAdmins.includes(user.email)) {
//       return new Response(
//         JSON.stringify({ error: "Admin access required", userEmail: user.email }),
//         { status: 403, headers: { "Content-Type": "application/json" } }
//       );
//     }

//     // Parse request body
//     const body = await request.json();
//     const { title, description, content, category, status, image_url } = body;

//     // Validate required fields
//     if (!title || !content) {
//       return new Response(
//         JSON.stringify({ error: "Title and content are required", received: { title, content } }),
//         { status: 400, headers: { "Content-Type": "application/json" } }
//       );
//     }

//     // Check if service role key exists
//     if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
//       console.error("SUPABASE_SERVICE_ROLE_KEY is not set");
//       return new Response(
//         JSON.stringify({ error: "Server configuration error: Missing service role key" }),
//         { status: 500, headers: { "Content-Type": "application/json" } }
//       );
//     }

//     // Create blog using service role to bypass RLS
//     const supabaseAdmin = createServerClient(
//       process.env.NEXT_PUBLIC_SUPABASE_URL,
//       process.env.SUPABASE_SERVICE_ROLE_KEY,
//       {
//         cookies: {
//           getAll() {
//             return cookieStore.getAll();
//           },
//           setAll(cookiesToSet) {
//             try {
//               cookiesToSet.forEach(({ name, value, options }) =>
//                 cookieStore.set(name, value, options)
//               );
//             } catch (err) {
//               console.log("Error setting cookies:", err);
//             }
//           },
//         },
//       }
//     );

//     const { data, error } = await supabaseAdmin
//       .from("blogs")
//       .insert({
//         title,
//         description: description || "",
//         content,
//         category: category || "Fashion",
//         status: status || "draft",
//         image_url: image_url || "",
//         created_at: new Date().toISOString(),
//       })
//       .select();

//     if (error) {
//       console.error("Blog creation error:", error);
//       return new Response(
//         JSON.stringify({ 
//           error: "Failed to create blog",
//           details: error.message,
//           code: error.code,
//           hint: error.hint 
//         }),
//         { status: 400, headers: { "Content-Type": "application/json" } }
//       );
//     }

//     return new Response(
//       JSON.stringify({ success: true, data: data[0] }),
//       { status: 201, headers: { "Content-Type": "application/json" } }
//     );
//   } catch (err) {
//     console.error("API error:", err);
//     return new Response(
//       JSON.stringify({ error: "Internal server error", details: err.message }),
//       { status: 500, headers: { "Content-Type": "application/json" } }
//     );
//   }
// }

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY, // Service role વાપરવો સુરક્ષિત છે
      { cookies: { getAll: () => cookieStore.getAll() } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

    const body = await request.json();
    const { title, description, content, category, status, image_url } = body;

    // Title માંથી Slug બનાવો (દા.ત. "Hello World" -> "hello-world")
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const { data, error } = await supabase
      .from("blogs")
      .insert({
        title,
        slug,
        description,
        content,
        category,
        status,
        image_url: image_url || null,
        author_id: user.id,
        updated_at: new Date().toISOString(),
      })
      .select();

    if (error) throw error;

    return new Response(JSON.stringify({ success: true, data: data[0] }), { status: 201 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 400 });
  }
}
