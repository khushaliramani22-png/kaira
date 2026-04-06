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
import Swal from "sweetalert2";

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
  const [selectedOrders, setSelectedOrders] = useState([]);

  // --- તમારા ઓરિજિનલ ફંક્શન્સ ---

  const toggleSelectAll = () => {
    if (selectedOrders.length === currentItems.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(currentItems.map((o) => o.id));
    }
  };

  const toggleSelectOrder = (id) => {
    setSelectedOrders((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkUpdate = async (newStatus) => {
    const containsCancelled = orders.some(
      (o) => selectedOrders.includes(o.id) && o.status === "Cancelled"
    );
    if (containsCancelled) {
      Swal.fire("Action Blocked", "Selection contains cancelled orders.", "error");
      return;
    }

    const result = await Swal.fire({
      title: "Are you sure?",
      text: `${selectedOrders.length} orders will be marked as ${newStatus}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#000",
      confirmButtonText: "Yes, update all!",
    });

  if (result.isConfirmed) {
    const updateData = { status: newStatus };
    if (newStatus === "Delivered") {
      updateData.delivery_date = new Date().toISOString();
    }

    const { error } = await supabase
      .from("orders")
      .update(updateData)
      .in("id", selectedOrders);
    
    if (!error) {
      Swal.fire("Updated!", "Selected orders have been updated.", "success");
      setSelectedOrders([]);
      fetchOrders();
    }
  }
};
  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch Error:", error.message);
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  };

  const updateStatus = async (id, currentStatus, newStatus) => {
    if (currentStatus === "Cancelled") {
      Swal.fire("Error", "Cancelled orders cannot be updated.", "error");
      return;
    }

    const loadingAlert = Swal.fire({
      title: "Updating Status...",
      html: "Please wait while we update **Kaira** order system.",
      didOpen: () => { Swal.showLoading(); },
      allowOutsideClick: false,
    });

    try {
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
const updateData = { status: newStatus };
    if (newStatus === "Delivered") {
      updateData.delivery_date = new Date().toISOString();
    }

    const { error } = await supabase
      .from("orders")
      .update(updateData)
      .eq("id", id);

   
    

      Swal.close();
      if (error) throw error;

      fetchOrders();
      Swal.fire({
        icon: "success",
        title: "Status Updated",
        text: `Order is now ${newStatus}`,
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.close();
      Swal.fire("Error", "Update failed: " + error.message, "error");
    }
  };

  // --- Filtering & Pagination ---

  const tabs = [
    { id: "All", label: "All" },
    { id: "Pending", label: "Pending" },
    { id: "Confirmed", label: "Confirmed" },
    { id: "Delivered", label: "Delivered" },
    { id: "Cancelled", label: "Cancelled" },
    { id: "Return Requested", label: "Return-request" },
    { id: "Returned", label: "Returned" },
  ];

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

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, activeTab]);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setAdminEmail(session.user.email);
        fetchOrders();
      } else {
        router.push("/admin/login");
      }
    };
    checkAdmin();
  }, [router]);

  if (loading && orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white gap-4 text-black">
        <RefreshCw className="animate-spin" size={30} />
        <p className="font-black uppercase tracking-widest text-xs">Authenticating Admin...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] p-2 md:p-10 font-sans text-black">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* HEADER SECTION */}
        <div className="p-5 md:p-8 border-b border-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter leading-none">Manage Orders</h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <p className="text-[9px] md:text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                Active: {adminEmail} • Total: {orders.length}
              </p>
            </div>
          </div>
          
          {/* SEARCH BAR */}
          <div className="relative w-full md:w-96">
            <input
              type="text"
              placeholder="Search Customer or Order ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl py-2.5 pl-4 pr-10 text-sm shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all"
            />
            <Search size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* TABS - Responsive Scroll */}
        <div className="border-b border-gray-100 sticky top-0 bg-white z-10 overflow-x-auto scrollbar-hide">
          <div className="flex px-6 gap-6 md:gap-8 pt-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-4 text-xs md:text-sm font-semibold transition-all relative whitespace-nowrap tracking-tight ${
                  activeTab === tab.id ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {tab.label} (<span className="text-blue-500 font-bold">{getCount(tab.id)}</span>)
                {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-blue-600"></div>}
              </button>
            ))}
          </div>
        </div>

        {/* BULK ACTIONS */}
        {selectedOrders.length > 0 && (
          <div className="px-4 md:px-6 py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-blue-50 border border-blue-100 rounded-2xl gap-3">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase">
                  {selectedOrders.length} Selected
                </div>
                <p className="text-[10px] text-blue-600 font-bold uppercase italic">Bulk Action</p>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <button onClick={() => handleBulkUpdate("Confirmed")} className="flex-1 sm:flex-none bg-white border border-blue-200 text-blue-600 text-[9px] font-black uppercase px-4 py-2 rounded-xl">Confirm All</button>
                <button onClick={() => handleBulkUpdate("Shipped")} className="flex-1 sm:flex-none bg-black text-white text-[9px] font-black uppercase px-4 py-2 rounded-xl">Mark Shipped</button>
              </div>
            </div>
          </div>
        )}

        {/* TABLE SECTION - Responsive container */}
        <div className="overflow-x-auto md:overflow-visible">
          {/* Desktop table */}
          <div className="hidden md:block">
            <table className="w-full border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-[#fcfcfc] text-gray-400 text-[10px] font-black uppercase tracking-widest border-b border-gray-50">
                  <th className="p-6 text-left w-10">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded accent-black cursor-pointer"
                      checked={selectedOrders.length === currentItems.length && currentItems.length > 0}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className="p-6 text-left">Order Details</th>
                  <th className="p-6 text-left">Customer</th>
                  <th className="p-6 text-left">Shipping Info</th>
                  <th className="p-6 text-left">Total</th>
                  <th className="p-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {currentItems.map((order) => (
                  <tr key={order.id} className="hover:bg-[#fafafa] transition-colors group">
                    <td className="p-6 text-center">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded accent-black cursor-pointer"
                        checked={selectedOrders.includes(order.id)}
                        onChange={() => toggleSelectOrder(order.id)}
                      />
                    </td>
                    <td className="p-6">
                      <div className="font-black text-black text-sm mb-2">
                        #{order.order_number || order.id.slice(0, 6).toUpperCase()}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                        order.status === "Confirmed" ? "bg-green-100 text-green-700" :
                        order.status === "Cancelled" ? "bg-red-100 text-red-700" :
                        order.status === "Delivered" ? "bg-black text-white" : "bg-blue-100 text-blue-700"
                      }`}>
                        {order.status || "Pending"}
                      </span>
                      <p className="text-[9px] text-gray-400 mt-3 font-bold">{new Date(order.created_at).toLocaleDateString("en-IN")}</p>
                    </td>
                    <td className="p-6 text-sm font-bold capitalize">{order.customer_name}<div className="text-[11px] text-gray-500 mt-1">{order.phone}</div></td>
                    <td className="p-6">
                      <div className="text-[11px] text-gray-600 max-w-[200px] truncate md:whitespace-normal">{order.address}</div>
                      <div className="flex items-center gap-1 text-gray-400 mt-2 font-bold uppercase text-[9px]">
                        <MapPin size={10} /> {order.city} {order.pincode}
                      </div>
                    </td>
                    <td className="p-6 font-black text-lg">₹{order.total_amount?.toLocaleString()}</td>
                    <td className="p-6">
                      <div className="flex flex-col gap-2 items-center">
                        {order.status === "Pending" && (
                          <>
                            <button onClick={() => updateStatus(order.id, order.status, "Confirmed")} className="w-full sm:w-32 bg-white border-2 border-black text-black py-2 rounded-xl text-[9px] font-black uppercase"><CheckCircle2 size={12} className="inline mr-1"/> Confirm</button>
                            <button onClick={() => updateStatus(order.id, order.status, "Cancelled")} className="w-full sm:w-32 border border-gray-200 text-gray-400 py-2 rounded-xl text-[9px] font-black uppercase"><XCircle size={12} className="inline mr-1"/> Cancel</button>
                          </>
                        )}
                        {order.status === "Confirmed" && (
                          <button onClick={() => updateStatus(order.id, order.status, "Delivered")} className="w-full sm:w-32 bg-black text-white py-2 rounded-xl text-[9px] font-black uppercase"><Truck size={14} className="inline mr-1"/> Deliver</button>
                        )}
                        <button onClick={() => window.print()} className="w-full sm:w-32 bg-gray-50 border border-gray-200 text-gray-400 py-2 rounded-xl text-[9px] font-black uppercase mt-1">Invoice</button>
                        <button onClick={() => (window.location.href = `/admin/orders/${order.id}`)} className="w-full sm:w-auto text-[10px] font-bold text-gray-500 uppercase mt-2">View details</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile card view */}
          <div className="md:hidden space-y-4 p-2">
            {currentItems.map((order) => (
              <article key={order.id} className="bg-white border border-gray-100 shadow-sm rounded-xl p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-sm font-black">#{order.order_number || order.id.slice(0, 6).toUpperCase()}</div>
                    <div className="text-[10px] text-gray-500">{new Date(order.created_at).toLocaleDateString("en-IN")}</div>
                  </div>
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded accent-black"
                    checked={selectedOrders.includes(order.id)}
                    onChange={() => toggleSelectOrder(order.id)}
                  />
                </div>

                <div className="mt-3">
                  <span className={`inline-block px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                    order.status === "Confirmed" ? "bg-green-100 text-green-700" :
                    order.status === "Cancelled" ? "bg-red-100 text-red-700" :
                    order.status === "Delivered" ? "bg-black text-white" : "bg-blue-100 text-blue-700"
                  }`}>
                    {order.status || "Pending"}
                  </span>
                </div>

                <div className="mt-3 text-xs text-gray-600">
                  <p className="font-bold">{order.customer_name}</p>
                  <p>{order.phone}</p>
                  <p>{order.address}</p>
                  <p className="flex items-center gap-1"><MapPin size={10} /> {order.city} {order.pincode}</p>
                </div>

                <div className="mt-3 font-black text-lg">₹{order.total_amount?.toLocaleString()}</div>

                <div className="grid grid-cols-1 gap-2 mt-3">
                  {order.status === "Pending" && (
                    <>
                      <button onClick={() => updateStatus(order.id, order.status, "Confirmed")} className="w-full bg-white border-2 border-black text-black py-2 rounded-xl text-[9px] font-black uppercase">Confirm</button>
                      <button onClick={() => updateStatus(order.id, order.status, "Cancelled")} className="w-full border border-gray-200 text-gray-400 py-2 rounded-xl text-[9px] font-black uppercase">Cancel</button>
                    </>
                  )}
                  {order.status === "Confirmed" && (
                    <button onClick={() => updateStatus(order.id, order.status, "Delivered")} className="w-full bg-black text-white py-2 rounded-xl text-[9px] font-black uppercase">Deliver</button>
                  )}
                  <button onClick={() => window.print()} className="w-full bg-gray-50 border border-gray-200 text-gray-400 py-2 rounded-xl text-[9px] font-black uppercase">Invoice</button>
                  <button onClick={() => (window.location.href = `/admin/orders/${order.id}`)} className="w-full text-[10px] font-bold text-gray-500 uppercase">View details</button>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* PAGINATION - Responsive layout */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-8 py-5 bg-gray-50/50 border-t border-gray-100 gap-4">
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Page {currentPage} of {totalPages || 1}</p>
          <div className="flex gap-3 w-full sm:w-auto justify-center">
            <button 
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} 
              disabled={currentPage === 1}
              className="px-5 py-2 text-[10px] font-black uppercase rounded-xl border bg-white disabled:opacity-50"
            >
              Previous
            </button>
            <button 
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} 
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-5 py-2 text-[10px] font-black uppercase rounded-xl border bg-black text-white disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>

        {filteredOrders.length === 0 && (
          <div className="p-20 text-center">
            <AlertCircle className="mx-auto text-gray-200 mb-4" size={40} />
            <p className="text-gray-300 font-black uppercase text-xs">No Orders Found</p>
          </div>
        )}
      </div>
    </div>
  );
}