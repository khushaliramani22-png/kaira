"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { AiOutlineSearch, AiOutlineRight, AiFillStar, AiOutlineStar } from "react-icons/ai";

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


      const { data: ordersData, error: orderError } = await supabase
        .from("orders")
        .select(`*, order_items (*)`)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (orderError) throw orderError;
      const { data: reviewsData, error: reviewError } = await supabase
        .from("product_reviews")
        .select("product_id, rating")
        .eq("user_id", user.id);
      if (reviewError) {
        console.error("Review Fetch Error:", reviewError.message);
      }


      const ordersWithReviews = ordersData.map(order => ({
        ...order,
        order_items: order.order_items.map(item => {

          const review = reviewsData?.find(r => r.product_id === item.product_id);
          return {
            ...item,
            user_rating: review ? review.rating : 0
          };
        })
      }));

      setOrders(ordersWithReviews);
      setFilteredOrders(ordersWithReviews);
    } catch (error) {
      console.error("General Error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to cancel this order?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, Cancel it!",
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);
        const { error } = await supabase
          .from("orders")
          .update({ status: "Cancelled" })
          .eq("id", orderId);

        if (error) throw error;
        Swal.fire("Cancelled!", "Your order has been cancelled.", "success");
        fetchUserOrders();
      } catch (error) {
        console.error("Error:", error.message);
        Swal.fire("Error", "Could not cancel order", "error");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleRateProduct = (productId, productName) => {

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
                          <h2 className={`text-base font-bold ${isCancelled ? 'text-red-600' : 'text-gray-900'}`}>
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

                      {/* --- CANCEL ORDER BUTTON START --- */}
                      {order.status.toLowerCase() === "pending" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancelOrder(order.id);
                          }}
                          className="mt-4 bg-white text-red-600 border border-red-200 px-4 py-1.5 rounded text-[11px] font-bold uppercase tracking-wider hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                        >
                          Cancel Order
                        </button>
                      )}
                      {/* Feedback & Stars Section */}
                      {isDelivered && (
                        <div className="mt-4 pt-3 border-t border-gray-50">
                          <p className="text-gray-700 text-[11px] font-semibold mb-2">
                            {item.user_rating > 0 ? "Your Rating" : "We are glad you liked the product!"}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex gap-1 text-green-600">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <span key={star}>
                                  {star <= item.user_rating ? (
                                    <AiFillStar size={20} />
                                  ) : (
                                    <AiOutlineStar className="text-gray-300" size={20} />
                                  )}
                                </span>
                              ))}
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRateProduct(item.product_id, item.product_name);
                              }}
                              className="text-pink-600 font-bold text-xs uppercase tracking-tighter"
                            >
                              {item.user_rating > 0 ? "Edit Feedback" : "Complete Your Feedback"}
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