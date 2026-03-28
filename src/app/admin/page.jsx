"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    users: 0,
    revenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      
      // ૧. સેશન ચેક કરો (આનાથી undefined એરર જતી રહેશે)
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      
      console.log("તમારી અત્યારની લોગિન ID:", user?.id);
      console.log("તમારો લોગિન ઈમેલ:", user?.email);

      // ૨. બધા ઓર્ડર્સ ફેચ કરો (RLS Disable હશે તો ૭ આવશે)
      const { data: orders, error: orderError } = await supabase
        .from("orders")
        .select("*");

      // ૩. પ્રોડક્ટ્સ ગણો
      const { count: productCount } = await supabase
        .from("products")
        .select("*", { count: 'exact', head: true });

      // ૪. યુઝર્સ ગણો - એડમિન ઈમેલ (admin@gmail.com) સિવાયના
      const { data: usersData, count: userCount, error: userError } = await supabase
        .from("users")
        .select("*", { count: 'exact' })
        .neq("email", "admin@gmail.com");

      if (!orderError && orders) {
        // કુલ રેવન્યુ ગણો
        const totalRevenue = orders.reduce((sum, item) => sum + (Number(item.total_amount) || 0), 0);

        setStats({
          products: productCount || 0,
          orders: orders.length, // અહીં હવે ૭ દેખાશે
          users: userCount || 0,  // અહીં ૨ દેખાશે
          revenue: totalRevenue
        });
      }

      if (orderError || userError) {
        console.error("Fetch Error:", orderError?.message || userError?.message);
      }
      
      setLoading(false);
    }

    fetchData();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen font-serif tracking-widest uppercase text-xs text-gray-400">
      Loading Dashboard Data...
    </div>
  );

  return (
    <div className="container-fluid p-4 bg-white min-h-screen">
      <h1 className="mb-8 font-black uppercase tracking-tighter italic text-2xl border-b pb-4">
        Admin Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Products */}
        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 shadow-sm text-center">
          <h5 className="text-[10px] uppercase font-black tracking-widest text-gray-400 mb-2">Total Products</h5>
          <h2 className="text-3xl font-black text-blue-600">{stats.products}</h2>
        </div>

        {/* Total Orders */}
        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 shadow-sm text-center">
          <h5 className="text-[10px] uppercase font-black tracking-widest text-gray-400 mb-2">Total Orders</h5>
          <h2 className="text-3xl font-black text-green-600">{stats.orders}</h2>
        </div>

        {/* Total Users */}
        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 shadow-sm text-center">
          <h5 className="text-[10px] uppercase font-black tracking-widest text-gray-400 mb-2">Total Users</h5>
          <h2 className="text-3xl font-black text-orange-500">{stats.users}</h2>
        </div>

        {/* Total Revenue */}
        <div className="bg-black p-6 rounded-2xl shadow-xl text-center">
          <h5 className="text-[10px] uppercase font-black tracking-widest text-gray-500 mb-2">Total Revenue</h5>
          <h2 className="text-3xl font-black text-white">₹{stats.revenue.toLocaleString()}</h2>
        </div>
      </div>
    </div>
  );
}