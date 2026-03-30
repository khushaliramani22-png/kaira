"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Search, ChevronLeft, ChevronRight, User, Phone, Calendar, Mail, ShoppingBag, IndianRupee } from "lucide-react";

export default function UsersListPage() {
  const router = useRouter();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;

   
      let query = supabase
        .from("users")
        .select("*", { count: "exact" })
        .eq("role", "user")
        .order("created_at", { ascending: false }) 
        .range(from, to);

      if (searchQuery) {

        query = query.or(`name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`);
      }

      const { data: userData, error: userError, count } = await query;
      if (userError) throw userError;

      // ૨. ઓર્ડર્સ ફેચ કરો
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select("user_id, total_amount");

      if (orderError) console.error("Order fetch error:", orderError);

      // ૩. ડેટા પ્રોસેસ કરો
      const processedUsers = userData.map(user => {
        const userOrders = orderData ? orderData.filter(o => String(o.user_id) === String(user.id)) : [];
        const totalOrders = userOrders.length;
        const totalSpend = userOrders.reduce((sum, order) => {
          const amount = parseFloat(order.total_amount) || 0;
          return sum + amount;
        }, 0);


        return { ...user, totalOrders, totalSpend };
      });
      setUsers(processedUsers);
      setTotalCount(count || 0);
    } catch (error) {
      console.error("Error fetching users:", error.message);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery]);
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen bg-[#fbfbfb]">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight flex items-center gap-2">
            <User className="text-blue-600" size={28} />
            Users Management
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">
              {totalCount} Total Customers
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search name or email..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all shadow-sm font-medium"
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 text-[10px] uppercase tracking-[0.15em] text-gray-500 font-black border-b border-gray-100">
                <th className="p-6"># Rank & Customer</th>
                <th className="p-6 hidden sm:table-cell">Activity</th>
                <th className="p-6 hidden md:table-cell text-center text-blue-600">Total Value</th>
                <th className="p-6 text-center">Management</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="4" className="p-32 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs font-black uppercase tracking-widest text-gray-400">Loading Database...</span>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-32 text-center text-gray-300 font-bold uppercase tracking-widest text-xs">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user, index) => (
                  <tr key={user.id} className="hover:bg-blue-50/30 transition-all duration-200 group">
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] font-black text-blue-500 bg-blue-50 w-8 h-8 rounded-lg flex items-center justify-center border border-blue-100">
                          #{totalCount - ((currentPage - 1) * pageSize + index)}
                          {/* #{(currentPage - 1) * pageSize + (index + 1)} */}
                        </span>

                        <div className="w-12 h-12 bg-gray-900 text-white rounded-2xl flex items-center justify-center text-lg font-black shadow-lg uppercase transform group-hover:scale-105 transition-transform">
                          {/* name કોલમ વાપર્યું */}
                          {user.name ? user.name[0] : <User size={20} />}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-extrabold text-gray-900 group-hover:text-blue-700 transition-colors">
                            {user.name || user.email.split('@')[0]}
                          </span>
                          <span className="text-[10px] text-gray-400 font-medium">Joined {new Date(user.created_at).toLocaleDateString("en-IN")}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-6 hidden sm:table-cell">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                          <Mail size={14} className="text-gray-400" />
                          {user.email}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-black text-green-600 bg-green-50 px-2 py-0.5 rounded-full w-fit uppercase border border-green-100">
                          <ShoppingBag size={10} /> {user.totalOrders} Orders
                        </div>
                      </div>
                    </td>
                    <td className="p-6 hidden md:table-cell text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-md font-black text-gray-900 flex items-center">
                          <IndianRupee size={14} />
                          {user.totalSpend.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Total Spent</span>
                      </div>
                    </td>
                    <td className="p-6 text-center">
                      <button
                        onClick={() => {
                          // ખાતરી કરો કે 'user' વેરીએબલ લૂપ (map) માંથી સાચો મળે છે
                          if (user?.id) {
                            router.push(`/admin/users/${user.id}`);
                          } else {
                            console.error("User ID missing!");
                          }
                        }}
                        className="text-[10px] font-black py-2.5 px-6 border-2 border-gray-100 rounded-2xl bg-white hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all uppercase shadow-sm active:scale-95"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Section */}
        <div className="p-6 border-t bg-gray-50/50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
            Page {currentPage} of {totalPages || 1}
          </span>
          <div className="flex gap-3">
            <button
              disabled={currentPage === 1 || loading}
              onClick={() => { setCurrentPage((p) => p - 1); window.scrollTo(0, 0); }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border bg-white text-gray-600 font-bold text-xs hover:bg-gray-100 disabled:opacity-30 transition-all shadow-sm"
            >
              <ChevronLeft size={16} /> Prev
            </button>
            <button
              disabled={currentPage === totalPages || totalPages === 0 || loading}
              onClick={() => { setCurrentPage((p) => p + 1); window.scrollTo(0, 0); }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border bg-white text-gray-600 font-bold text-xs hover:bg-gray-100 disabled:opacity-30 transition-all shadow-sm"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}