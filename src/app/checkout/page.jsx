"use client";

import { useState } from "react";
import { useCart } from "@/app/context/CartContext";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const { cartItems, clearCart } = useCart();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("COD");

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    pincode: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const shippingCharge = subtotal > 1000 ? 0 : 50;
  const totalAmount = subtotal + shippingCharge;

  const handleOrder = async () => {
    if (!formData.name || !formData.phone || !formData.address) {
      alert("Please fill required fields (Name, Phone, Address)");
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        alert("Please login to place an order.");
        setLoading(false);
        return;
      }

      // 1. Create Order in 'orders' table
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          customer_name: formData.name,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          city: formData.city,
          pincode: formData.pincode,
          subtotal: subtotal,
          shipping_charge: shippingCharge,
          total_amount: totalAmount,
          payment_method: paymentMethod,
          status: "Pending"
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderId = orderData.id;

      // 2. Prepare Order Items (Size & Color Logic) - UPDATED
      const items = cartItems.map((item) => {
        // બધી શક્યતાઓ તપાસો: selected_size, selectedSize અથવા variant string
        let finalSize = item.selected_size || item.selectedSize || item.size || null;
        let finalColor = item.selected_color || item.selectedColor || item.color || null;

        // જો ડેટા "L / Pink" સ્ટ્રિંગમાં હોય તો તેને અલગ કરો
        if (item.variant && item.variant.includes('/')) {
          const parts = item.variant.split('/');
          if (!finalSize) finalSize = parts[0].trim();
          if (!finalColor) finalColor = parts[1].trim();
        }

        return {
          order_id: orderId,
          product_id: item.product_id || item.id,
          product_name: item.name || item.product_name,
          image: item.image || item.image1 || "",
          size: finalSize || "N/A", // 'order_items' ટેબલમાં size કોલમમાં જશે
          color: finalColor || "N/A", // 'order_items' ટેબલમાં color કોલમમાં જશે
          quantity: item.quantity,
          price: item.price
        };
      });

      const { error: itemError } = await supabase
        .from("order_items")
        .insert(items);

      if (itemError) throw itemError;

      alert("Order placed successfully!");
      clearCart();
      router.push("/order-success");

    } catch (error) {
      console.error("Order error:", error);
      alert("Order failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f8f8] py-6 px-4 md:px-10 font-sans">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-8 text-gray-900 border-b pb-4">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white p-5 md:p-8 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <span className="bg-black text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                Shipping Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-[10px] font-bold uppercase text-gray-400 mb-1 block">Full Name *</label>
                  <input name="name" placeholder="Enter your name" onChange={handleChange} className="w-full border-gray-200 border p-3 rounded-lg focus:ring-1 focus:ring-black outline-none transition text-sm" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-gray-400 mb-1 block">Phone Number *</label>
                  <input name="phone" placeholder="10-digit number" onChange={handleChange} className="w-full border-gray-200 border p-3 rounded-lg focus:ring-1 focus:ring-black outline-none transition text-sm" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-gray-400 mb-1 block">Email Address</label>
                  <input name="email" placeholder="email@example.com" onChange={handleChange} className="w-full border-gray-200 border p-3 rounded-lg focus:ring-1 focus:ring-black outline-none transition text-sm" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-[10px] font-bold uppercase text-gray-400 mb-1 block">Full Address *</label>
                  <textarea name="address" rows="3" placeholder="House No, Street, Landmark" onChange={handleChange} className="w-full border-gray-200 border p-3 rounded-lg focus:ring-1 focus:ring-black outline-none transition text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-3 md:col-span-2">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-gray-400 mb-1 block">City</label>
                    <input name="city" placeholder="City" onChange={handleChange} className="w-full border-gray-200 border p-3 rounded-lg focus:ring-1 focus:ring-black outline-none transition text-sm" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-gray-400 mb-1 block">Pincode</label>
                    <input name="pincode" placeholder="6-digit code" onChange={handleChange} className="w-full border-gray-200 border p-3 rounded-lg focus:ring-1 focus:ring-black outline-none transition text-sm" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 md:p-8 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <span className="bg-black text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                Payment Method
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className={`flex items-center gap-3 cursor-pointer border-2 p-4 rounded-xl transition ${paymentMethod === "COD" ? "border-black bg-gray-50" : "border-gray-100"}`}>
                  <input type="radio" name="payment" value="COD" className="accent-black h-4 w-4" checked={paymentMethod === "COD"} onChange={() => setPaymentMethod("COD")} />
                  <div>
                    <p className="font-bold text-sm">Cash on Delivery</p>
                    <p className="text-[10px] text-gray-500">Pay when you receive</p>
                  </div>
                </label>
                <label className={`flex items-center gap-3 cursor-pointer border-2 p-4 rounded-xl transition ${paymentMethod === "Online" ? "border-black bg-gray-50" : "border-gray-100"}`}>
                  <input type="radio" name="payment" value="Online" className="accent-black h-4 w-4" checked={paymentMethod === "Online"} onChange={() => setPaymentMethod("Online")} />
                  <div>
                    <p className="font-bold text-sm">Online Payment</p>
                    <p className="text-[10px] text-gray-500">UPI, Card or Netbanking</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="bg-white p-5 md:p-8 rounded-xl shadow-sm border border-gray-100 sticky top-6">
              <h2 className="text-lg font-semibold mb-6">Order Summary</h2>

              <div className="max-h-[350px] overflow-y-auto pr-2 mb-6 divide-y divide-gray-50">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4 py-4 items-center">
                    <div className="w-16 h-20 bg-gray-50 rounded overflow-hidden flex-shrink-0 border">
                      <img
                        src={item.image || item.image1}
                        alt={item.name}
                     style={{ width: '80px', height: '130px', cursor: 'pointer', objectFit: 'cover' }} />
                
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900 truncate">{item.name}</p>

                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="text-[11px] text-gray-500">Qty: {item.quantity}</span>

                        {/* Size logic: Display for user */}
                        {(item.selected_size || item.selectedSize || item.size || (item.variant && item.variant.includes('/'))) && (
                          <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-700 font-medium">
                            Size: {item.selected_size || item.selectedSize || item.size || item.variant?.split('/')[0]?.trim()}
                          </span>
                        )}

                        {/* Color logic: Display for user */}
                        {(item.selected_color || item.selectedColor || item.color || (item.variant && item.variant.includes('/'))) && (
                          <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-700 font-medium">
                            Color: {item.selected_color || item.selectedColor || item.color || item.variant?.split('/')[1]?.trim()}
                          </span>
                        )}
                      </div>
                      <p className="font-bold text-sm mt-2 text-gray-900">₹{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-4 border-t border-gray-100">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Shipping</span>
                  <span className={shippingCharge === 0 ? "text-green-600 font-medium" : ""}>
                    {shippingCharge === 0 ? "FREE" : `₹${shippingCharge}`}
                  </span>
                </div>
                <div className="flex justify-between mt-4 font-bold text-xl text-black pt-4 border-t-2 border-gray-900">
                  <span>Total Payable</span>
                  <span>₹{totalAmount.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={handleOrder}
                disabled={loading || cartItems.length === 0}
                className="w-full bg-black text-white py-4 rounded-xl mt-8 font-bold hover:bg-gray-800 transition-all shadow-xl disabled:bg-gray-400 disabled:cursor-not-allowed transform active:scale-[0.98]"
              >
                {loading ? "Processing Order..." : `Confirm Order • ₹${totalAmount.toLocaleString()}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}