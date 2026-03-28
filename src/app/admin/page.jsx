"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    users: 0,
    revenue: 0
  });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      
      // ૧. સેશન ચેક કરો - જો સેશન ન હોય તો સીધા લોગિન પર મોકલો
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.log("સેશન મળ્યું નથી, લોગિન પર રીડાયરેક્ટ કરી રહ્યા છીએ...");
        router.push("/login");
        return;
      }

      // ૨. સિક્યોરિટી ચેક - જો લોગિન યુઝર એડમિન ન હોય તો બહાર કાઢો
      if (session.user.email !== "admin@gmail.com") {
        alert("તમારી પાસે આ પેજ જોવાની પરવાનગી નથી!");
        router.push("/"); // અથવા તમારા હોમ પેજ પર
        return;
      }

      const user = session.user;
      console.log("Admin Logged In:", user.email);

      try {
        // ૩. બધા ઓર્ડર્સ ફેચ કરો (RLS ચાલુ હશે તો પણ એડમિન પોલિસી મુજબ ૭ આવશે)
        const { data: orders, error: orderError } = await supabase
          .from("orders")
          .select("*");

        // ૪. પ્રોડક્ટ્સ ગણો
        const { count: productCount } = await supabase
          .from("products")
          .select("*", { count: 'exact', head: true });

        // ૫. યુઝર્સ ગણો - એડમિન ઈમેલ સિવાયના
        const { count: userCount, error: userError } = await supabase
          .from("users")
          .select("*", { count: 'exact', head: true })
          .neq("email", "admin@gmail.com");

        if (orderError) throw orderError;
        if (userError) throw userError;

        if (orders) {
          const totalRevenue = orders.reduce((sum, item) => sum + (Number(item.total_amount) || 0), 0);

          setStats({
            products: productCount || 0,
            orders: orders.length, 
            users: userCount || 0,
            revenue: totalRevenue
          });
        }
      } catch (err) {
        console.error("Fetch Error:", err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [router]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen font-serif tracking-widest uppercase text-xs text-gray-400 bg-white">
      Loading Secure Admin Data...
    </div>
  );

  return (
    <div className="container-fluid p-4 bg-white min-h-screen">
      <div className="flex justify-between items-center mb-8 border-b pb-4">
        <h1 className="font-black uppercase tracking-tighter italic text-2xl text-black">
          Admin Dashboard
        </h1>
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          Logged in as: admin@gmail.com
        </div>
      </div>

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