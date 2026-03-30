"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client"; // સાચો ક્લાયન્ટ વાપરો
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    users: 0,
    revenue: 0
  });
  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      
      // ૧. સેશન ચેક કરો - getUser() વધુ સુરક્ષિત છે
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        router.push("/admin/login");
        return;
      }

      // ૨. સિક્યોરિટી ચેક - બંને એડમિન ઈમેલને પરવાનગી આપો
      const allowedAdmins = ["admin@gmail.com", "khushaliramani22@gmail.com"];
      if (!allowedAdmins.includes(user.email)) {
        alert("Access Denied!");
        router.push("/");
        return;
      }

      setUserEmail(user.email);

      try {
        // ૩. ઓર્ડર્સ ફેચ કરો
        const { data: orders, error: orderError } = await supabase.from("orders").select("*");

        // ૪. પ્રોડક્ટ્સ ગણો
        const { count: productCount } = await supabase
          .from("products")
          .select("*", { count: 'exact', head: true });

        // ૫. યુઝર્સ ગણો - એડમિન સિવાયના
        const { count: userCount } = await supabase
          .from("users")
          .select("*", { count: 'exact', head: true })
          .not("email", "in", `(${allowedAdmins.join(',')})`);

        if (orderError) throw orderError;

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
  }, [router, supabase]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen font-serif tracking-widest uppercase text-xs text-gray-400 bg-white">
      Loading Secure Admin Data...
    </div>
  );

  return (
    <div className="container-fluid p-4 bg-white min-h-screen">
      <div className="flex justify-between items-center mb-8 border-b pb-4">
        <h1 className="font-black uppercase tracking-tighter  text-2xl text-black">
          Admin Dashboard
        </h1>
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          Logged in as: {userEmail}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 shadow-sm text-center">
          <h5 className="text-[10px] uppercase font-black tracking-widest text-gray-400 mb-2">Total Products</h5>
          <h2 className="text-3xl font-black text-blue-600">{stats.products}</h2>
        </div>

        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 shadow-sm text-center">
          <h5 className="text-[10px] uppercase font-black tracking-widest text-gray-400 mb-2">Total Orders</h5>
          <h2 className="text-3xl font-black text-green-600">{stats.orders}</h2>
        </div>

        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 shadow-sm text-center">
          <h5 className="text-[10px] uppercase font-black tracking-widest text-gray-400 mb-2">Total Users</h5>
          <h2 className="text-3xl font-black text-orange-500">{stats.users}</h2>
        </div>

        <div className="bg-black p-6 rounded-2xl shadow-xl text-center">
          <h5 className="text-[10px] uppercase font-black tracking-widest text-gray-500 mb-2">Total Revenue</h5>
          <h2 className="text-3xl font-black text-white">₹{stats.revenue.toLocaleString()}</h2>
        </div>
      </div>
    </div>
  );
}