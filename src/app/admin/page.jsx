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

      // 1. બધા ઓર્ડર્સ ફેચ કરો
      const { data: orders, error: orderError } = await supabase
        .from("orders")
        .select("*");

      // 2. ટોટલ પ્રોડક્ટ્સ ગણો
      const { count: productCount } = await supabase
        .from("products")
        .select("*", { count: 'exact', head: true });

      // 3. ટોટલ યુઝર્સ ગણો (ઓર્ડર આપ્યો હોય કે ન આપ્યો હોય)
      const { count: userCount, error: userError } = await supabase
        .from("users") // તમારા યુઝર્સ ટેબલનું નામ
        .select("*", { count: 'exact', head: true });

      if (!orderError && orders) {
        const totalRevenue = orders.reduce((sum, item) => sum + (item.total_amount || 0), 0);

        setStats({
          products: productCount || 0,
          orders: orders.length, // અહીં હવે 7 દેખાશે જો SQL રન કરી હશે તો
          users: userCount || 0,  // અહીં હવે 2 દેખાશે
          revenue: totalRevenue
        });
      }
      setLoading(false);
    }

    fetchData();
  }, []);
  if (loading) return <div className="p-5 text-center font-serif tracking-widest uppercase">Loading Data...</div>;

  return (
    <div className="container-fluid p-4">
      <h1 className="mb-4 font-serif uppercase tracking-widest text-2xl">Admin Dashboard</h1>

      <div className="row">
        {/* Total Products */}
        <div className="col-md-3 mb-4">
          <div className="card shadow border-0 bg-light">
            <div className="card-body text-center">
              <h5 className="text-[10px] uppercase font-bold text-gray-400">Total Products</h5>
              <h2 className="text-primary font-serif">{stats.products}</h2>
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="col-md-3 mb-4">
          <div className="card shadow border-0 bg-light">
            <div className="card-body text-center">
              <h5 className="text-[10px] uppercase font-bold text-gray-400">Total Orders</h5>
              <h2 className="text-success font-serif">{stats.orders}</h2>
            </div>
          </div>
        </div>

        {/* Users */}
        <div className="col-md-3 mb-4">
          <div className="card shadow border-0 bg-light">
            <div className="card-body text-center">
              <h5 className="text-[10px] uppercase font-bold text-gray-400">Total Users</h5>
              <h2 className="text-warning font-serif">{stats.users}</h2>
            </div>
          </div>
        </div>

        {/* Revenue */}
        <div className="col-md-3 mb-4">
          <div className="card shadow border-0 bg-dark text-white">
            <div className="card-body text-center">
              <h5 className="text-[10px] uppercase font-bold text-gray-500">Total Revenue</h5>
              <h2 className="text-white font-serif">₹{stats.revenue.toLocaleString()}</h2>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}