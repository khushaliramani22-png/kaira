"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { RefreshCw, MapPin, AlertCircle, CheckCircle2, Truck, XCircle } from "lucide-react";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // ઓર્ડર ફેચ કરવા માટેનું ફંક્શન
  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) {
      setOrders(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // સ્ટેટસ અપડેટ કરવાનું લોજિક
  const updateStatus = async (id, currentStatus, newStatus) => {
    // જો ઓર્ડર પહેલેથી જ Cancelled હોય, તો તેને Confirm થતો અટકાવો
    if (currentStatus === "Cancelled" && newStatus === "Confirmed") {
      alert("This order is already cancelled and cannot be confirmed.");
      return;
    }

    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      alert("Status update failed");
    } else {
      fetchOrders();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-400 font-bold uppercase tracking-widest text-xs">
        <RefreshCw className="animate-spin mr-2" size={16} /> Loading Orders...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* HEADER */}
        <div className="p-6 border-b flex justify-between items-center">
          <h1 className="text-xl font-black uppercase tracking-tighter italic">Manage Orders</h1>
          <button
            onClick={fetchOrders}
            className="p-2 hover:bg-gray-100 rounded-full transition-all active:scale-90"
          >
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                <th className="p-4 text-left">Order Details</th>
                <th className="p-4 text-left">Customer Info</th>
                <th className="p-4 text-left">Shipping Address</th>
                <th className="p-4 text-left">Amount</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50/30 transition-colors">
                  
                  {/* ORDER ID & STATUS */}
                  <td className="p-4">
                    <div className="font-black text-gray-900 text-sm">
                      #{order.order_number || order.id.slice(0, 5).toUpperCase()}
                    </div>
                    <div className="mt-2">
                      <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider ${
                        order.status === 'Confirmed' ? 'bg-green-100 text-green-600' :
                        order.status === 'Cancelled' ? 'bg-red-100 text-red-600' :
                        order.status === 'Delivered' ? 'bg-black text-white' : 'bg-blue-100 text-blue-600'
                      }`}>
                        {order.status || 'Pending'}
                      </span>
                    </div>

                    {/* CANCEL REASON જો હોય તો */}
                    {order.status === "Cancelled" && order.cancel_reason && (
                      <div className="mt-2 flex items-start gap-1 text-red-500 bg-red-50 p-2 rounded-lg border border-red-100 max-w-[200px]">
                        <AlertCircle size={12} className="mt-0.5 flex-shrink-0" />
                        <p className="text-[10px] font-bold leading-tight uppercase">
                          Reason: {order.cancel_reason}
                        </p>
                      </div>
                    )}
                    
                    <div className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-tight">
                      {new Date(order.created_at).toLocaleDateString('en-IN')}
                    </div>
                  </td>

                  {/* CUSTOMER */}
                  <td className="p-4">
                    <div className="font-bold text-gray-900 text-sm">{order.customer_name}</div>
                    <div className="text-xs text-gray-500 font-bold">{order.phone}</div>
                  </td>

                  {/* ADDRESS */}
                  <td className="p-4">
                    <div className="text-[11px] text-gray-600 font-medium leading-relaxed max-w-[200px]">
                      {order.address}
                      {order.city && (
                        <div className="flex items-center gap-1 text-gray-400 mt-1 font-bold uppercase">
                          <MapPin size={10} /> {order.city} - {order.pincode}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* TOTAL */}
                  <td className="p-4">
                    <div className="font-black text-gray-900">₹{order.total_amount.toLocaleString()}</div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase italic">
                      {order.payment_method || "COD"}
                    </div>
                  </td>

                  {/* ACTION BUTTONS - બટન ક્યારે બતાવવા તેનું લોજિક */}
                  <td className="p-4">
                    <div className="flex flex-col gap-2 items-center">
                      <button
                        onClick={() => window.location.href = `/admin/orders/${order.id}`}
                        className="w-28 bg-gray-100 text-gray-800 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all"
                      >
                        View Info
                      </button>
                      
                      {/* જો ઓર્ડર PENDING હોય તો જ CONFIRM/CANCEL બતાવવા */}
                      {order.status === "Pending" && (
                        <>
                          <button
                            onClick={() => updateStatus(order.id, order.status, "Confirmed")}
                            className="w-28 border-2 border-green-500 text-green-500 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-green-50 transition-all flex items-center justify-center gap-1"
                          >
                            <CheckCircle2 size={12} /> Confirm
                          </button>
                          <button
                            onClick={() => updateStatus(order.id, order.status, "Cancelled")}
                            className="w-28 border-2 border-red-500 text-red-500 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-red-50 transition-all flex items-center justify-center gap-1"
                          >
                            <XCircle size={12} /> Cancel
                          </button>
                        </>
                      )}

                      {/* જો ઓર્ડર CONFIRMED હોય, તો ફક્ત DELIVERED કરી શકાય */}
                      {order.status === "Confirmed" && (
                        <button
                          onClick={() => updateStatus(order.id, order.status, "Delivered")}
                          className="w-28 border-2 border-black text-black py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all flex items-center justify-center gap-1"
                        >
                          <Truck size={12} /> Ship & Deliver
                        </button>
                      )}

                      {/* જો ઓર્ડર DELIVERED કે CANCELLED હોય, તો કોઈ વધારાના બટન નહીં દેખાય */}
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {orders.length === 0 && (
          <div className="p-20 text-center text-gray-300 font-black uppercase tracking-widest text-sm">
            No Orders Found
          </div>
        )}
      </div>
    </div>
  );
}