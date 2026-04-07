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
    const [userReview, setUserReview] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [requestType, setRequestType] = useState("");
    const [reason, setReason] = useState("");
    const [additionalInfo, setAdditionalInfo] = useState("");
    const [submitting, setSubmitting] = useState(false);
    useEffect(() => {
        async function fetchOrderAndReview() {
            try {
                const { data: orderData, error: orderError } = await supabase
                    .from("orders")
                    .select(`*, order_items (*)`)
                    .eq("id", id)
                    .single();

                if (orderError) throw orderError;
                setOrder(orderData);

                if (orderData && orderData.order_items?.[0]) {
                    const productId = orderData.order_items[0].product_id;

                    const { data: reviewData, error: reviewError } = await supabase
                        .from("product_reviews")
                        .select("*")
                        .eq("product_id", productId)

                        .eq("customer_name", orderData.customer_name)
                        .maybeSingle();

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

    if (loading)
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-pink-600"></div>
            </div>
        );

    if (!order)
        return <div className="text-center p-10 font-bold">Order Not Found</div>;

    const isDelivered = order.status.toLowerCase() === "delivered";
    const canReturnOrExchange =
        isDelivered &&
        (new Date() - new Date(order.created_at)) / (1000 * 60 * 60 * 24) <= 7;

    const submitRequest = async () => {
        if (!reason) return alert("Please select a reason");

        setSubmitting(true);
        try {
            const { error } = await supabase
                .from("orders")
                .update({
                    status: `${requestType} Pending`,
                    return_reason: reason, 
                    return_details: additionalInfo
                })
                .eq("id", id);

            if (error) throw error;

            alert(`${requestType} request submitted successfully!`);
            setIsModalOpen(false);
            window.location.reload();
        } catch (err) {
            alert(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const openModal = (type) => {
        setRequestType(type);
        setIsModalOpen(true);
    };

    return (
        <div className="bg-[#f4f7f9] min-h-screen pb-10 w-full">
            {/* Header - Full Width */}
            <div className="bg-white p-4 shadow-sm sticky top-0 z-50 border-b w-full">
                <div className="px-4 md:px-10 flex justify-between items-center w-full">
                    <div className="flex items-center gap-4">
                        <AiOutlineLeft
                            size={22}
                            className="cursor-pointer text-gray-700"
                            onClick={() => router.back()}
                        />
                        <h1 className="font-bold text-lg uppercase tracking-wide text-gray-700">
                            Order Details
                        </h1>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600 font-bold text-sm uppercase cursor-pointer">
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
                            <img
                                src={item.image}
                                className="w-28 h-36 md:w-40 md:h-52 object-cover rounded-lg border shadow-sm"
                                alt={item.product_name}
                            />
                            <div className="flex-grow">
                                <div className="flex justify-between items-start">
                                    <h2 className="text-lg md:text-2xl font-bold text-gray-800">
                                        Order #{order.id.slice(0, 15).toUpperCase()}
                                    </h2>
                                    <AiOutlineRight className="text-gray-400 size-6" />
                                </div>
                                <p className="text-base md:text-lg text-gray-600 mt-2">
                                    {item.product_name}
                                </p>
                                <p className="text-sm text-gray-400 mt-2 font-medium">
                                    Size: {item.size || "Free"} • Quantity: {item.quantity}
                                </p>
                                <p className="text-xl md:text-2xl font-black text-gray-600 mt-4">
                                    ₹{item.price.toLocaleString()}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
               
                {/* Status and Tracker Section */}
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 w-full">
                    <div className="flex items-center gap-6">
                        <div
                            className={`p-3 rounded-full ${order.status === "Cancelled" ? "bg-red-100" : "bg-green-100"}`}
                        >
                            {order.status === "Cancelled" ? (
                                <IoCheckmarkCircle className="text-red-600" size={36} />
                            ) : (
                                <IoCheckmarkCircle className="text-green-600" size={36} />
                            )}
                        </div>
                        <div>
                            <h3
                                className={`font-bold text-xl ${order.status === "Cancelled" ? "text-red-600" : "text-gray-800"}`}
                            >
                                {order.status === "Cancelled"
                                    ? "Order Cancelled"
                                    : isDelivered
                                        ? "Delivered Early"
                                        : order.status}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                {order.status === "Cancelled"
                                    ? "As per your request"
                                    : new Date(order.created_at).toDateString()}
                            </p>
                        </div>
                    </div>

             
                    {/* Dynamic Alert Box */}
                    <div
                        className={`border p-4 rounded-xl mt-6 flex items-center gap-3 ${order.status === "Cancelled"
                                ? "bg-red-50 border-red-100"
                                : order.status.includes("Pending") // Return કે Exchange માટે
                                    ? "bg-yellow-50 border-yellow-100"
                                    : "bg-green-50 border-green-100"
                            }`}
                    >
                        <span className="text-2xl">
                            {order.status === "Cancelled" ? "🛑" : order.status.includes("Pending") ? "⏳" : "⚡"}
                        </span>
                        <p
                            className={`text-sm md:text-base font-bold tracking-wide ${order.status === "Cancelled" ? "text-red-800" : order.status.includes("Pending") ? "text-yellow-800" : "text-green-800"
                                }`}
                        >
                            {order.status === "Cancelled"
                                ? "This order was cancelled. Any refund will be credited within 5-7 business days."
                                : order.status === "Return Pending"
                                    ? "We have received your Return request. Our team is reviewing it."
                                    : order.status === "Exchange Pending"
                                        ? "Your Exchange request is under process. We will update you soon."
                                        : "Great news! Your order has been processed and successfully delivered."}
                        </p>
                    </div>
                </div>

                {/* Return & Exchange Section */}
                {canReturnOrExchange && (
                    <div className="flex gap-4 w-full mt-4">
                        <button
                            onClick={() => openModal('Return')}
                            className="flex-1 bg-white border border-gray-600 text-gray-600 py-3 rounded-lg font-bold uppercase text-xs"
                        >
                            Return
                        </button>
                        <button
                            onClick={() => openModal('Exchange')}
                            className="flex-1 bg-gray-600 text-white py-3 rounded-lg font-bold uppercase text-xs"
                        >
                            Exchange
                        </button>
                    </div>
                )}
                {/* Related Product Component - Full Width */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 w-full">
                    <h3 className="font-bold text-lg text-gray-700 uppercase mb-6 border-b pb-2">
                        Recently Viewed & Suggestions
                    </h3>
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
                        <h3 className="font-bold text-sm uppercase text-gray-600 mb-4 tracking-widest border-b pb-2">
                            Payment Summary
                        </h3>
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
                                <span className="font-bold text-lg text-gray-800">
                                    Final Order Amount
                                </span>
                                <span className="font-black text-3xl text-gray-900">
                                    ₹{order.total_amount}
                                </span>
                            </div>
                        </div>
                        <div className="mt-6 p-4 bg-gray-50 rounded-xl flex items-center gap-3 border border-gray-200">
                            <div className="bg-black text-white text-xs px-3 py-1 rounded-full font-bold uppercase">
                                COD
                            </div>
                            <span className="text-sm font-bold text-gray-700 uppercase tracking-tighter">
                                Paid via Cash On Delivery
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-[100] flex items-end md:items-center justify-center">
                    <div className="bg-white w-full md:w-[500px] rounded-t-3xl md:rounded-2xl p-6 space-y-4 animate-in slide-in-from-bottom duration-300">
                        <div className="flex justify-between items-center border-b pb-3">
                            <h2 className="font-bold text-lg">{requestType} Request</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-500 text-2xl">&times;</button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Reason for {requestType}*</label>
                                <select
                                    className="w-full border p-3 rounded-lg text-sm outline-none focus:border-gray-600 transition-all"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                >
                                    <option value="">Select a Reason</option>
                                    {requestType === "Exchange" ? (
                                        // --- exchange option ---
                                        <>
                                            <option value="Size too small">Size too small (Need bigger)</option>
                                            <option value="Size too large">Size too large (Need smaller)</option>
                                            <option value="Color mismatch">Color different from image</option>
                                            <option value="Defective product">Received damaged item</option>
                                        </>
                                    ) : (
                                        // --- return option ---
                                        <>
                                            <option value="Quality issue">Quality not as expected</option>
                                            <option value="Defective">Product is defective/damaged</option>
                                            <option value="Wrong item">Received wrong item</option>
                                            <option value="Changed mind">Don't want it anymore</option>
                                        </>
                                    )}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Comments (Optional)</label>
                                <textarea
                                    className="w-full border p-3 rounded-lg text-sm"
                                    rows="3"
                                    placeholder="Tell us more..."
                                    value={additionalInfo}
                                    onChange={(e) => setAdditionalInfo(e.target.value)}
                                ></textarea>
                            </div>

                            <button
                                onClick={submitRequest}
                                disabled={submitting || !reason}
                                className={`w-full py-3 rounded-lg font-bold uppercase tracking-wide transition-all disabled:bg-gray-300 ${requestType === "Exchange" ? "bg-orange-500 text-white" : "bg-pink-600 text-white"
                                    }`}
                            >
                                {submitting ? "Submitting..." : `Confirm ${requestType}`}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
