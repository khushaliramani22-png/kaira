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

      // ૧. સ્ટોક ચેક કરો અને અપડેટ કરો
      for (const item of cartItems) {
        const productId = item.product_id || item.id;
        
        const { data: productData, error: productError } = await supabase
          .from("products")
          .select("stock")
          .eq("id", productId)
          .single();

        if (productError || !productData) {
          throw new Error(`Product ${item.name} not found!`);
        }

        if (productData.stock < item.quantity) {
          throw new Error(`Sorry, only ${productData.stock} units of ${item.name} are available.`);
        }

        const { error: updateError } = await supabase
          .from("products")
          .update({ stock: productData.stock - item.quantity })
          .eq("id", productId);

        if (updateError) throw updateError;
      }

      // ૨. ઓર્ડર ટેબલમાં એન્ટ્રી કરો
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

      // ૩. ઓર્ડર આઈટમ્સ સેવ કરો
      const items = cartItems.map((item) => {
        let finalSize = item.selected_size || item.selectedSize || item.size || null;
        let finalColor = item.selected_color || item.selectedColor || item.color || null;

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
          size: finalSize || "N/A",
          color: finalColor || "N/A",
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
      console.error("Order error:", error.message);
      alert(error.message || "Order failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f8f8] py-10 px-4 md:px-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 border-b pb-4">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <span className="bg-black text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                Shipping Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-gray-500 mb-1 block">Full Name *</label>
                  <input name="name" placeholder="Enter your name" onChange={handleChange} className="w-full border p-3 rounded-xl outline-none focus:ring-1 focus:ring-black" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1 block">Phone Number *</label>
                  <input name="phone" placeholder="10-digit number" onChange={handleChange} className="w-full border p-3 rounded-xl outline-none focus:ring-1 focus:ring-black" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1 block">Email Address</label>
                  <input name="email" placeholder="email@example.com" onChange={handleChange} className="w-full border p-3 rounded-xl outline-none focus:ring-1 focus:ring-black" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-gray-500 mb-1 block">Full Address *</label>
                  <textarea name="address" rows="3" placeholder="House No, Street, Landmark" onChange={handleChange} className="w-full border p-3 rounded-xl outline-none focus:ring-1 focus:ring-black" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <span className="bg-black text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                Payment Method
              </h2>
              <div className="flex gap-4">
                <label className={`flex-1 flex items-center gap-3 cursor-pointer border-2 p-4 rounded-xl transition ${paymentMethod === "COD" ? "border-black bg-gray-50" : "border-gray-100"}`}>
                  <input type="radio" checked={paymentMethod === "COD"} onChange={() => setPaymentMethod("COD")} className="accent-black" />
                  <span className="font-bold text-sm">Cash on Delivery</span>
                </label>
                <label className={`flex-1 flex items-center gap-3 cursor-pointer border-2 p-4 rounded-xl transition ${paymentMethod === "Online" ? "border-black bg-gray-50" : "border-gray-100"}`}>
                  <input type="radio" checked={paymentMethod === "Online"} onChange={() => setPaymentMethod("Online")} className="accent-black" />
                  <span className="font-bold text-sm">Online Payment</span>
                </label>
              </div>
            </div>
          </div>

          {/* Summary Section */}
          <div className="lg:col-span-5">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-6">
              <h2 className="text-lg font-semibold mb-6">Order Summary</h2>
              <div className="divide-y max-h-80 overflow-y-auto pr-2">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4 py-4">
                    <img src={item.image || item.image1} alt="" className="w-16 h-20 object-cover rounded-lg border" />
                    <div className="flex-1">
                      <p className="font-bold text-sm">{item.name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      <p className="font-bold text-sm mt-1 text-black">₹{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{shippingCharge === 0 ? "FREE" : `₹${shippingCharge}`}</span>
                </div>
                <div className="flex justify-between font-black text-xl text-black pt-4 border-t-2 border-gray-900 mt-4">
                  <span>Total</span>
                  <span>₹{totalAmount.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={handleOrder}
                disabled={loading || cartItems.length === 0}
                className="w-full bg-black text-white py-4 rounded-xl mt-8 font-bold hover:bg-gray-800 transition-all disabled:bg-gray-400"
              >
                {loading ? "Processing..." : `Confirm Order • ₹${totalAmount.toLocaleString()}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}