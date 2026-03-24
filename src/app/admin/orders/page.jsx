"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { RefreshCw, MapPin } from "lucide-react";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Orders
  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false }); // નવા ઓર્ડર પહેલા દેખાશે

    if (!error) {
      setOrders(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Update Order Status
  const updateStatus = async (id, status) => {
    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", id);

    if (error) {
      console.log("Update error:", error);
      alert("Status update failed");
    } else {
      fetchOrders();
    }
  };

  if (loading) {
    return (
      <div className="p-10 text-center font-bold text-gray-400">
        Loading Orders...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white rounded-xl shadow border">

        {/* HEADER */}
        <div className="p-6 border-b flex justify-between items-center">
          <h1 className="text-xl font-bold">Manage Orders</h1>
          <button
            onClick={fetchOrders}
            className="p-2 hover:bg-gray-100 rounded"
          >
            <RefreshCw size={20} />
          </button>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm">
                <th className="p-4 text-left">No.</th>
                <th className="p-4 text-left">Customer</th>
                <th className="p-4 text-left">Address</th>
                <th className="p-4 text-left">Total</th>
                <th className="p-4 text-center w-60">Action</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order, index) => (
                <tr key={order.id} className="border-b hover:bg-gray-50">

                  {/* SERIAL NUMBER (#1, #2, #3...) */}
                  <td className="p-4">
                    {/* SERIAL NUMBER (#ID) */}

                    <div className="font-bold text-gray-900">
                      #{order.order_number}
                    </div>
                    <div style={{ marginTop: "4px" }}>
                      <span
                        style={{
                          display: "inline-block",
                          background:
                            order.status === "Confirmed"
                              ? "#22c55e"
                              : order.status === "Canceled"
                                ? "#ef4444"
                                : "#f59e0b",
                          color: "#fff",
                          padding: "3px 8px",
                          borderRadius: "4px",
                          fontSize: "11px",
                          fontWeight: "600",
                        }}
                      >
                        {order.status || "Pending"}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(order.created_at).toLocaleDateString()}
                    </div>
                  </td>

                  {/* CUSTOMER */}
                  <td className="p-4">
                    <div className="font-semibold">{order.customer_name}</div>
                    <div className="text-sm text-gray-500">{order.phone}</div>
                  </td>

                  {/* ADDRESS */}
                  <td className="p-4 text-sm text-gray-600">
                    {order.address}
                    {order.area && (
                      <div className="flex items-center gap-1 text-xs mt-1">
                        <MapPin size={12} /> {order.area}
                      </div>
                    )}
                  </td>

                  {/* TOTAL */}
                  <td className="p-4 font-semibold">
                    ₹{order.total_amount}
                    <div className="text-xs text-gray-400">
                      {order.payment_method || "COD"}
                    </div>
                  </td>

                  {/* ACTION BUTTONS */}
                  <td className="p-4">
                    <div className="flex flex-col gap-2 items-center">
                      <button
                        onClick={() => window.location.href = `/admin/orders/${order.id}`}
                        style={{ background: "#3b82f6", color: "#fff", padding: "6px 12px", borderRadius: "4px", fontSize: "12px", width: "80px" }}
                      >
                        View
                      </button>
                      <button
                        onClick={() => updateStatus(order.id, "Confirmed")}
                        style={{ background: "#22c55e", color: "#fff", padding: "6px 12px", borderRadius: "4px", fontSize: "12px", width: "80px" }}
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => updateStatus(order.id, "Canceled")}
                        style={{ background: "#ef4444", color: "#fff", padding: "6px 12px", borderRadius: "4px", fontSize: "12px", width: "80px" }}
                      >
                        Cancel
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}