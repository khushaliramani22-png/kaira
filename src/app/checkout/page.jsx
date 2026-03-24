"use client";

import { useState } from "react";
import { useCart } from "@/app/context/CartContext";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Swal from "sweetalert2";

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

  // ૧. Invoice PDF જનરેટ કરવાનું ફંક્શન
  const generateInvoicePDF = (orderData, items) => {
    const doc = new jsPDF();

    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("KAIRA", 14, 20);
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Premium Clothing Brand", 14, 25);
    doc.text(`INVOICE: #KRA-${orderData.id.slice(0, 8).toUpperCase()}`, 140, 20);
    doc.text(`DATE: ${new Date().toLocaleDateString("en-IN")}`, 140, 25);

    doc.setDrawColor(200);
    doc.line(14, 35, 196, 35);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("BILL TO:", 14, 45);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`${orderData.customer_name}`, 14, 52);
    doc.text(`+91 ${orderData.phone}`, 14, 57);
    doc.text(`${orderData.address}, ${orderData.city} - ${orderData.pincode}`, 14, 62);

    const tableData = items.map((item, index) => [
      index + 1,
      item.product_name,
      `${item.size} / ${item.color}`,
      item.quantity,
      `INR ${item.price.toLocaleString()}`,
      `INR ${(item.price * item.quantity).toLocaleString()}`
    ]);

    // autoTable(doc, ...) નો ઉપયોગ (Fix for 'not a function' error)
    autoTable(doc, {
      startY: 75,
      head: [['#', 'PRODUCT', 'VARIANT', 'QTY', 'PRICE', 'TOTAL']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [0, 0, 0] },
      styles: { fontSize: 9 },
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`GRAND TOTAL: INR ${orderData.total_amount.toLocaleString()}`, 130, finalY);

    doc.save(`Kaira_Invoice_${orderData.id.slice(0, 8)}.pdf`);
  };

  const handleOrder = async () => {
    if (!formData.name || !formData.phone || !formData.address) {
      alert("Please fill required fields (Name, Phone, Address)");
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert("Please login first.");
        setLoading(false);
        return;
      }

      // ૨. સ્ટોક અપડેટ
      for (const item of cartItems) {
        const productId = item.product_id || item.id;
        const { data: productData } = await supabase.from("products").select("stock").eq("id", productId).single();
        if (productData.stock < item.quantity) throw new Error(`Stock low for ${item.name}`);
        await supabase.from("products").update({ stock: productData.stock - item.quantity }).eq("id", productId);
      }

      // ૩. ઓર્ડર સેવ
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

      const itemsToInsert = cartItems.map((item) => ({
        order_id: orderData.id,
        product_id: item.product_id || item.id,
        product_name: item.name || item.product_name,
        size: item.selected_size || "N/A",
        color: item.selected_color || "N/A",
        quantity: item.quantity,
        price: item.price
      }));

      const { error: itemError } = await supabase.from("order_items").insert(itemsToInsert);
      if (itemError) throw itemError;

      // ૪. ઇનવોઇસ ડાઉનલોડ
      generateInvoicePDF(orderData, itemsToInsert);

      // ૫. Meesho Style Success Popup
      Swal.fire({
        html: `
          <div class="p-2">
            <div class="mb-4">
              <svg class="mx-auto" width="70" height="70" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="12" fill="#00B33E"/>
                <path d="M7 12L10 15L17 8" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <h2 class="text-xl font-bold text-gray-800">Order Placed Successfully!</h2>
            <p class="text-sm text-gray-500 mt-2">Your invoice is downloading...</p>
          </div>
        `,
        confirmButtonText: 'Go to My Orders',
        confirmButtonColor: '#000',
        allowOutsideClick: false
      }).then((result) => {
        if (result.isConfirmed) {
          clearCart();
          router.push("/user-order"); // તમારા પેજ પર રીડાયરેક્ટ
        }
      });

    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f9f9] py-10 px-4 md:px-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-8 uppercase tracking-widest border-b pb-4">Checkout</h1>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Form */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold mb-4">Shipping Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input name="name" placeholder="Full Name" onChange={handleChange} className="w-full border p-3 rounded-xl focus:ring-1 focus:ring-black outline-none" />
                <input name="phone" placeholder="Phone Number" onChange={handleChange} className="w-full border p-3 rounded-xl focus:ring-1 focus:ring-black outline-none" />
                <textarea name="address" placeholder="Full Address" onChange={handleChange} className="w-full border p-3 rounded-xl md:col-span-2 outline-none" />
                <input name="city" placeholder="City" onChange={handleChange} className="w-full border p-3 rounded-xl outline-none" />
                <input name="pincode" placeholder="Pincode" onChange={handleChange} className="w-full border p-3 rounded-xl outline-none" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold mb-4">Payment Method</h3>
              <div className="flex gap-4">
                <button onClick={() => setPaymentMethod("COD")} className={`flex-1 p-4 border-2 rounded-xl font-bold ${paymentMethod === "COD" ? "border-black bg-gray-50" : "border-gray-100"}`}>Cash on Delivery</button>
                <button onClick={() => setPaymentMethod("Online")} className={`flex-1 p-4 border-2 rounded-xl font-bold ${paymentMethod === "Online" ? "border-black bg-gray-50" : "border-gray-100"}`}>Online Payment</button>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-5">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-10">
              <h3 className="font-bold mb-6 italic">Order Summary</h3>
              <div className="divide-y space-y-2 max-h-60 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4 py-3">
                    <img src={item.image || item.image1} className="w-14 h-16 object-cover rounded shadow-sm" alt="" />
                    <div className="flex-1">
                      <p className="text-sm font-bold uppercase">{item.name}</p>
                      <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                      <p className="text-sm font-bold mt-1">₹{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t space-y-2">
                <div className="flex justify-between text-sm text-gray-500"><span>Subtotal</span><span>₹{subtotal.toLocaleString()}</span></div>
                <div className="flex justify-between text-sm text-gray-500"><span>Shipping</span><span>{shippingCharge === 0 ? "FREE" : `₹${shippingCharge}`}</span></div>
                <div className="flex justify-between text-xl font-black pt-4 border-t border-black mt-4"><span>Total</span><span>₹{totalAmount.toLocaleString()}</span></div>
              </div>
              <button onClick={handleOrder} disabled={loading} className="w-full bg-black text-white py-4 rounded-xl mt-8 font-bold hover:opacity-90 transition-all uppercase tracking-widest">
                {loading ? "Placing Order..." : "Confirm Order"}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}