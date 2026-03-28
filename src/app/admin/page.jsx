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
      const { data: { user } } = await supabase.auth.getUser();
      console.log("તમારી અત્યારની લોગિન ID આ છે:", user?.id);
      console.log("તમારો લોગિન ઈમેલ આ છે:", user?.email);
  // ૧. બધા ઓર્ડર્સ ફેચ કરો
  const { data: orders, error: orderError } = await supabase
    .from("orders")
    .select("*");

  // ૨. પ્રોડક્ટ્સ ગણો
  const { count: productCount } = await supabase
    .from("products")
    .select("*", { count: 'exact', head: true });

  // ૩. યુઝર્સ ગણો - પણ એડમિન ઈમેલ વગરના (Filter added)
  const { count: userCount } = await supabase
    .from("users")
    .select("*", { count: 'exact', head: true })
    .neq("email", "admin@gmail.com"); // એડમિનને લિસ્ટમાંથી કાઢી નાખશે

  if (!orderError && orders) {
    const totalRevenue = orders.reduce((sum, item) => sum + (item.total_amount || 0), 0);

    setStats({
      products: productCount || 0,
      orders: orders.length, 
      users: userCount || 0,  // હવે અહીં ૨ જ આવશે
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