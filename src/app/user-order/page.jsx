"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2"; // SweetAlert2 ઇમ્પોર્ટ કર્યું

export default function UserOrderPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchUserOrders();
  }, []);

  const fetchUserOrders = async () => {
    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select(`*, order_items (*)`)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (ordersError) throw ordersError;
      setOrders(ordersData || []);
    } catch (error) {
      console.error("Error fetching orders:", error.message);
    } finally {
      setLoading(false);
    }
  };

  // --- ઓર્ડર કેન્સલ કરવાનું મેઈન ફંક્શન ---
  const handleCancelOrder = async (orderId, orderItems) => {
    const { value: reason, isConfirmed } = await Swal.fire({
      title:
        '<span style="font-size: 20px; font-weight: 900;">CANCEL ORDER</span>',
      text: "Please select a reason for cancellation:",
      input: "select",
      inputOptions: {
        "Ordered by mistake": "Ordered by mistake",
        "Delivery time is too long": "Delivery time is too long",
        "Want to change address": "Want to change address",
        "Found a better price elsewhere": "Found a better price elsewhere",
        Other: "Other",
      },
      inputPlaceholder: "Select a reason",
      showCancelButton: true,
      confirmButtonColor: "#000",
      cancelButtonColor: "#d33",
      confirmButtonText: "CONFIRM CANCEL",
      cancelButtonText: "BACK",
    });

    if (isConfirmed && reason) {
      try {
        setLoading(true);

        // ૧. સ્ટોક પાછો વધારવો (Restore Stock)
        for (const item of orderItems) {
          const { data: productData } = await supabase
            .from("products")
            .select("stock")
            .eq("id", item.product_id)
            .single();

          if (productData) {
            await supabase
              .from("products")
              .update({ stock: productData.stock + item.quantity })
              .eq("id", item.product_id);
          }
        }

        // ૨. ઓર્ડર સ્ટેટસ 'Cancelled' કરવું
        const { error: updateError } = await supabase
          .from("orders")
          .update({
            status: "Cancelled",
            cancel_reason: reason,
          })

          .eq("id", orderId)
          .eq("user_id", (await supabase.auth.getUser()).data.user.id);

        if (updateError) throw updateError;

        await Swal.fire({
          icon: "success",
          title: "Order Cancelled",
          text: "Your order has been cancelled and stock is restored.",
          confirmButtonColor: "#000",
        });

        fetchUserOrders(); // ડેટા રિફ્રેશ કરવા માટે
      } catch (error) {
        Swal.fire("Error", error.message, "error");
      } finally {
        setLoading(false);
      }
    }
  };

  // --- ઓર્ડર રીટર્ન કરવાનું ફંક્શન ---
  const handleReturnOrder = async (orderId) => {
    const { value: reason, isConfirmed } = await Swal.fire({
      title: '<span style="font-size: 20px; font-weight: 900;">RETURN REQUEST</span>',
      text: "Why are you returning this order?",
      input: 'select',
      inputOptions: {
        'Size Issue': 'Size Issue',
        'Defective/Damaged': 'Defective/Damaged',
        'Not as described': 'Not as described',
        'Quality not good': 'Quality not good',
        'Other': 'Other'
      },
      inputPlaceholder: 'Select a reason',
      showCancelButton: true,
      confirmButtonColor: '#000',
      cancelButtonColor: '#d33',
      confirmButtonText: 'SUBMIT REQUEST',
      cancelButtonText: 'BACK',
    });

    if (isConfirmed && reason) {
      try {
        setLoading(true);
        const { error } = await supabase
          .from("orders")
          .update({
            status: "Return Requested",
            return_reason: reason
          })
          .eq("id", orderId)
          .eq("user_id", (await supabase.auth.getUser()).data.user.id);

        if (error) throw error;

        await Swal.fire({
          icon: 'success',
          title: 'Request Sent',
          text: 'Your return request has been submitted for review.',
          confirmButtonColor: '#000'
        });

        fetchUserOrders();
      } catch (error) {
        Swal.fire('Error', error.message, 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("en-IN", options);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 min-h-screen bg-gray-50">
      <h1 className="text-2xl font-black mb-6 text-gray-800 uppercase italic tracking-tighter">
        My Orders
      </h1>

      <div className="space-y-6">
        {orders.length > 0 ? (
          orders.map((order, index) => (
            <div
              key={order.id}
              className="border rounded-2xl p-5 shadow-sm bg-white overflow-hidden border-gray-100"
            >
              {/* --- ORDER HEADER --- */}
              <div className="flex flex-wrap justify-between items-center border-b pb-4 mb-4 gap-4">
                <div className="flex gap-8">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1 font-bold">
                      Order Placed
                    </p>
                    <p className="text-sm font-bold text-gray-700">
                      {formatDate(order.created_at)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1 font-bold">
                      Order No.
                    </p>
                    <p className="text-sm font-black text-gray-900">
                      #KRA-{order.id.slice(0, 6).toUpperCase()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1 font-bold">
                      Total Amount
                    </p>
                    <p className="font-black text-lg text-gray-900">
                      ₹{order.total_amount.toLocaleString()}
                    </p>
                  </div>
                  <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${order.status.toLowerCase() === 'delivered' ? 'bg-green-100 text-green-700' :
                      order.status.toLowerCase() === 'cancelled' ? 'bg-red-100 text-red-700' :
                        order.status.toLowerCase() === 'return requested' ? 'bg-orange-100 text-orange-700' : 'bg-black text-white'
                    }`}>
                    {order.status}
                  </span>
                </div>
              </div>

              {/* --- ORDER ITEMS LIST --- */}
              <div className="divide-y divide-gray-50">
                {order.order_items?.map((item) => (
                  <div key={item.id} className="flex gap-5 py-4 items-center">
                    <div className="h-24 w-20 bg-gray-50  border flex-shrink-0 overflow-hidden">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.product_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-[10px] text-gray-300">
                          No Image
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <h6 className="font-bold text-gray-900 text-[14px] mb-1 uppercase tracking-tight">
                            {item.product_name}
                          </h6>
                          <p className="text-[11px] text-gray-500 font-bold uppercase">
                            Qty:{" "}
                            <span className="text-black">{item.quantity}</span>{" "}
                            | Size:{" "}
                            <span className="text-black">
                              {item.size || "N/A"}
                            </span>{" "}
                            | Color:{" "}
                            <span className="text-black">
                              {item.color || "N/A"}
                            </span>
                          </p>
                        </div>
                        <div className="text-right ml-4">
                          <p className="font-black text-gray-900 text-[14px]">
                            ₹{item.price.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            
              {/* --- ACTION BUTTONS SECTION --- */}
              <div className="mt-4 pt-4 border-t border-dashed flex justify-end gap-3">

                {/* cancel button */}
                {order.status.toLowerCase() === "pending" && (
                  <button
                    onClick={() => handleCancelOrder(order.id, order.order_items)}
                    className="text-red-500 border-2 border-red-500 px-6 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-red-50 transition-all"
                  >
                    Cancel Order
                  </button>
                )}

                {/* return button */}
                {order.status.toLowerCase() === "delivered" && (
                  <button
                    onClick={() => handleReturnOrder(order.id)}
                    className="text-black border-2 border-black px-6 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all"
                  >
                    Return Order
                  </button>
                )}

              </div>

            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
            <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">
              No orders found.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
