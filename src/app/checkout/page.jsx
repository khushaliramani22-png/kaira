"use client";

import { useState } from "react";
import { useCart } from "@/app/context/CartContext";
import { supabase } from "@/lib/supabase";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Swal from "sweetalert2";

export default function CheckoutPage() {
  const { cartItems, clearCart } = useCart();
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

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingCharge = subtotal > 1000 ? 0 : 50;
  const totalAmount = subtotal + shippingCharge;

  // ૧. Invoice PDF Function
  const generateInvoicePDF = (orderData, items) => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text("KAIRA", 14, 20);
      
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(`INVOICE: #KRA-${orderData.id.slice(0, 8).toUpperCase()}`, 140, 20);
      doc.text(`DATE: ${new Date().toLocaleDateString("en-IN")}`, 140, 25);

      doc.setFontSize(10);
      doc.text("BILL TO:", 14, 40);
      doc.text(`${orderData.customer_name}`, 14, 46);
      doc.text(`+91 ${orderData.phone}`, 14, 51);
      doc.text(`${orderData.address}, ${orderData.city}`, 14, 56);

      const tableData = items.map((item, index) => [
        index + 1,
        item.product_name,
        `${item.size} / ${item.color}`,
        item.quantity,
        `INR ${item.price}`,
        `INR ${item.price * item.quantity}`
      ]);

      autoTable(doc, {
        startY: 65,
        head: [['#', 'PRODUCT', 'VARIANT', 'QTY', 'PRICE', 'TOTAL']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [0, 0, 0] },
      });

      const finalY = doc.lastAutoTable.finalY + 10;
      doc.setFont("helvetica", "bold");
      doc.text(`GRAND TOTAL: INR ${orderData.total_amount}`, 130, finalY);

      doc.save(`Kaira_Invoice_${orderData.id.slice(0, 8)}.pdf`);
    } catch (pdfError) {
      console.error("PDF Error:", pdfError);
    }
  };

  // ૨. ઓર્ડર પ્લેસ કરવાનું મુખ્ય ફંક્શન
  const handleOrder = async () => {
    if (!formData.name || !formData.phone || !formData.address || !formData.email) {
      alert("Please fill all required fields.");
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please login to place an order.");

      // ઓર્ડર સેવ (Orders Table)
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
        .select().single();

      if (orderError) throw orderError;

      // આઈટમ્સ સેવ (Order Items Table)
      const itemsToInsert = cartItems.map((item) => ({
        order_id: orderData.id,
        product_id: item.product_id || item.id,
        product_name: item.name || item.product_name,
        image: item.image || item.image1, 
        size: item.selected_size || "N/A",
        color: item.selected_color || "N/A",
        quantity: item.quantity,
        price: item.price
      }));

      const { error: itemError } = await supabase.from("order_items").insert(itemsToInsert);
      if (itemError) throw itemError;

      // ઇનવોઇસ ડાઉનલોડ
      generateInvoicePDF(orderData, itemsToInsert);

      // ૩. Meesho Style Success Popup
      Swal.fire({
        html: `
          <div style="background-color: #03a66d; margin: -20px; padding: 50px 20px; color: white; text-align: center;">
            <div style="margin-bottom: 20px;">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <h2 style="font-weight: 800; font-size: 30px; margin-bottom: 10px;">Order Confirmed!</h2>
            <p style="font-size: 16px; opacity: 0.9;">Your order was placed successfully.</p>
            <div style="margin-top: 20px; background: rgba(255,255,255,0.2); display: inline-block; padding: 8px 20px; border-radius: 50px; font-weight: bold;">
              Invoice Downloaded ✅
            </div>
          </div>
        `,
        background: '#03a66d',
        showConfirmButton: true,
        confirmButtonText: 'GO TO MY ORDERS',
        confirmButtonColor: '#000000',
        allowOutsideClick: false,
        timer: 4000, // ૪ સેકન્ડ પછી ઓટોમેટિક રીડાયરેક્ટ
        timerProgressBar: true,
        width: '100%',
        padding: '0',
      }).then((result) => {
        clearCart();
        window.location.href = "/user-order";
      });

    } catch (error) {
      console.error("Critical Error:", error.message);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f8f8] py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-black mb-8 uppercase tracking-widest border-b-2 border-black pb-4 text-center md:text-left">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border">
              <h3 className="font-bold mb-4 uppercase text-xs tracking-wider text-gray-400">Shipping Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input name="name" placeholder="Enter your Full Name *" onChange={handleChange} className="w-full border p-3 rounded-xl outline-none focus:border-black" />
                <input name="phone" placeholder="Enter your Phone Number *" onChange={handleChange} className="w-full border p-3 rounded-xl outline-none focus:border-black" />
                <input nmae="email" placeholder="Enter your E-mail" onChange={handleChange} className="w-full border p-3 rounded-x1 outline-none focus:border-black" />
                <textarea name="address" placeholder="house No,soc.name..." onChange={handleChange} className="w-full border p-3 rounded-xl md:col-span-2 outline-none focus:border-black" />
                <input name="city" placeholder="Enter your City" onChange={handleChange} className="w-full border p-3 rounded-xl outline-none focus:border-black" />
                <input name="pincode" placeholder="Pincode" onChange={handleChange} className="w-full border p-3 rounded-xl outline-none focus:border-black" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border">
              <h3 className="font-bold mb-4 uppercase text-xs tracking-wider text-gray-400">Payment Method</h3>
              <div className="flex gap-4">
                <button onClick={() => setPaymentMethod("COD")} className={`flex-1 p-4 border-2 rounded-xl font-bold transition ${paymentMethod === "COD" ? "border-black bg-gray-50 text-black" : "border-gray-100 text-gray-400"}`}>Cash on Delivery</button>
                <button onClick={() => setPaymentMethod("Online")} className={`flex-1 p-4 border-2 rounded-xl font-bold transition ${paymentMethod === "Online" ? "border-black bg-gray-50 text-black" : "border-gray-100 text-gray-400"}`}>Online Payment</button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="bg-white p-6 rounded-2xl shadow-lg border-t-4 border-black sticky top-10">
              <h3 className="font-black mb-6 uppercase italic text-lg">Order Summary</h3>
              <div className="divide-y max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4 py-4">
                    <img src={item.image || item.image1} className="w-16 h-20 object-cover rounded-lg border" alt="" />
                    <div className="flex-1">
                      <p className="font-bold text-sm uppercase leading-tight">{item.name}</p>
                      <p className="text-[10px] font-bold text-gray-400 mt-1">QTY: {item.quantity}</p>
                      <p className="font-black text-sm mt-1">₹{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t-2 border-dashed space-y-2">
                <div className="flex justify-between text-sm font-bold text-gray-500"><span>Subtotal</span><span>₹{subtotal.toLocaleString()}</span></div>
                <div className="flex justify-between text-sm font-bold text-gray-500"><span>Shipping</span><span>{shippingCharge === 0 ? "FREE" : `₹${shippingCharge}`}</span></div>
                <div className="flex justify-between font-black text-2xl pt-4 border-t-2 border-black mt-4"><span>Total</span><span>₹{totalAmount.toLocaleString()}</span></div>
              </div>

              <button onClick={handleOrder} disabled={loading || cartItems.length === 0} className="w-full bg-black text-white py-5 rounded-2xl mt-8 font-black uppercase tracking-widest hover:bg-gray-900 transition-all disabled:bg-gray-300 shadow-xl">
                {loading ? "Placing Order..." : "Confirm & Pay"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}