import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabaseAdmin";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("id");
    const email = searchParams.get("email");

    if (!userId && !email) {
      return NextResponse.json(
        { success: false, error: "Missing user id or email" },
        { status: 400 }
      );
    }

    let query = supabaseAdmin.from("orders").select("*").order("created_at", { ascending: false });

    if (userId && email) {
      query = query.or(`user_id.eq.${userId},email.eq.${email}`);
    } else if (userId) {
      query = query.eq("user_id", userId);
    } else if (email) {
      query = query.eq("email", email);
    }

    const { data, error } = await query;

    if (error) {
      console.error("User orders fetch error:", error.message);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, orders: data || [] });
  } catch (err) {
    console.error("User orders API error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
