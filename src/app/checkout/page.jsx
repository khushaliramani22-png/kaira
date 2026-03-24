"use client";

import { useState } from "react";
import { useCart } from "@/app/context/CartContext";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
// ૧. PDF લાઇબ્રેરી ઇમ્પોર્ટ કરો
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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

  // ૨. Invoice PDF જનરેટ કરવાનું ફંક્શન
  const generateInvoicePDF = (orderData, items) => {
    const doc = new jsPDF();

    // બ્રાન્ડ હેડર (Luxury Look)
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("KAIRA", 14, 20);
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Premium Clothing Brand", 14, 25);
    doc.text("Surat, Gujarat, India", 14, 30);
    
    // ઇનવોઇસ વિગતો (જમણી બાજુ)
    doc.setFontSize(10);
    doc.text(`INVOICE NO: #KRA-${orderData.id.slice(0, 8).toUpperCase()}`, 140, 20);
    doc.text(`DATE: ${new Date().toLocaleDateString("en-IN")}`, 140, 25);
    doc.text(`PAYMENT: ${orderData.payment_method}`, 140, 30);

    // કસ્ટમર ડિટેલ્સ
    doc.setDrawColor(200);
    doc.line(14, 35, 196, 35); // લાઈન
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("BILL TO:", 14, 45);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Name: ${orderData.customer_name}`, 14, 52);
    doc.text(`Phone: +91 ${orderData.phone}`, 14, 57);
    doc.text(`Address: ${orderData.address}, ${orderData.city} - ${orderData.pincode}`, 14, 62);

    // આઈટમ્સ ટેબલ
    const tableData = items.map((item, index) => [
      index + 1,
      item.product_name,
      `${item.size} / ${item.color}`,
      item.quantity,
      `INR ${item.price.toLocaleString()}`,
      `INR ${(item.price * item.quantity).toLocaleString()}`
    ]);

    autoTable(doc, {
  startY: 75,
  head: [['#', 'PRODUCT', 'VARIANT', 'QTY', 'PRICE', 'TOTAL']],
  body: tableData,
  theme: 'grid',
  headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255], fontStyle: 'bold' },
  styles: { fontSize: 9 },
});

    // ટોટલ સેક્શન (ટેબલ પૂરો થયા પછી)
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.text(`Subtotal:`, 140, finalY);
    doc.text(`INR ${orderData.subtotal.toLocaleString()}`, 175, finalY);
    
    doc.text(`Shipping:`, 140, finalY + 7);
    doc.text(`INR ${orderData.shipping_charge.toLocaleString()}`, 175, finalY + 7);
    
    doc.setDrawColor(0);
    doc.line(140, finalY + 10, 196, finalY + 10);
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`GRAND TOTAL:`, 140, finalY + 17);
    doc.text(`INR ${orderData.total_amount.toLocaleString()}`, 175, finalY + 17);

    // ફૂટર
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.text("Thank you for choosing Kaira. For returns, visit kaira.com/returns", 14, finalY + 35);

    // PDF સેવ કરો
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
        alert("Please login to place an order.");
        setLoading(false);
        return;
      }

      // ૧. સ્ટોક ચેક કરો
      for (const item of cartItems) {
        const productId = item.product_id || item.id;
        const { data: productData, error: productError } = await supabase
          .from("products")
          .select("stock")
          .eq("id", productId)
          .single();

        if (productError || !productData || productData.stock < item.quantity) {
          throw new Error(`Product ${item.name} is out of stock!`);
        }

        await supabase.from("products").update({ stock: productData.stock - item.quantity }).eq("id", productId);
      }

      // ૨. ઓર્ડર ટેબલમાં એન્ટ્રી
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

      // ૩. ઓર્ડર આઈટમ્સ મેપિંગ
      const itemsToInsert = cartItems.map((item) => {
        let finalSize = item.selected_size || item.selectedSize || item.size || "N/A";
        let finalColor = item.selected_color || item.selectedColor || item.color || "N/A";

        return {
          order_id: orderData.id,
          product_id: item.product_id || item.id,
          product_name: item.name || item.product_name,
          image: item.image || item.image1 || "",
          size: finalSize,
          color: finalColor,
          quantity: item.quantity,
          price: item.price
        };
      });

      const { error: itemError } = await supabase.from("order_items").insert(itemsToInsert);
      if (itemError) throw itemError;

      // ૪. ઇનવોઇસ જનરેટ કરો
      generateInvoicePDF(orderData, itemsToInsert);

      alert("Order placed successfully! Your invoice is downloading...");
      clearCart();
      router.push("/order-success");

    } catch (error) {
      console.error("Order error:", error.message);
      alert(error.message || "Order failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f8f8] py-10 px-4 md:px-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 border-b pb-4 uppercase tracking-tighter">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 italic">
                <span className="bg-black text-white w-6 h-6 rounded-full flex items-center justify-center text-xs not-italic">1</span>
                Shipping Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-gray-400 mb-1 block uppercase">Full Name *</label>
                  <input name="name" placeholder="Enter your name" onChange={handleChange} className="w-full border p-3 rounded-xl outline-none focus:ring-1 focus:ring-black font-medium" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 mb-1 block uppercase">Phone Number *</label>
                  <input name="phone" placeholder="10-digit number" onChange={handleChange} className="w-full border p-3 rounded-xl outline-none focus:ring-1 focus:ring-black font-medium" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 mb-1 block uppercase">Email Address</label>
                  <input name="email" placeholder="email@example.com" onChange={handleChange} className="w-full border p-3 rounded-xl outline-none focus:ring-1 focus:ring-black font-medium" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-gray-400 mb-1 block uppercase">Full Address *</label>
                  <textarea name="address" rows="3" placeholder="House No, Street, Landmark" onChange={handleChange} className="w-full border p-3 rounded-xl outline-none focus:ring-1 focus:ring-black font-medium" />
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-400 mb-1 block uppercase">City</label>
                    <input name="city" placeholder="City" onChange={handleChange} className="w-full border p-3 rounded-xl outline-none focus:ring-1 focus:ring-black font-medium" />
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-400 mb-1 block uppercase">Pincode</label>
                    <input name="pincode" placeholder="6-digit Pincode" onChange={handleChange} className="w-full border p-3 rounded-xl outline-none focus:ring-1 focus:ring-black font-medium" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 italic">
                <span className="bg-black text-white w-6 h-6 rounded-full flex items-center justify-center text-xs not-italic">2</span>
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
              <h2 className="text-lg font-semibold mb-6 italic">Order Summary</h2>
              <div className="divide-y max-h-80 overflow-y-auto pr-2">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4 py-4">
                    <img src={item.image || item.image1} alt="" className="w-16 h-20 object-cover rounded-lg border" />
                    <div className="flex-1">
                      <p className="font-bold text-sm uppercase">{item.name}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Qty: {item.quantity}</p>
                      <p className="font-bold text-sm mt-1 text-black">₹{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t space-y-2">
                <div className="flex justify-between text-gray-500 font-medium text-sm">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-500 font-medium text-sm">
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
                className="w-full bg-black text-white py-4 rounded-xl mt-8 font-black uppercase tracking-[0.1em] hover:bg-gray-800 transition-all disabled:bg-gray-400"
              >
                {loading ? "Processing..." : `Confirm Order`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}