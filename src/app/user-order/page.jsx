"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { AiOutlineSearch, AiOutlineRight, AiFillStar } from "react-icons/ai";
import { IoFilterOutline } from "react-icons/io5";

export default function UserOrderPage() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchUserOrders();
  }, []);

  useEffect(() => {
    const results = orders.filter(order =>
      order.order_items.some(item =>
        item.product_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredOrders(results);
  }, [searchTerm, orders]);

  const fetchUserOrders = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const { data: ordersData, error } = await supabase
        .from("orders")
        .select(`*, order_items (*)`)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(ordersData || []);
      setFilteredOrders(ordersData || []);
    } catch (error) {
      console.error("Error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  // --- આ ફંક્શન ઉમેરવાથી તમારી એરર સોલ્વ થઈ જશે ---
  const handleRateProduct = (productId, productName) => {
    // આ યુઝરને નવા બનાવેલા રેટિંગ પેજ પર મોકલશે
    router.push(`/rate-product/${productId}?name=${encodeURIComponent(productName)}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="bg-[#f8f9fa] min-h-screen pb-20">
      {/* --- HEADER & SEARCH --- */}
      <div className="bg-white p-4 shadow-sm sticky top-0 z-20">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-lg font-bold text-gray-800 mb-4 uppercase tracking-tight">My Orders</h1>
          <div className="flex gap-3">
            <div className="relative flex-grow">
              <AiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search your orders here"
                className="w-full bg-gray-100 border-none rounded-lg py-2.5 ps-10 text-sm focus:ring-1 focus:ring-gray-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="flex items-center gap-1 text-pink-600 font-bold text-sm border border-gray-200 px-4 rounded-lg bg-white">
              <IoFilterOutline size={18} /> Filters
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto mt-2">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <div key={order.id} className="mb-2 bg-white border-b border-gray-100">
              {order.order_items?.map((item) => {
                const isCancelled = order.status.toLowerCase() === "cancelled";
                const isDelivered = order.status.toLowerCase() === "delivered";

                return (
                  <div
                    key={item.id}
                    className="p-4 flex gap-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    {/* Product Image */}
                    <div 
                      className="w-20 h-28 flex-shrink-0"
                      onClick={() => router.push(`/user-order/${order.id}`)}
                    >
                      <img
                        src={item.image}
                        alt={item.product_name}
                        className="w-full h-full object-cover rounded-md"
                      />
                    </div>

                    {/* Order Details */}
                    <div className="flex-grow">
                      <div className="flex justify-between" onClick={() => router.push(`/user-order/${order.id}`)}>
                        <div>
                          <h2 className={`text-base font-bold ${isCancelled ? 'text-gray-800' : 'text-gray-900'}`}>
                            {isCancelled ? "Order Cancelled" : isDelivered ? "Delivered Early" : order.status}
                          </h2>
                          <p className="text-gray-500 text-xs mt-0.5 font-medium">
                            {isCancelled ? "As per your request" : `on ${new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}`}
                          </p>
                          <p className="text-gray-400 text-xs mt-2">
                            Size: {item.size || "Free"}  •  Qty: {item.quantity}
                          </p>
                        </div>
                        <AiOutlineRight className="text-gray-400 mt-1" />
                      </div>

                      {/* Feedback & Stars Section */}
                      {isDelivered && (
                        <div className="mt-4 pt-3 border-t border-gray-50">
                          <p className="text-gray-700 text-xs font-semibold mb-2">We are glad you liked the product!</p>
                          <div className="flex items-center justify-between">
                            <div className="flex gap-1 text-green-500">
                              {[1, 2, 3, 4].map(s => <AiFillStar key={s} size={22} />)}
                              <AiFillStar className="text-gray-200" size={22} />
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation(); // Parent div પર ક્લિક થતું અટકાવવા માટે
                                handleRateProduct(item.product_id, item.product_name);
                              }}
                              className="text-pink-600 font-bold text-xs uppercase tracking-tighter"
                            >
                              Complete Your Feedback
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-400 font-medium">No orders found.</p>
          </div>
        )}
      </div>

    </div>
  );
}