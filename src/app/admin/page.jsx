"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Clock, Package, ShoppingBag, Users, IndianRupee, AlertTriangle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    users: 0,
    revenue: 0,
    pending: 0,
    recentOrders: [],
    chartData: [],
    lowStockProducts: []
  });
  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        router.push("/admin/login");
        return;
      }
      const allowedAdmins = ["admin@gmail.com", "khushaliramani22@gmail.com"];
      if (!allowedAdmins.includes(user.email)) {
        alert("Access Denied!");
        router.push("/");
        return;
      }

      setUserEmail(user.email);

      try {
        // ૩. fatch order
        const { data: orders, error: orderError } = await supabase
          .from("orders")
          .select("*")
          .order("created_at", { ascending: false });

        // ૪. count product and stock
        const { data: allProducts, count: productCount } = await supabase
          .from("products")
          .select("id, name, stock", { count: 'exact' });

        // ૫. count onliy users not admin 
        const { count: userCount } = await supabase
          .from("users")
          .select("*", { count: 'exact', head: true })
          .not("email", "in", `(${allowedAdmins.join(',')})`);

        if (orderError) throw orderError;
        if (orders && allProducts) {
          const totalRevenue = orders.reduce((sum, item) => sum + (Number(item.total_amount) || 0), 0);
          const pendingCount = orders.filter(o => o.status === "Pending").length;
          const latestFive = orders.slice(0, 5);

          const lowStock = allProducts.filter(p => p.stock < 5);

          const last7Days = [...Array(7)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toISOString().split('T')[0];
          }).reverse();

          const chartData = last7Days.map(date => {
            const count = orders.filter(o => o.created_at.startsWith(date)).length;
            const label = new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
            return { name: label, orders: count };
          });
          setStats({
            products: productCount || 0,
            orders: orders.length,
            users: userCount || 0,
            revenue: totalRevenue,
            pending: pendingCount,
            recentOrders: latestFive,
            chartData: chartData,
            lowStockProducts: lowStock
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
      {/*Total Products*/}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
  {/* Total Products */}
  <div className="bg-blue-50 p-4 rounded-2xl border border-gray-100 shadow-sm text-center">
    <h5 className="text-[9px] uppercase font-black tracking-widest text-gray-400 mb-1">Products</h5>
    <h2 className="text-2xl font-black text-blue-600">{stats.products}</h2>
    <Package className="text-blue-200" size={40} />
  </div>

  {/* Total Orders */}
  <div className="bg-green-50 p-4 rounded-2xl border border-gray-100 shadow-sm text-center">
    <h5 className="text-[9px] uppercase font-black tracking-widest text-gray-400 mb-1">Orders</h5>
    <h2 className="text-2xl font-black text-green-600">{stats.orders}</h2>
    <ShoppingBag className="text-green-200" size={40} />
  </div>

  {/* Pending Orders  */}
  <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 shadow-sm text-center">
    <h5 className="text-[9px] uppercase font-black tracking-widest text-orange-500 mb-1">waitlist</h5>
    <h2 className="text-2xl font-black text-orange-600">{stats.pending}</h2>
    <Clock className="text-orange-200" size={40} />
  </div>


{/* Total Users Section */}
<div className="bg-purple-50 p-4 rounded-2xl border border-gray-100 shadow-sm text-center">
  <h5 className="text-[9px] uppercase font-black tracking-widest text-gray-400 mb-1">Users</h5>
  <h2 className="text-2xl font-black text-purple-600">
    {stats.users > 0 ? stats.users - 1 : 0}
  </h2>  
  <Users className="text-purple-200" size={40} />
</div>

  {/* Total Revenue */}
  <div className="bg-black p-4 rounded-2xl shadow-lg text-center">
    <h5 className="text-[9px] uppercase font-black tracking-widest text-gray-500 mb-1">Revenue</h5>
    <h2 className="text-2xl font-black text-white">₹{stats.revenue.toLocaleString()}</h2>
    
  </div>
</div>
      {/*graph table near other table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">

        {/* ૧. salse analitics graph -  */}
        <div className="lg:col-span-2 p-6 bg-black rounded-3xl border border-gray-800 shadow-xl flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="font-black uppercase tracking-tight text-md text-white">Sales Analytics</h3>
            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Last 7 Days Performance</p>
          </div>

          <div className="h-[200px] w-full">
           <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={200}>
              <AreaChart data={stats.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>

                  <linearGradient id="colorOrdersWhite" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ffffff" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#ffffff" stopOpacity={0} />
                  </linearGradient>
                </defs>


                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333333" />

                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 9, fontWeight: 'bold', fill: '#666666' }}
                  dy={10}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 9, fontWeight: 'bold', fill: '#666666' }}
                />

                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a1a',
                    borderRadius: '12px',
                    border: '1px solid #333',
                    color: '#fff',
                    fontSize: '11px'
                  }}
                  itemStyle={{ color: '#fff' }}
                />

                <Area
                  type="monotone"
                  dataKey="orders"
                  stroke="#ffffff"  /* White/Silver Line for contrast */
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorOrdersWhite)"
                  dot={{ r: 3, stroke: '#ffffff', strokeWidth: 2, fill: '#000000' }}
                  activeDot={{ r: 5, stroke: '#ffffff', strokeWidth: 2, fill: '#000000' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* Low Stock Alert */}
        <div className="lg:col-span-1">
          {stats.lowStockProducts.length > 0 ? (
            <div className="bg-red-50 p-6 rounded-3xl border border-red-100 h-full overflow-y-auto max-h-[250px]">
              <div className="flex items-center gap-2 mb-4 text-red-600">
                <div className="h-2 w-2 bg-red-600 rounded-full animate-ping"></div>
                <h3 className="font-black uppercase tracking-tight text-sm">Low Stock Alert</h3>
              </div>
              <div className="space-y-3">
                {stats.lowStockProducts.map(product => (
                  <div key={product.id} className="bg-white p-3 rounded-xl flex justify-between items-center shadow-sm border border-red-50">
                    <p className="text-[10px] font-black uppercase text-gray-800 truncate pr-2">{product.name}</p>
                    <span className="text-[10px] font-black text-red-600 bg-red-50 px-2 py-1 rounded-md">
                      {product.stock} LEFT
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
          
            <div className="bg-orange-50 p-6 rounded-3xl border border-orange-100 h-full flex items-center justify-between">
              <div>
                <h5 className="text-[10px] uppercase font-black tracking-widest text-orange-400">Inventory Status</h5>
                <h2 className="text-2xl font-black text-orange-600">All Good!</h2>
                <p className="text-[9px] font-bold text-orange-400 uppercase mt-1">Stock is healthy</p>
              </div>
              <Clock className="text-orange-200" size={40} />
            </div>
          )}
        </div>

        
      </div>

      {/* ૩. તેની નીચે Recent Orders ટેબલ */}
      <div className="mt-8 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex justify-between items-center">
          <h3 className="font-black uppercase tracking-tight text-lg">Recent Orders</h3>
          <button onClick={() => router.push('/admin/orders')} className="text-[10px] font-black text-blue-600 uppercase tracking-widest">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-[10px] uppercase font-black text-gray-400">
              <tr>
                <th className="p-4">ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {stats.recentOrders?.map((order) => (
                <tr key={order.id} className="text-sm hover:bg-gray-50">
                  <td className="p-4 font-bold">#{order.id.slice(0, 6)}</td>
                  <td className="p-4 text-gray-600">{order.customer_name}</td>
                  <td className="p-4 font-black">₹{order.total_amount?.toLocaleString()}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-[8px] font-black uppercase ${order.status === 'Pending' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                      {order.status}
                    </span>
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