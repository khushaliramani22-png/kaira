import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabaseAdmin";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("orders")
      .select("user_id,email,customer_name,total_amount");

    if (error) {
      console.error("Order stats fetch error:", error.message);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    const orderStatsById = {};
    const orderStatsByEmail = {};
    const orderStatsByName = {};
    const orderStatsByFirstName = {};

    (data || []).forEach((order) => {
      const orderUserId = order.user_id ? String(order.user_id).trim() : null;
      const orderEmail = order.email ? String(order.email).toLowerCase().trim() : null;
      const orderName = order.customer_name ? String(order.customer_name).toLowerCase().trim() : null;
      const orderFirstName = orderName ? orderName.split(" ")[0] : null;
      const amount = parseFloat(order.total_amount) || 0;

      if (orderUserId) {
        if (!orderStatsById[orderUserId]) orderStatsById[orderUserId] = { count: 0, sum: 0 };
        orderStatsById[orderUserId].count += 1;
        orderStatsById[orderUserId].sum += amount;
      }

      if (orderEmail) {
        if (!orderStatsByEmail[orderEmail]) orderStatsByEmail[orderEmail] = { count: 0, sum: 0 };
        orderStatsByEmail[orderEmail].count += 1;
        orderStatsByEmail[orderEmail].sum += amount;
      }

      if (orderName) {
        if (!orderStatsByName[orderName]) orderStatsByName[orderName] = { count: 0, sum: 0 };
        orderStatsByName[orderName].count += 1;
        orderStatsByName[orderName].sum += amount;
      }

      if (orderFirstName) {
        if (!orderStatsByFirstName[orderFirstName]) orderStatsByFirstName[orderFirstName] = { count: 0, sum: 0 };
        orderStatsByFirstName[orderFirstName].count += 1;
        orderStatsByFirstName[orderFirstName].sum += amount;
      }
    });

    return NextResponse.json({
      success: true,
      stats: {
        byUserId: orderStatsById,
        byEmail: orderStatsByEmail,
        byName: orderStatsByName,
        byFirstName: orderStatsByFirstName,
      },
    });
  } catch (err) {
    console.error("Order stats API error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
