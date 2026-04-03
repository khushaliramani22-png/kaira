"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function UserOrderPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const downloadInvoice = (order) => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(22);
      doc.text("KAIRA", 14, 20);
      doc.setFontSize(10);
      doc.text(`Order ID: #KRA-${order.id.slice(0, 6).toUpperCase()}`, 14, 30);
      doc.text(`Date: ${new Date(order.created_at).toLocaleDateString()}`, 14, 35);

      const tableColumn = ["Product", "Qty", "Price", "Total"];
      const tableRows = order.order_items.map(item => [
        item.product_name,
        item.quantity,
        `INR ${item.price}`,
        `INR ${item.price * item.quantity}`
      ]);

      autoTable(doc, {
        startY: 45,
        head: [tableColumn],
        body: tableRows,
        theme: 'grid',
        headStyles: { fillColor: [0, 0, 0] }
      });

      const finalY = doc.lastAutoTable.finalY || 45;
      doc.setFontSize(14);
      doc.text(`Grand Total: INR ${order.total_amount}`, 14, finalY + 15);
      doc.save(`Kaira_Invoice_${order.id.slice(0, 6)}.pdf`);
    } catch (error) {
      console.error("PDF Error:", error);
      Swal.fire("Error", "Invoice generate કરવામાં પ્રોબ્લેમ આવ્યો છે.", "error");
    }
  };

  const handleReorder = async (items) => {
    Swal.fire("Success", "Items added to cart again!", "success");
    router.push("/cart");
  };

  useEffect(() => {
    fetchUserOrders();

    // Real-time updates 
    const channel = supabase
      .channel('order-status-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          console.log('Order Updated:', payload);
          fetchUserOrders();
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchUserOrders = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
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

  const handleCancelOrder = async (orderId, orderItems, currentStatus = "") => {
    const status = currentStatus ? currentStatus.toLowerCase() : "";

    if (status === "shipped" || status === "delivered") {
      Swal.fire("Not Possible", "Shipped orders cannot be cancelled.", "error");
      return;
    }
    const { value: reason, isConfirmed } = await Swal.fire({
      title: '<span style="font-size: 20px; font-weight: 900;">CANCEL ORDER</span>',
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

        const { error: updateError } = await supabase
          .from("orders")
          .update({ status: "Cancelled", cancel_reason: reason })
          .eq("id", orderId);

        if (updateError) throw updateError;

        await Swal.fire({
          icon: "success",
          title: "Order Cancelled",
          text: "Your order has been cancelled and stock is restored.",
          confirmButtonColor: "#000",
        });
        fetchUserOrders();
      } catch (error) {
        Swal.fire("Error", error.message, "error");
      } finally {
        setLoading(false);
      }
    }
  };

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
          .update({ status: "Return Requested", return_reason: reason })
          .eq("id", orderId);

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
  // rate

const handleRateProduct = async (productId, productName) => {
  const { value: formValues } = await Swal.fire({
    title: `<span style="font-size: 18px; font-weight: 900;">RATE ${productName.toUpperCase()}</span>`,
    html:
      '<select id="swal-input1" class="swal2-input" style="font-size: 14px;">' +
      '<option value="5">⭐⭐⭐⭐⭐ (Excellent)</option>' +
      '<option value="4">⭐⭐⭐⭐ (Good)</option>' +
      '<option value="3">⭐⭐⭐ (Average)</option>' +
      '<option value="2">⭐⭐ (Poor)</option>' +
      '<option value="1">⭐ (Very Bad)</option>' +
      '</select>' +
      '<textarea id="swal-input2" class="swal2-textarea" placeholder="Share your experience with Kaira..."></textarea>',
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonColor: "#000",
    confirmButtonText: "SUBMIT REVIEW",
    preConfirm: () => {
      return [
        document.getElementById('swal-input1').value,
        document.getElementById('swal-input2').value
      ]
    }
  });

  if (formValues) {
    const [rating, comment] = formValues;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Swal.fire('Login Required', 'Please login to submit a review.', 'warning');
        router.push('/login');
        return;
      }

      const { error } = await supabase
        .from("product_reviews") // સાચું ટેબલ નામ
        .insert([{ 
          product_id: productId, 
          user_id: user.id, 
          rating: parseInt(rating), 
          comment: comment,
          customer_name: user.email.split('@')[0], 
          
          status: 'pending' 
        }]);

      if (error) throw error;
      Swal.fire("Thank You!", "Your review has been submitted for approval.", "success");
    } catch (error) {
      console.error("Review Error:", error);
      Swal.fire("Error", `ભૂલ થઈ: ${error.message}`, "error");
    }
  }
};

  // ... formatDate 
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
    <div className="max-w-4xl mx-auto p-4 md:p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-black mb-8 italic tracking-tighter uppercase">My Orders</h1>

      <div className="space-y-8">
        {orders.length > 0 ? (
          orders.map((order) => (
            <div key={order.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              {/* --- ORDER HEADER --- */}
              <div className="flex flex-wrap justify-between items-center border-b pb-4 mb-4 gap-4">
                <div className="flex gap-8">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1 font-bold">Order Placed</p>
                    <p className="text-sm font-bold text-gray-700">{formatDate(order.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1 font-bold">Order No.</p>
                    <p className="text-sm font-black text-gray-900">#KRA-{order.id.slice(0, 6).toUpperCase()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1 font-bold">Total Amount</p>
                    <p className="font-black text-lg text-gray-900">₹{order.total_amount.toLocaleString()}</p>
                  </div>
                  <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${order.status.toLowerCase() === 'delivered' ? 'bg-green-100 text-green-700' :
                    order.status.toLowerCase() === 'cancelled' ? 'bg-red-100 text-red-700' :
                      order.status.toLowerCase() === 'return requested' ? 'bg-orange-100 text-orange-700' : 'bg-black text-white'
                    }`}>
                    {order.status}
                  </span>
                </div>
              </div>

              {/* --- TRACKING STEPPER --- */}

              {order.status.toLowerCase() !== 'cancelled' && (
                <div className="mb-10 mt-4 px-2">
                  <div className="flex justify-between items-center relative">
                    {['Pending', 'Confirmed', 'Shipped', 'Delivered'].map((step) => {
                      const currentStatus = order.status ? order.status.toLowerCase() : 'pending';
                      const stepLower = step.toLowerCase();
                      const isCompleted =
                        (currentStatus === 'delivered') ||
                        (currentStatus === 'shipped' && (stepLower === 'pending' || stepLower === 'confirmed' || stepLower === 'shipped')) ||
                        (currentStatus === 'confirmed' && (stepLower === 'pending' || stepLower === 'confirmed')) ||
                        (currentStatus === 'pending' && stepLower === 'pending');
                      return (
                        <div key={step} className="flex flex-col items-center z-10 bg-white px-2">
                          <div className={`h-5 w-5 rounded-full border-4 ${isCompleted ? 'bg-black border-black' : 'bg-white border-gray-200'
                            } transition-all duration-500`}></div>
                          <p className={`text-[9px] font-black uppercase mt-2 tracking-tighter ${isCompleted ? 'text-black' : 'text-gray-400'
                            }`}>
                            {step}
                          </p>
                        </div>
                      );
                    })}
                    <div className="absolute top-[10px] left-0 w-full h-[2px] bg-gray-100 -z-0"></div>
                  </div>
                </div>
              )}


              {/* --- ORDER ITEMS LIST --- */}
              <div className="divide-y divide-gray-50">
                {order.order_items?.map((item) => (
                  <div key={item.id} className="flex gap-5 py-4 items-center">
                    <div className="h-24 w-20 bg-gray-50 border flex-shrink-0 overflow-hidden">
                      {item.image ? (
                        <img src={item.image} alt={item.product_name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-[10px] text-gray-300">No Image</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <h6 className="font-bold text-gray-900 text-[14px] mb-1 uppercase tracking-tight">{item.product_name}</h6>
                          <p className="text-[11px] text-gray-500 font-bold uppercase">
                            Qty: <span className="text-black">{item.quantity}</span> | Size: <span className="text-black">{item.size || "N/A"}</span>
                          </p>
                        </div>
                        {/* ⭐ Meesho Style Rate Button - ફક્ત Delivered ઓર્ડર માટે */}
                        {order.status.toLowerCase() === "delivered" && (
                          <button
                            onClick={() => handleRateProduct(item.product_id, item.product_name)}
                            className="text-pink-600 text-[10px] font-black uppercase flex items-center gap-1 hover:underline mt-1"
                          >
                            ⭐ Rate & Review Product
                          </button>
                        )}
                        <p className="font-black text-gray-900 text-[14px]">₹{item.price.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>


              {/* --- ACTION BUTTONS --- */}
              <div className="mt-6 pt-4 border-t border-dashed flex flex-wrap justify-end gap-3">
                <button onClick={() => downloadInvoice(order)} className="text-gray-600 border border-gray-200 px-4 py-2 rounded-xl text-[10px] font-bold uppercase hover:bg-gray-50">
                  Download Invoice
                </button>

                {/* ૧. DELIVERED: Reorder and Return option*/}
                {order.status.toLowerCase() === "delivered" && (
                  <>
                    <button onClick={() => handleReorder(order.order_items)} className="bg-black text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase hover:bg-gray-800">Buy It Again</button>
                    <button onClick={() => handleReturnOrder(order.id)} className="text-black border-2 border-black px-6 py-2 rounded-xl text-[11px] font-black uppercase hover:bg-gray-100">Return Order</button>
                  </>
                )}

                {/* ૨. PENDING અથવા CONFIRMED: user cancel */}
                {(order.status.toLowerCase() === "pending" || order.status.toLowerCase() === "confirmed") && (
                  <button
                    onClick={() => handleCancelOrder(order.id, order.order_items, order.status)}
                    className="text-red-500 border-2 border-red-500 px-6 py-2 rounded-xl text-[11px] font-black uppercase hover:bg-red-50"
                  >
                    Cancel Order
                  </button>
                )}

                {/* ૩. SHIPPED: cancel block and help msg */}
                {order.status.toLowerCase() === "shipped" && (
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] text-orange-600 font-black uppercase tracking-widest mb-1">Order in Transit</span>
                    <p className="text-[9px] text-gray-400 font-medium">Cannot cancel now. Contact support for help.</p>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-24 bg-white rounded-[40px] border-2 border-dashed border-gray-100 shadow-sm">
            <div className="mb-6 flex justify-center">
              <div className="bg-gray-50 p-6 rounded-full">
                <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-black text-gray-800 uppercase italic tracking-tighter mb-2">No Orders Yet</h3>
            <p className="text-gray-400 text-sm mb-8 font-medium">Your wardrobe is waiting for some Kaira magic.</p>
            <button onClick={() => router.push("/shop")} className="bg-black text-white px-10 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 shadow-xl shadow-black/10">Start Shopping</button>
          </div>
        )}
      </div>
    </div>
  );
}