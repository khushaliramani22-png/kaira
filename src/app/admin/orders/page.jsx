"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client"; // તમારું ક્લાયન્ટ પાથ ચેક કરી લેજો
import {
  RefreshCw,
  MapPin,
  AlertCircle,
  CheckCircle2,
  Truck,
  XCircle,
  LogOut,
} from "lucide-react";

export default function AdminOrders() {
  const router = useRouter();
  const supabase = createClient();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adminEmail, setAdminEmail] = useState("");

  // ૧. ઓર્ડર ફેચ કરવાનું ફંક્શન
  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch Error:", error.message);
    } else {
      console.log("Total Orders Found:", data?.length);
      setOrders(data || []);
    }
    setLoading(false);
  };

  // ૨. એડમિન લોગિન ચેક અને સેશન આઈડી મેળવવું
  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        // કોન્સોલમાં ID જોવા માટે
        console.log("----------------------------");
        console.log("✅ Admin ID:", session.user.id);
        console.log("📧 Admin Email:", session.user.email);
        console.log("----------------------------");
        
        setAdminEmail(session.user.email);
        fetchOrders();
      } else {
        console.log("❌ No Admin Session. Redirecting to login...");
        router.push("/admin/login");
      }
    };

    checkAdmin();
  }, [router]);

  // ૩. સ્ટેટસ અપડેટ ફંક્શન
  const updateStatus = async (id, currentStatus, newStatus) => {
    if (currentStatus === "Cancelled" && newStatus === "Confirmed") {
      alert("This order is already cancelled and cannot be confirmed.");
      return;
    }

    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      alert("Update failed: " + error.message);
    } else {
      fetchOrders();
    }
  };

  // ૪. Logout ફંક્શન
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  if (loading && orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-black bg-white gap-4">
        <RefreshCw className="animate-spin text-black" size={30} />
        <p className="font-black uppercase tracking-[0.2em] text-xs">Authenticating Admin...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] p-4 md:p-10 font-sans text-black">
      <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-[0_10px_50px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden">
        
        {/* HEADER SECTION */}
        <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter  leading-none">
              Manage Orders
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                Active Admin: {adminEmail} • Total: {orders.length}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={fetchOrders}
              className="p-3 bg-gray-50 hover:bg-black hover:text-white rounded-2xl transition-all active:scale-95 border border-gray-100"
            >
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            </button>
            {/* <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-5 py-3 bg-red-50 text-red-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all border border-red-100"
            >
              <LogOut size={14} /> Logout
            </button> */}
          </div>
        </div>

        {/* TABLE SECTION */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#fcfcfc] text-gray-400 text-[10px] font-black uppercase tracking-widest border-b border-gray-50">
                <th className="p-6 text-left">Order Details</th>
                <th className="p-6 text-left">Customer</th>
                <th className="p-6 text-left">Shipping Info</th>
                <th className="p-6 text-left">Total</th>
                <th className="p-6 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-[#fafafa] transition-colors group">
                  {/* ORDER ID & STATUS */}
                  <td className="p-6">
                    <div className="font-black text-black text-sm mb-2">
                      #{order.order_number || order.id.slice(0, 6).toUpperCase()}
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.1em] shadow-sm ${
                        order.status === "Confirmed" ? "bg-green-100 text-green-700" :
                        order.status === "Cancelled" ? "bg-red-100 text-red-700" :
                        order.status === "Delivered" ? "bg-black text-white" :
                        "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {order.status || "Pending"}
                    </span>
                    <p className="text-[9px] text-gray-400 mt-3 font-bold uppercase tracking-tighter">
                      {new Date(order.created_at).toLocaleDateString("en-IN", {
                        day: '2-digit', month: 'short', year: 'numeric'
                      })}
                    </p>
                  </td>

                  {/* CUSTOMER */}
                  <td className="p-6">
                    <div className="font-bold text-black text-sm tracking-tight capitalize">
                      {order.customer_name}
                    </div>
                    <div className="text-[11px] text-gray-500 font-bold mt-1">
                      {order.phone}
                    </div>
                  </td>

                  {/* ADDRESS */}
                  <td className="p-6">
                    <div className="text-[11px] text-gray-600 font-medium leading-relaxed max-w-[220px]">
                      {order.address}
                      {order.city && (
                        <div className="flex items-center gap-1 text-gray-400 mt-2 font-bold uppercase text-[9px]">
                          <MapPin size={10} /> {order.city} {order.pincode ? `- ${order.pincode}` : ''}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* TOTAL */}
                  <td className="p-6">
                    <div className="font-black text-lg tracking-tighter">
                      ₹{order.total_amount?.toLocaleString()}
                    </div>
                    <div className="text-[9px] font-black text-gray-300 uppercase tracking-widest mt-1 italic">
                      {order.payment_method || "COD"}
                    </div>
                  </td>

                  {/* ACTION BUTTONS */}
                  <td className="p-6">
                    <div className="flex flex-col gap-2 items-center">
                      {order.status === "Pending" && (
                        <>
                          <button
                            onClick={() => updateStatus(order.id, order.status, "Confirmed")}
                            className="w-32 bg-white border-2 border-black text-black py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all flex items-center justify-center gap-2 shadow-sm"
                          >
                            <CheckCircle2 size={12} /> Confirm
                          </button>
                          <button
                            onClick={() => updateStatus(order.id, order.status, "Cancelled")}
                            className="w-32 border border-gray-200 text-gray-400 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all flex items-center justify-center gap-2"
                          >
                            <XCircle size={12} /> Cancel
                          </button>
                        </>
                      )}

                      {order.status === "Confirmed" && (
                        <button
                          onClick={() => updateStatus(order.id, order.status, "Delivered")}
                          className="w-32 bg-black text-white py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center justify-center gap-2 shadow-lg shadow-black/10"
                        >
                          <Truck size={14} /> Deliver
                        </button>
                      )}

                      <button
                        onClick={() => (window.location.href = `/admin/orders/${order.id}`)}
                        className="text-[10px] font-bold text-gray-300 uppercase tracking-widest hover:text-black transition-colors mt-2"
                      >
                        View Invoice
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {orders.length === 0 && !loading && (
          <div className="p-32 text-center">
            <div className="inline-block p-6 bg-gray-50 rounded-full mb-4">
              <AlertCircle className="text-gray-200" size={40} />
            </div>
            <p className="text-gray-300 font-black uppercase tracking-[0.3em] text-xs">
              No Pending Orders
            </p>
          </div>
        )}
      </div>
    </div>
  );
}