import { NextResponse } from "next/server";
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers';

const defaultSettings = {
  global: {
    site_title: "Kaira Fashion Store",
    store_name: "Kaira Fashion Store",
    support_email: "support@kaira.com",
    support_phone: "+91 00000 00000",
    currency: "INR",
    tax_rate: 18,
    maintenance_mode: false,
    checkout_enabled: true,
    shipping_flat_rate: 50,
    shipping_free_above: 2000,
  },
  apps: {
    razorpay_key: "",
    razorpay_secret: "",
    delhivery_token: "",
    auto_sync: false,
  },
  notifications: {
    order_status: true,
    payment_conf: true,
    payment_failed: true,
    abandoned_cart: false,
    price_drop: false,
    login_otp: true,
  },
  snippets: {
    return_inst: "",
    refund_timeline: "",
    size_guide: "",
    shipping_charges: "",
    delayed_order: "",
    out_of_stock: "",
    feedback: "",
  },
};

export async function GET() {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          get(name) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )
    const { data, error } = await supabase
      .from("store_settings")
      .select("settings_json")
      .eq("id", 1)
      .single();

    if (error) {
      console.error("Error loading settings:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      settings_json: data?.settings_json ?? defaultSettings,
    });
  } catch (err) {
    console.error("GET /api/settings error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
