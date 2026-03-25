"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";

export default function OrderDetail() {
  const params = useParams();
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [order, setOrder] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);

  const fetchOrder = useCallback(async () => {
    if (!params.id) return;

    setError(null);
    const idParam = params.id;
    const isNumber = /^\d+$/.test(idParam);

    let query = supabase.from("orders").select("*");

    if (isNumber) {
      query = query.eq("order_number", parseInt(idParam));
    } else {
      query = query.eq("id", idParam);
    }

    const { data: orderData, error: orderError } = await query.single();

    if (orderError) {
      console.error("Supabase Error:", orderError.message);
      setError("ઓર્ડરની વિગત મળી નથી. કૃપા કરીને ઓર્ડર નંબર ચેક કરો.");
      return;
    }

    setOrder(orderData);

    if (orderData) {
      const { data: itemData } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", orderData.id);
      setItems(itemData || []);
    }
  }, [params.id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const updateStatus = async (newStatus) => {
    // --- STATUS LOGIC: જો ઓર્ડર Cancelled હોય તો તેને ફરી Pending/Processing થતો રોકો ---
    if (order?.status === "Cancelled" && newStatus !== "Cancelled") {
      alert("This order is already cancelled and cannot be changed back.");
      return;
    }

    setUpdating(true);
    const idParam = params.id;
    const isNumber = /^\d+$/.test(idParam);

    let query = supabase.from("orders").update({ status: newStatus });

    if (isNumber) {
      query = query.eq("order_number", parseInt(idParam));
    } else {
      query = query.eq("id", idParam);
    }

    const { error: updateError } = await query;

    if (!updateError) {
      setOrder((prev) => ({ ...prev, status: newStatus }));
      alert("Status updated successfully!");
    } else {
      alert("Update failed: " + updateError.message);
    }
    setUpdating(false);
  };

  if (error) {
    return (
      <div className="p-10 text-center">
        <p className="text-red-500 font-bold">{error}</p>
        <button onClick={() => router.back()} className="mt-4 btn btn-dark">Back</button>
      </div>
    );
  }

  if (!order)
    return (
      <div className="p-10 text-center animate-pulse text-gray-500 font-bold">
        Loading Order Details...
      </div>
    );

  const shippingCharge = order.shipping_charge || 0;
  const totalAmount = order.total_amount || 0;

  return (
    <div className="p-3 sm:p-4 md:p-8 max-w-6xl mx-auto bg-white shadow-2xl rounded-2xl my-4 md:my-6 border border-gray-100">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center border-b pb-4 md:pb-6 mb-6 md:mb-8 gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900">
            Order Details
          </h1>
          <p className="text-sm font-bold text-blue-600 mt-1">
            Order ID: #{order.order_number || order.id.slice(-8).toUpperCase()}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Status Dropdown */}
          <div className="relative">
            <select
              value={order.status}
              onChange={(e) => updateStatus(e.target.value)}
              disabled={updating || order.status === "Cancelled"} // જો કેન્સલ હોય તો ડ્રોપડાઉન ડિસેબલ
              className="appearance-none w-32 sm:w-40 bg-white border border-gray-300 text-gray-700 py-1.5 px-3 pr-8 text-xs sm:text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer disabled:opacity-50 transition-all"
            >
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
              <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>

          <span
            className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-tighter border ${
              order.status === "Delivered"
                ? "bg-green-50 text-green-700 border-green-200"
                : order.status === "Cancelled"
                ? "bg-red-50 text-red-700 border-red-200"
                : "bg-blue-50 text-blue-700 border-blue-200"
            }`}
          >
            {order.status}
          </span>
        </div>
      </div>

      {/* --- CANCELLATION REASON DISPLAY --- */}
      {order.status === "Cancelled" && order.cancel_reason && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl">
          <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">
            Cancellation Reason:
          </p>
          <p className="text-sm font-bold text-red-700 italic">
            "{order.cancel_reason}"
          </p>
        </div>
      )}

      {/* Info Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8 mb-8 md:mb-10">
        <div className="bg-blue-50/50 p-4 sm:p-6 rounded-2xl border border-blue-100">
          <h2 className="font-bold text-blue-800 mb-3 sm:mb-4">Shipping Address</h2>
          <div className="space-y-1 text-gray-700 text-sm sm:text-base">
            <p className="font-bold text-gray-900">{order.customer_name}</p>
            <p>📞 {order.phone}</p>
            <p className="mt-2 leading-relaxed">{order.address}</p>
            <p className="font-medium text-gray-900">{order.city} - {order.pincode}</p>
          </div>
        </div>

        <div className="bg-purple-50/50 p-4 sm:p-6 rounded-2xl border border-purple-100">
          <h2 className="font-bold text-purple-800 mb-3 sm:mb-4">Order Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
            <div>
              <p className="text-gray-400 uppercase text-[10px] font-bold">Payment</p>
              <p className="font-bold text-gray-800">{order.payment_method || "COD"}</p>
            </div>
            <div>
              <p className="text-gray-400 uppercase text-[10px] font-bold">Date</p>
              <p className="font-bold text-gray-800">
                {new Date(order.created_at).toLocaleDateString("en-IN")}
              </p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-gray-400 uppercase text-[10px] font-bold">Email</p>
              <p className="font-bold text-gray-800 break-all">{order.email || "N/A"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Items Section */}
      <div className="space-y-4 mb-8 md:mb-10">
        {items.map((item) => (
          <div key={item.id} className="flex flex-col sm:flex-row gap-4 border rounded-xl p-4 hover:bg-gray-50 transition">
            <img
              src={item.image || "/no-image.png"}
              alt={item.product_name}
              style={{ width: '80px', height: '130px', objectFit: 'cover', borderRadius: '8px' }}
            />
            <div className="flex-1 space-y-1">
              <p className="font-bold text-gray-900 text-sm sm:text-base">{item.product_name}</p>
              {item.size && <p className="text-xs">Size: {item.size}</p>}
              {item.color && <p className="text-xs">Color: {item.color}</p>}
              <p className="text-xs text-gray-400 uppercase">SKU: {item.product_id?.slice(-6).toUpperCase()}</p>
            </div>
            <div className="flex justify-between items-center text-sm font-semibold w-full sm:w-auto sm:gap-8 border-t sm:border-0 pt-3 sm:pt-0">
              <div className="text-center flex-1 sm:flex-none">
                <p className="text-gray-400 text-[10px]">Qty</p>
                <p>{item.quantity}</p>
              </div>
              <div className="text-center flex-1 sm:flex-none">
                <p className="text-gray-400 text-[10px]">Price</p>
                <p>₹{item.price}</p>
              </div>
              <div className="text-center flex-1 sm:flex-none">
                <p className="text-gray-400 text-[10px]">Total</p>
                <p className="font-bold text-blue-600">₹{item.price * item.quantity}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Section */}
      <div className="flex justify-center md:justify-end">
        <div className="w-full sm:w-80 space-y-3 bg-gray-50 p-4 sm:p-6 rounded-2xl border">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>₹{order.subtotal}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Shipping</span>
            <span className="text-green-600">{shippingCharge > 0 ? `₹${shippingCharge}` : "FREE"}</span>
          </div>
          <div className="border-t pt-3 flex justify-between font-bold text-lg">
            <span>Total</span>
            <span className="text-blue-600">₹{totalAmount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}