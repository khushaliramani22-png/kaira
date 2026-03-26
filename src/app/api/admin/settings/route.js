import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabaseAdmin";

 

export async function POST(req) {
  try {
    const body = await req.json();
    const { settings_json } = body;

    if (!settings_json) {
      return NextResponse.json(
        { success: false, error: "settings_json is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("store_settings")
      .upsert(
        [
          {
            id: 1,
            settings_json,
            updated_at: new Date().toISOString(),
          },
        ],
        { onConflict: "id" }
      )
      .select();

    if (error) {
      console.error("Supabase save error:", error);
      return NextResponse.json(
        { success: false, error: error.message, details: error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Settings saved successfully",
      data,
    });
  } catch (err) {
    console.error("API route error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}