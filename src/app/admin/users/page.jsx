"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUserDetails = useCallback(async () => {
    if (!params.id) return;

    // ૧. યુઝરની પ્રોફાઇલ ફેચ કરો
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", params.id)
      .single();

    setUser(profileData);

    // ૨. યુઝરના તમામ ઓર્ડર્સ ફેચ કરો (order_number સાથે)
    const { data: orderData } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", params.id)
      .order("created_at", { ascending: false });

    setOrders(orderData || []);
    setLoading(false);
  }, [params.id]);

  useEffect(() => {
    fetchUserDetails();
  }, [fetchUserDetails]);

  if (loading) return <div className="p-10 text-center animate-pulse text-gray-500 font-bold">Loading User Details...</div>;
  if (!user) return <div className="p-10 text-center text-red-500">User not found.</div>;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition"
      >
        ← Back to Users
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Side: User Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 text-center">
            <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-3xl font-black mx-auto mb-4 border-4 border-white shadow-md">
              {user.full_name ? user.full_name[0].toUpperCase() : "U"}
            </div>
            <h2 className="text-xl font-extrabold text-gray-800">{user.full_name || "N/A"}</h2>
            <p className="text-sm text-gray-400 font-medium">Customer</p>

            <div className="mt-8 space-y-4 text-left border-t pt-6">
              <div>
                <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest">Email Address</p>
                <p className="text-sm font-bold text-gray-700 break-all">{user.email}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest">Phone Number</p>
                <p className="text-sm font-bold text-gray-700">{user.phone || "Not Provided"}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest">Member Since</p>
                <p className="text-sm font-bold text-gray-700">{new Date(user.created_at).toLocaleDateString("en-IN")}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Order History Table */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b flex justify-between items-center bg-gray-50/30">
              <h3 className="font-black text-gray-800 flex items-center gap-2">
                📦 Order History
              </h3>
              <span className="bg-gray-900 text-white text-[10px] px-3 py-1 rounded-full font-black">
                {orders.length} ORDERS
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50 text-[10px] uppercase tracking-widest text-gray-400 font-black">
                    <th className="p-5">Order ID</th>
                    <th className="p-5">Date</th>
                    <th className="p-5">Amount</th>
                    <th className="p-5">Status</th>
                    <th className="p-5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-blue-50/20 transition-all group">
                      <td className="p-5">
                        <span className="font-mono text-xs font-black text-blue-600 bg-blue-50 px-2 py-1 rounded">
                          {order.order_number
                            ? `#${order.order_number}`
                            : `#${String(order.id).slice(-6).toUpperCase()}`
                          }
                        </span>
                      </td>
                      <td className="p-5 text-xs font-bold text-gray-500">
                        {new Date(order.created_at).toLocaleDateString("en-IN")}
                      </td>
                      <td className="p-5 text-sm font-black text-gray-900">
                        ₹{order.total_amount}
                      </td>
                      <td className="p-5 text-sm">
                        <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                            order.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                              'bg-gray-800 text-white'
                          }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="p-5 text-center">
                        <button
                          onClick={() => router.push(`/admin/orders/${order.order_number || order.id}`)}
                          className="text-[10px] font-black py-2 px-4 border-2 border-gray-100 rounded-xl hover:bg-gray-900 hover:text-white transition-all"
                        >
                          VIEW DETAILS
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {orders.length === 0 && (
                <div className="p-20 text-center text-gray-300 font-bold uppercase tracking-widest text-xs">
                  No orders yet
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}