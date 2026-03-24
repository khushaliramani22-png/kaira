"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Search, ChevronLeft, ChevronRight, User, Phone, Calendar } from "lucide-react";

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
        .from("profiles")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(from, to);

      if (searchQuery) {
        query = query.or(`full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`);
      }

      const { data, error, count } = await query;

      if (error) throw error;
      setUsers(data || []);
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
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header & Search Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-800 uppercase tracking-tight">Users Management</h1>
          <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">{totalCount} Total Customers</p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search name or email..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-[10px] uppercase tracking-widest text-gray-400 font-black border-b">
                <th className="p-5">User</th>
                <th className="p-5 hidden sm:table-cell">Email</th>
                <th className="p-5 hidden lg:table-cell">Phone</th>
                <th className="p-5 hidden md:table-cell">Joined Date</th>
                <th className="p-5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-20 text-center animate-pulse text-gray-400 font-bold uppercase tracking-widest text-xs">
                    Updating list...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-20 text-center text-gray-300 font-bold uppercase tracking-widest text-xs">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-blue-50/20 transition-all group">
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-sm font-black border-2 border-white shadow-sm uppercase">
                          {user.full_name ? user.full_name[0] : "U"}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-800">{user.full_name || "N/A"}</span>
                          {/* Mobile Only Info */}
                          <span className="text-[10px] text-gray-400 sm:hidden">{user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-5 text-sm font-medium text-gray-600 hidden sm:table-cell">
                      {user.email}
                    </td>
                    <td className="p-5 text-sm font-medium text-gray-500 hidden lg:table-cell">
                      {user.phone || "Not Provided"}
                    </td>
                    <td className="p-5 text-xs font-bold text-gray-400 hidden md:table-cell">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString("en-IN") : "N/A"}
                    </td>
                    <td className="p-5 text-center">
                      <button
                        onClick={() => router.push(`/admin/users/${user.id}`)}
                        className="text-[10px] font-black py-2 px-4 border-2 border-gray-100 rounded-xl hover:bg-gray-900 hover:text-white transition-all uppercase"
                      >
                        View Profile
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Section */}
        <div className="p-5 border-t bg-gray-50/30 flex justify-between items-center">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Page {currentPage} of {totalPages || 1}
          </span>
          <div className="flex gap-2">
            <button
              disabled={currentPage === 1 || loading}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="p-2 rounded-xl border bg-white hover:bg-gray-100 disabled:opacity-30 transition-all shadow-sm"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              disabled={currentPage === totalPages || totalPages === 0 || loading}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="p-2 rounded-xl border bg-white hover:bg-gray-100 disabled:opacity-30 transition-all shadow-sm"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}