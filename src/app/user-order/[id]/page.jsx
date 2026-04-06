"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { AiOutlineLeft, AiFillStar, AiOutlineRight } from "react-icons/ai";
import { MdHelpOutline } from "react-icons/md";
import { IoCheckmarkCircle } from "react-icons/io5";
import RelatedProduct from "@/components/RelatedProduct";

export default function OrderDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    // useEffect(() => {
    //     async function fetchOrder() {
    //         try {
    //             const { data, error } = await supabase
    //                 .from("orders")
    //                 .select(`*, order_items (*)`)
    //                 .eq("id", id)
    //                 .single();

    //             if (error) throw error;
    //             setOrder(data);
    //         } catch (err) {
    //             console.error("Error:", err.message);
    //         } finally {
    //             setLoading(false);
    //         }
    //     }
    //     if (id) fetchOrder();
    // }, [id]);
const [userReview, setUserReview] = useState(null);

useEffect(() => {
  async function fetchOrderAndReview() {
    try {
      // ૧. ઓર્ડર અને તેની આઈટમ્સ ફેચ કરો
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select(`*, order_items (*)`)
        .eq("id", id)
        .single();

      if (orderError) throw orderError;
      setOrder(orderData);

      // ૨. જો ઓર્ડર મળી જાય, તો તે પ્રોડક્ટ માટે આ યુઝરનો રિવ્યૂ ચેક કરો
      if (orderData && orderData.order_items?.[0]) {
        const productId = orderData.order_items[0].product_id;
        
        const { data: reviewData, error: reviewError } = await supabase
          .from("product_reviews") // ટેબલનું નામ બરાબર હોવું જોઈએ
          .select("*")
          .eq("product_id", productId)
          .eq("customer_name", "khushi") // અત્યારે "khushi" રાખ્યું છે, ડેટાબેઝ મુજબ
          .maybeSingle(); // single() ના બદલે maybeSingle() વાપરો જેથી રિવ્યૂ ના હોય તો એરર ના આવે

        if (reviewData) {
          setUserReview(reviewData);
        }
      }
    } catch (err) {
      console.error("Error fetching data:", err.message);
    } finally {
      setLoading(false);
    }
  }

  if (id) fetchOrderAndReview();
}, [id]);
    if (loading) return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-pink-600"></div>
        </div>
    );

    if (!order) return <div className="text-center p-10 font-bold">Order Not Found</div>;

    const isDelivered = order.status.toLowerCase() === "delivered";

    return (
        <div className="bg-[#f4f7f9] min-h-screen pb-10 w-full">
            {/* Header - Full Width */}
            <div className="bg-white p-4 shadow-sm sticky top-0 z-50 border-b w-full">
                <div className="px-4 md:px-10 flex justify-between items-center w-full">
                    <div className="flex items-center gap-4">
                        <AiOutlineLeft size={22} className="cursor-pointer text-gray-700" onClick={() => router.back()} />
                        <h1 className="font-bold text-lg uppercase tracking-wide text-gray-700">Order Details</h1>
                    </div>
                    <div className="flex items-center gap-1 text-pink-600 font-bold text-sm uppercase cursor-pointer">
                        <MdHelpOutline size={20} /> Help
                    </div>
                </div>
            </div>

            {/* Main Container - Full Width on Desktop */}
            <div className="w-full px-4 md:px-10 space-y-4 mt-6">

                {/* Product Card - Stretches across the screen */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 w-full">
                    {order.order_items?.map((item) => (
                        <div
                            key={item.id}
                            className="p-6 flex gap-8 cursor-pointer hover:bg-gray-50 transition-all border-b last:border-0 items-center"
                            onClick={() => router.push(`/shop/${item.product_id}`)}
                        >
                            <img src={item.image} className="w-28 h-36 md:w-40 md:h-52 object-cover rounded-lg border shadow-sm" alt={item.product_name} />
                            <div className="flex-grow">
                                <div className="flex justify-between items-start">
                                    <h2 className="text-lg md:text-2xl font-bold text-gray-800">
                                        Order #{order.id.slice(0, 15).toUpperCase()}
                                    </h2>
                                    <AiOutlineRight className="text-gray-400 size-6" />
                                </div>
                                <p className="text-base md:text-lg text-gray-600 mt-2">{item.product_name}</p>
                                <p className="text-sm text-gray-400 mt-2 font-medium">
                                    Size: {item.size || "Free"} • Quantity: {item.quantity}
                                </p>
                                <p className="text-xl md:text-2xl font-black text-pink-600 mt-4">₹{item.price.toLocaleString()}</p>
                            </div>
                        </div>
                    ))}
                </div>
                {/* Rating & Review Section */}
                {/* રિવ્યૂ સેક્શન ફક્ત ત્યારે જ દેખાશે જ્યારે ઓર્ડર Delivered હોય */}
{isDelivered && (
  <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 mt-4">
    <h3 className="font-bold text-xs uppercase text-gray-500 mb-4 tracking-widest border-b pb-2">
      Ratings & Reviews
    </h3>

    {userReview ? (
      // જો રિવ્યૂ મળી જાય તો આ ભાગ દેખાશે
      <div className="space-y-3">
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <AiFillStar 
              key={star} 
              size={20} 
              className={star <= userReview.rating ? "text-green-600" : "text-gray-200"} 
            />
          ))}
        </div>
        <p className="text-gray-800 font-semibold text-sm">
          {userReview.review_text || "Good Product!"} 
        </p>
        <p className="text-xs text-gray-400">
          Submitted on {new Date(userReview.created_at).toLocaleDateString()}
        </p>
      </div>
    ) : (
      // જો રિવ્યૂ ના મળે તો રેટિંગ આપવાનું ઓપ્શન
      <div className="flex justify-between items-center">
        <p className="text-gray-600 text-sm">How is the product?</p>
        <button className="text-pink-600 font-bold text-xs uppercase border border-pink-600 px-4 py-2 rounded-lg hover:bg-pink-50">
          Rate Now
        </button>
      </div>
    )}
  </div>
)}
                {/* Status and Tracker Section */}
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 w-full">
                    <div className="flex items-center gap-6">
                        <div className="bg-green-100 p-3 rounded-full">
                            <IoCheckmarkCircle className="text-green-600" size={36} />
                        </div>
                        <div>
                            <h3 className="font-bold text-xl text-gray-800">{isDelivered ? "Delivered Early" : order.status}</h3>
                            <p className="text-sm text-gray-500 mt-1">{new Date(order.created_at).toDateString()}</p>
                        </div>
                    </div>
                    <div className="bg-green-50 border border-green-100 p-4 rounded-xl mt-6 flex items-center gap-3">
                        <span className="text-2xl">⚡</span>
                        <p className="text-sm md:text-base text-green-800 font-bold tracking-wide">
                            Great news! Your order has been processed and successfully delivered.
                        </p>
                    </div>
                </div>

                {/* Related Product Component - Full Width */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 w-full">
                    <h3 className="font-bold text-lg text-gray-700 uppercase mb-6 border-b pb-2">Recently Viewed & Suggestions</h3>
                    {order.order_items?.[0] && (
                        <RelatedProduct
                            productId={order.order_items[0].product_id}
                            categoryId={order.order_items[0].category_id}
                        />
                    )}
                </div>

                {/* Address and Billing - Full Width */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Delivery Address Section */}
                    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-2 mb-4 border-b pb-2">
                            <span className="text-blue-500 text-xl">📍</span>
                            <span className="font-bold text-sm uppercase text-gray-600 tracking-widest">
                                Delivery Address
                            </span>
                        </div>

                        <p className="font-bold text-lg text-gray-800">
                            {order.customer_name || "Customer"}
                        </p>

                        <p className="text-base text-gray-500 mt-2 leading-relaxed">
                            {order.address} <br />
                            {order.city} - {order.pincode}
                        </p>

                        <p className="text-base font-bold text-gray-900 mt-4 border-t pt-2">
                            Phone: {order.phone}
                        </p>
                    </div>

                    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-sm uppercase text-gray-600 mb-4 tracking-widest border-b pb-2">Payment Summary</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between text-base text-gray-600">
                                <span>Total Product Price</span>
                                <span className="font-bold">₹{order.total_amount}</span>
                            </div>
                            <div className="flex justify-between text-base text-green-600 font-bold">
                                <span>Shipping Fee</span>
                                <span>FREE</span>
                            </div>
                            <div className="border-t border-dashed pt-4 flex justify-between items-center">
                                <span className="font-bold text-lg text-gray-800">Final Order Amount</span>
                                <span className="font-black text-3xl text-gray-900">₹{order.total_amount}</span>
                            </div>
                        </div>
                        <div className="mt-6 p-4 bg-gray-50 rounded-xl flex items-center gap-3 border border-gray-200">
                            <div className="bg-black text-white text-xs px-3 py-1 rounded-full font-bold uppercase">COD</div>
                            <span className="text-sm font-bold text-gray-700 uppercase tracking-tighter">Paid via Cash On Delivery</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}