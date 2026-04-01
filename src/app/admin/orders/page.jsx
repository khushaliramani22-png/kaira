"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
  RefreshCw,
  MapPin,
  AlertCircle,
  CheckCircle2,
  Truck,
  XCircle,
  Search,
} from "lucide-react";

export default function AdminOrders() {
  const router = useRouter();
  const supabase = createClient();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adminEmail, setAdminEmail] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; 

  const tabs = [
    { id: "All", label: "All" },
    { id: "Pending", label: "Pending" },
    { id: "Confirmed", label: "Confirmed" },
    { id: "Delivered", label: "Delivered" },
    { id: "Cancelled", label: "Cancelled" },
    { id: "Return Requested", label: "Return-request" },
    { id: "Returned", label: "Returned" }
  ];

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

  const getCount = (status) => {
    if (status === "All") return orders.length;
    return orders.filter((o) => o.status === status).length;
  };

  const filteredOrders = orders.filter((order) => {
    const orderID = order.order_number?.toString() || order.id.slice(0, 6).toUpperCase();
    const matchesSearch =
      order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      orderID.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTab = activeTab === "All" || order.status === activeTab;
    return matchesSearch && matchesTab;
  });

  // pagination
const indexOfLastItem = currentPage * itemsPerPage;
const indexOfFirstItem = indexOfLastItem - itemsPerPage;
const currentItems = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);


useEffect(() => {
  setCurrentPage(1);
}, [searchTerm, activeTab]);

  useEffect(() => {
    const checkAdmin = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        setAdminEmail(session.user.email);
        fetchOrders();
      } else {
        router.push("/admin/login");
      }
    };

    checkAdmin();
  }, [router]);

  const updateStatus = async (id, currentStatus, newStatus) => {
    if (currentStatus === "Cancelled" && newStatus === "Confirmed") {
      alert("This order is already cancelled.");
      return;
    }



    if (newStatus === "Returned") {
      const { data: items } = await supabase
        .from("order_items")
        .select("product_id, quantity")
        .eq("order_id", id);

      if (items) {
        for (const item of items) {
          const { data: product } = await supabase
            .from("products")
            .select("stock")
            .eq("id", item.product_id)
            .single();

          if (product) {
            await supabase
              .from("products")
              .update({ stock: product.stock + item.quantity })
              .eq("id", item.product_id);
          }
        }
      }
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

  if (loading && orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white gap-4 text-black">
        <RefreshCw className="animate-spin" size={30} />
        <p className="font-black uppercase tracking-widest text-xs">Authenticating Admin...</p>
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
        </div>
        <div className="border-b border-gray-100 sticky top-0 bg-white z-10">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex gap-8 overflow-x-auto scrollbar-hide pt-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-4 text-sm font-semibold transition-all relative whitespace-nowrap tracking-tight ${activeTab === tab.id
                    ? "text-blue-600"
                    : "text-gray-400 hover:text-gray-600"
                    }`}
                >
                  {tab.label} ({" "}
                  <span className="text-blue-500 font-bold">
                    {getCount(tab.id)}
                  </span>{" "}
                  )
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 w-full h-[2px] bg-blue-600"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">


            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold uppercase tracking-tighter">Order History</h1>
              <div className="h-4 w-[1px] bg-gray-200 mx-2 hidden md:block"></div>
              <p className="text-[10px] text-gray-400 font-bold uppercase">
                {filteredOrders.length} Orders Found
              </p>
            </div>

            {/* ૨.sarch bar*/}
            <div className="relative w-full md:w-96">
              <input
                type="text"
                placeholder="Search Customer or Order ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl py-2.5 pl-4 pr-10 text-sm shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all placeholder:text-gray-300"
              />
              <Search
                size={16}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>
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
              {currentItems.map((order) =>(        
                <tr key={order.id} className="hover:bg-[#fafafa] transition-colors group">
                  {/* ORDER ID & STATUS */}
                  <td className="p-6">
                    <div className="font-black text-black text-sm mb-2">
                      #
                      {order.order_number || order.id.slice(0, 6).toUpperCase()}
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.1em] shadow-sm ${order.status === "Confirmed"
                        ? "bg-green-100 text-green-700"
                        : order.status === "Cancelled"
                          ? "bg-red-100 text-red-700"
                          : order.status === "Delivered"
                            ? "bg-black text-white"
                            : "bg-blue-100 text-blue-700"
                        }`}
                    >
                      {order.status || "Pending"}
                    </span>
                    <p className="text-[9px] text-gray-400 mt-3 font-bold uppercase tracking-tighter">
                      {new Date(order.created_at).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
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
                          <MapPin size={10} /> {order.city}{" "}
                          {order.pincode ? `- ${order.pincode}` : ""}
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
                      {/* PENDING STATUS */}
                      {order.status === "Pending" && (
                        <>
                          <button
                            onClick={() =>
                              updateStatus(order.id, order.status, "Confirmed")
                            }
                            className="w-32 bg-white border-2 border-black text-black py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all flex items-center justify-center gap-2 shadow-sm"
                          >
                            <CheckCircle2 size={12} /> Confirm
                          </button>
                          <button
                            onClick={() =>
                              updateStatus(order.id, order.status, "Cancelled")
                            }
                            className="w-32 border border-gray-200 text-gray-400 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-red-50 hover:text-red-600 transition-all flex items-center justify-center gap-2"
                          >
                            <XCircle size={12} /> Cancel
                          </button>
                        </>
                      )}

                      {/* CONFIRMED STATUS */}
                      {order.status === "Confirmed" && (
                        <button
                          onClick={() =>
                            updateStatus(order.id, order.status, "Delivered")
                          }
                          className="w-32 bg-black text-white py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center justify-center gap-2 shadow-lg shadow-black/10"
                        >
                          <Truck size={14} /> Deliver
                        </button>
                      )}

                      {/* RETURN REQUESTED STATUS  */}
                      {order.status === "Return Requested" && (
                        <>
                          <button
                            onClick={() =>
                              updateStatus(order.id, order.status, "Returned")
                            }
                            className="w-32 bg-orange-500 text-white py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-md"
                          >
                            Approve Return
                          </button>
                          <button
                            onClick={() =>
                              updateStatus(order.id, order.status, "Delivered")
                            }
                            className="w-32 border border-gray-200 text-gray-400 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:text-black transition-all"
                          >
                            Reject Return
                          </button>
                          <p className="text-[8px] text-red-500 font-bold uppercase mt-1">
                            Reason: {order.return_reason}
                          </p>
                        </>
                      )}

                      <button
                        onClick={() =>
                          (window.location.href = `/admin/orders/${order.id}`)
                        }
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

          {/* --- TABLE પત્યા પછી અહીં આ કોડ મુકો --- */}
<div className="flex items-center justify-between px-8 py-5 bg-gray-50/50 border-t border-gray-100">
  <div className="flex items-center gap-4">
    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
      Page {currentPage} of {totalPages || 1}
    </p>
  </div>
  
  <div className="flex gap-3">
    <button
      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
      disabled={currentPage === 1}
      className={`px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl border transition-all shadow-sm ${
        currentPage === 1 
        ? "text-gray-300 border-gray-50 bg-gray-50 cursor-not-allowed" 
        : "text-black border-gray-200 bg-white hover:bg-black hover:text-white active:scale-95"
      }`}
    >
      Previous
    </button>

    <button
      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
      disabled={currentPage === totalPages || totalPages === 0}
      className={`px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl border transition-all shadow-sm ${
        currentPage === totalPages || totalPages === 0
        ? "text-gray-300 border-gray-50 bg-gray-50 cursor-not-allowed" 
        : "text-black border-gray-200 bg-white hover:bg-black hover:text-white active:scale-95"
      }`}
    >
      Next
    </button>
  </div>
</div>
        </div>
        {filteredOrders.length === 0 && (

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
