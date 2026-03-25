"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, XCircle, Truck, Package } from "lucide-react";

export default function OrderDetailsAdmin() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrderDetails = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items (*)")
      .eq("id", id)
      .single();

    if (!error) {
      setOrder(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const updateStatus = async (newStatus) => {
    // સિક્યુરિટી ચેક: જો ઓર્ડર કેન્સલ હોય તો કન્ફર્મ ના થાય
    if (order.status === "Cancelled" && newStatus === "Confirmed") {
      alert("Cannot confirm a cancelled order.");
      return;
    }

    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", id);

    if (!error) {
      fetchOrderDetails();
    } else {
      alert("Failed to update status");
    }
  };

  if (loading) return <div className="p-10 text-center font-bold uppercase tracking-widest text-xs text-gray-400">Loading Detail...</div>;
  if (!order) return <div className="p-10 text-center">Order not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* BACK BUTTON */}
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-xs font-black uppercase tracking-widest mb-6 hover:gap-3 transition-all"
        >
          <ArrowLeft size={16} /> Back to Orders
        </button>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          
          {/* HEADER SECTION */}
          <div className="p-8 border-b flex flex-wrap justify-between items-start gap-6 bg-white">
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tighter italic mb-2">
                Order #KRA-{order.id.slice(0, 6).toUpperCase()}
              </h1>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Placed on: {new Date(order.created_at).toLocaleString()}
              </p>
            </div>
            
            <div className="text-right">
              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                order.status === 'Confirmed' ? 'bg-green-100 text-green-600' :
                order.status === 'Cancelled' ? 'bg-red-100 text-red-600' :
                order.status === 'Delivered' ? 'bg-black text-white' : 'bg-blue-100 text-blue-600'
              }`}>
                {order.status}
              </span>
              
              {/* CANCEL REASON જો હોય તો */}
              {order.status === "Cancelled" && order.cancel_reason && (
                <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-xl text-left">
                  <p className="text-[9px] font-black text-red-400 uppercase tracking-widest mb-1">Cancellation Reason:</p>
                  <p className="text-xs font-bold text-red-600 uppercase italic">"{order.cancel_reason}"</p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
            
            {/* CUSTOMER & SHIPPING INFO */}
            <div className="space-y-6">
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-2">
                  <Package size={14} /> Customer Details
                </h3>
                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                  <p className="font-black text-gray-900 uppercase text-sm mb-1">{order.customer_name}</p>
                  <p className="font-bold text-gray-500 text-xs">{order.phone}</p>
                  <p className="font-bold text-gray-500 text-xs mt-1">{order.email || 'No Email'}</p>
                </div>
              </div>

              <div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-2">
                  <Truck size={14} /> Shipping Address
                </h3>
                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                  <p className="text-xs font-bold text-gray-700 leading-relaxed uppercase tracking-tight">
                    {order.address} <br />
                    {order.city} - {order.pincode}
                  </p>
                </div>
              </div>
            </div>

            {/* ORDER ITEMS & ACTIONS */}
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Order Items</h3>
              <div className="space-y-3 mb-8">
                {order.order_items?.map((item, i) => (
                  <div key={i} className="flex gap-4 items-center bg-white p-3 rounded-2xl border border-gray-50">
                    <img src={item.image} className="w-14 h-16 object-cover rounded-xl shadow-sm" alt="" />
                    <div>
                      <p className="text-xs font-black uppercase tracking-tighter">{item.product_name}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">
                        Size: {item.size || 'N/A'} | Qty: {item.quantity}
                      </p>
                      <p className="text-[11px] font-black mt-1">₹{item.price.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* ACTION BUTTONS - STATUS BASED */}
              <div className="bg-black p-6 rounded-3xl shadow-xl shadow-gray-200">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 text-center">Admin Controls</p>
                <div className="flex flex-col gap-3">
                  
                  {order.status === "Pending" && (
                    <>
                      <button
                        onClick={() => updateStatus("Confirmed")}
                        className="w-full bg-green-500 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-600 transition-all flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 size={14} /> Confirm Order
                      </button>
                      <button
                        onClick={() => updateStatus("Cancelled")}
                        className="w-full bg-transparent border-2 border-red-500/50 text-red-500 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
                      >
                        <XCircle size={14} /> Cancel Order
                      </button>
                    </>
                  )}

                  {order.status === "Confirmed" && (
                    <button
                      onClick={() => updateStatus("Delivered")}
                      className="w-full bg-white text-black py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
                    >
                      <Truck size={14} /> Mark as Delivered
                    </button>
                  )}

                  {(order.status === "Delivered" || order.status === "Cancelled") && (
                    <div className="text-center py-2 border border-dashed border-gray-600 rounded-xl">
                      <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">No Actions Available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}