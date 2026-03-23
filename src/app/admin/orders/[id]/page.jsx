"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams } from "next/navigation";

export default function OrderDetail() {
  const params = useParams();
  const [items, setItems] = useState([]);
  const [order, setOrder] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, []);

  const fetchOrder = async () => {
    const { data: orderData } = await supabase
      .from("orders")
      .select("*")
      .eq("id", params.id)
      .single();
    setOrder(orderData);

    const { data: itemData } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", params.id);
    setItems(itemData || []);
  };

  const updateStatus = async (newStatus) => {
    setUpdating(true);
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", params.id);

    if (!error) {
      setOrder({ ...order, status: newStatus });
      alert("Status updated!");
    }
    setUpdating(false);
  };

  if (!order)
    return (
      <div className="p-10 text-center animate-pulse text-gray-500">
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
          <p className="text-xs sm:text-sm font-mono text-gray-400 mt-1 break-all">
            ID: #{order.id.slice(-8).toUpperCase()}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 w-full md:w-auto">
          <select
            value={order.status}
            onChange={(e) => updateStatus(e.target.value)}
            disabled={updating}
            className="w-full sm:w-auto border p-2 rounded-lg text-sm font-semibold bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <span
            className={`px-3 sm:px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider ${order.status === "Delivered"
              ? "bg-green-100 text-green-700"
              : order.status === "Cancelled"
                ? "bg-red-100 text-red-700"
                : "bg-blue-100 text-blue-700"
              }`}
          >
            {order.status}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8 mb-8 md:mb-10">

        {/* Shipping */}
        <div className="bg-blue-50/50 p-4 sm:p-6 rounded-2xl border border-blue-100">
          <h2 className="font-bold text-blue-800 mb-3 sm:mb-4">
            Shipping Address
          </h2>
          <div className="space-y-1 text-gray-700 text-sm sm:text-base">
            <p className="font-bold text-gray-900">{order.customer_name}</p>
            <p>📞 {order.phone}</p>
            <p className="mt-2 leading-relaxed">{order.address}</p>
            <p className="font-medium text-gray-900">
              {order.city} - {order.pincode}
            </p>
          </div>
        </div>

        {/* Order Info */}
        <div className="bg-purple-50/50 p-4 sm:p-6 rounded-2xl border border-purple-100">
          <h2 className="font-bold text-purple-800 mb-3 sm:mb-4">
            Order Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
            <div>
              <p className="text-gray-400 uppercase text-[10px] font-bold">
                Payment
              </p>
              <p className="font-bold text-gray-800">
                {order.payment_method || "COD"}
              </p>
            </div>

            <div>
              <p className="text-gray-400 uppercase text-[10px] font-bold">
                Date
              </p>
              <p className="font-bold text-gray-800">
                {new Date(order.created_at).toLocaleDateString("en-IN")}
              </p>
            </div>

            <div className="sm:col-span-2">
              <p className="text-gray-400 uppercase text-[10px] font-bold">
                Email
              </p>
              <p className="font-bold text-gray-800 break-all">
                {order.email || "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Items */}
     <div className="space-y-4 mb-8 md:mb-10">
  {items.map((item) => (
    <div
      key={item.id}
      className="flex flex-col sm:flex-row gap-4 border rounded-xl p-4 hover:bg-gray-50"
    >
      {/* Image */}
      <img
        src={item.image || "/no-image.png"}
        alt={item.product_name}
        style={{ width: '80px', height: '130px', cursor: 'pointer', objectFit: 'cover' }}
      />

      {/* Info */}
      <div className="flex-1 space-y-1">
        <p className="font-bold text-gray-900 text-sm sm:text-base">
          {item.product_name}
        </p>

        {item.size && (
          <p className="text-xs sm:text-sm">Size: {item.size}</p>
        )}

        {item.color && (
          <p className="text-xs sm:text-sm">Color: {item.color}</p>
        )}

        <p className="text-xs text-gray-400">
          SKU: {item.product_id?.slice(-6).toUpperCase()}
        </p>
      </div>

      {/* Price Section */}
      <div className="w-full sm:w-auto">
        
        {/* Mobile View */}
        <div className="flex justify-between sm:hidden text-sm font-semibold border-t pt-3 mt-2">
          <div>
            <p className="text-gray-400 text-xs">Qty</p>
            <p>{item.quantity}</p>
          </div>

          <div>
            <p className="text-gray-400 text-xs">Price</p>
            <p>₹{item.price}</p>
          </div>

          <div>
            <p className="text-gray-400 text-xs">Total</p>
            <p className="font-bold text-gray-900">
              ₹{item.price * item.quantity}
            </p>
          </div>
        </div>

        {/* Desktop View */}
        <div className="hidden sm:flex items-center gap-8 text-sm font-semibold">
          <div className="text-center">
            <p className="text-gray-400 text-xs">Qty</p>
            <p>{item.quantity}</p>
          </div>

          <div className="text-center">
            <p className="text-gray-400 text-xs">Price</p>
            <p>₹{item.price}</p>
          </div>

          <div className="text-center">
            <p className="text-gray-400 text-xs">Total</p>
            <p className="font-bold text-gray-900">
              ₹{item.price * item.quantity}
            </p>
          </div>
        </div>

      </div>
    </div>
  ))}
</div>

      {/* Summary */}
      <div className="flex justify-center md:justify-end">
        <div className="w-full sm:w-80 space-y-3 bg-gray-50 p-4 sm:p-6 rounded-2xl border">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>₹{order.subtotal}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span>Shipping</span>
            <span>
              {shippingCharge > 0 ? `₹${shippingCharge}` : "FREE"}
            </span>
          </div>

          <div className="border-t pt-3 flex justify-between font-bold text-lg">
            <span>Total</span>
            <span className="text-blue-600">
              ₹{totalAmount}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}