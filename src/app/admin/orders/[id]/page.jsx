"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { useParams, useRouter } from "next/navigation";
import {
  Printer,
  ArrowLeft,
  User,
  MapPin,
  Package,
  Smartphone,
} from "lucide-react";

export default function OrderDetail() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  // const fetchOrderDetails = useCallback(async () => {
  //   if (!params?.id) return;

  //   try {
  //     setLoading(true);

  //     // ૧. ઓર્ડર ડેટા મેળવો (URL માં UUID હોય કે Order Number, બંને ચાલશે)
  //     const { data: orderData, error: orderError } = await supabase
  //       .from("orders")
  //       .select("*")
  //       .or(
  //         `id.eq.${params.id},order_number.eq.${!isNaN(params.id) ? parseInt(params.id) : 0}`,
  //       )
  //       .maybeSingle();

  //     if (orderError) throw orderError;

  //     if (orderData) {
  //       setOrder(orderData);

  //       // ૨. ઓર્ડરના સાચા UUID થી items ફેચ કરો
  //       // આ સ્ટેપ તમારી Array(0) વાળી ભૂલને સોલ્વ કરશે
  //       const { data: itemsData, error: itemsError } = await supabase
  //         .from("order_items")
  //         .select("*")
  //         .eq("order_id", orderData.id);

  //       if (itemsError) throw itemsError;

  //       setItems(itemsData || []);
  //       console.log("Success! Items found:", itemsData);
  //     }
  //   } catch (err) {
  //     console.error("Fetch Error:", err.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // }, [params?.id, supabase]);

  const fetchOrderDetails = useCallback(async () => {
  if (!params?.id) return;
  try {
    setLoading(true);
    
    // સાચો રસ્તો: પહેલા ચેક કરો કે ID નંબર છે કે UUID
    let query = supabase.from("orders").select("*");
    if (!isNaN(params.id)) {
      query = query.eq("order_number", parseInt(params.id));
    } else {
      query = query.eq("id", params.id);
    }

    const { data: orderData, error: orderError } = await query.maybeSingle();

    if (orderError) throw orderError;

    if (orderData) {
      setOrder(orderData);
      const { data: itemsData, error: itemsError } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", orderData.id);

      if (itemsError) throw itemsError;
      setItems(itemsData || []);
    }
  } catch (err) {
    console.error("Fetch Error:", err.message);
  } finally {
    setLoading(false);
  }
}, [params?.id, supabase]);

  useEffect(() => {
    fetchOrderDetails();
  }, [fetchOrderDetails]);

  if (loading)
    return (
      <div className="p-20 text-center font-black uppercase text-gray-400 animate-pulse tracking-widest">
        Loading Kaira Invoice...
      </div>
    );
  if (!order)
    return (
      <div className="p-20 text-center font-bold text-red-500 uppercase">
        Order Not Found
      </div>
    );

  return (
    <div className="p-4 md:p-10 max-w-5xl mx-auto bg-white min-h-screen">
      {/* Navigation & Print */}
      <div className="flex justify-between items-center mb-8 no-print">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-400 hover:text-black transition-all"
        >
          <ArrowLeft size={14} /> Back to Dashboard
        </button>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-80 transition-all shadow-lg"
        >
          <Printer size={16} /> Print Invoice
        </button>
      </div>

      <div className="border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
        {/* Header */}
        <div className="bg-gray-50/50 p-8 md:p-12 border-b border-gray-200 flex flex-col md:row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-black italic tracking-tighter text-black uppercase">
              Kaira Fashion
            </h1>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.4em] mt-2 italic">
              Premium Quality Wear
            </p>
          </div>
          <div className="md:text-right">
            <div className="bg-black text-white px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mb-3 inline-block">
              {order.status || "Pending"}
            </div>
            <p className="text-sm font-black text-gray-900 uppercase">
              #KRA-{order.id.slice(0, 6).toUpperCase()}
            </p>
            <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">
              {new Date(order.created_at).toLocaleDateString("en-IN")}
            </p>
          </div>
        </div>

        {/* Customer Details Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 border-b border-gray-200">
          <div className="p-8 border-b md:border-b-0 md:border-r border-gray-200">
            <h3 className="text-[10px] font-black uppercase text-gray-300 tracking-widest mb-6 flex items-center gap-2">
              <User size={12} /> Billing Information
            </h3>
            <div className="space-y-1">
              <p className="text-sm font-black text-gray-900 uppercase">
                {order.customer_name}
              </p>
              <p className="text-xs font-bold text-gray-500">{order.email}</p>
              <p className="text-xs font-black text-gray-900 mt-2 flex items-center gap-1">
                <Smartphone size={10} /> {order.phone}
              </p>
            </div>
          </div>
          <div className="p-8">
            <h3 className="text-[10px] font-black uppercase text-gray-300 tracking-widest mb-6 flex items-center gap-2">
              <MapPin size={12} /> Shipping Address
            </h3>
            <p className="text-xs text-gray-600 font-bold leading-relaxed uppercase">
              {order.address}, {order.city}
              <br />
              {order.state} - {order.pincode}
            </p>
            <p className="text-[10px] font-black text-blue-500 uppercase mt-4 italic">
              Payment: {order.payment_method || "COD"}
            </p>
          </div>
        </div>

        {/* Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 text-[10px] font-black uppercase text-gray-400 border-b border-gray-200">
                <th className="p-6">Product Detail</th>
                <th className="p-6 text-center">Qty</th>
                <th className="p-6 text-right">Unit Price</th>
                <th className="p-6 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.length > 0 ? (
                items.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50/30 transition-colors"
                  >
                    <td className="p-6 flex items-center gap-5">
                      <div className="w-16 h-20 bg-gray-100 rounded-xl overflow-hidden border border-gray-200 flex-shrink-0">
                        <img
                          src={
                            item.image?.startsWith("http")
                              ? item.image
                              : `https://pmuaelfyefdlhiqmspfg.supabase.co/storage/v1/object/public/products/${item.image}`
                          }
                          alt={item.product_name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src =
                              "https://via.placeholder.com/150?text=Kaira";
                          }}
                        />
                      </div>
                      <div>
                        <p className="text-xs font-black text-gray-900 uppercase leading-tight mb-1">
                          {item.product_name}
                        </p>
                        <p className="text-[9px] font-bold text-gray-400 uppercase">
                          Size: {item.size || "N/A"} | Color:{" "}
                          {item.color || "N/A"}
                        </p>
                      </div>
                    </td>
                    <td className="p-6 text-center text-xs font-black text-gray-700">
                      {item.quantity}
                    </td>
                    <td className="p-6 text-right text-xs font-bold text-gray-500">
                      ₹{item.price?.toLocaleString()}
                    </td>
                    <td className="p-6 text-right text-xs font-black text-gray-900 italic">
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="p-20 text-center opacity-30">
                    <Package size={32} className="mx-auto mb-2" />
                    <p className="text-[10px] font-black uppercase tracking-widest">
                      No products found
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Grand Total Section */}
        <div className="p-8 md:p-12 bg-gray-50/50 flex justify-end border-t border-gray-200">
          <div className="w-full md:w-72 space-y-4">
            <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              <span>Subtotal</span>
              <span className="text-gray-900">
                ₹{order.subtotal?.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-[10px] font-bold text-green-600 uppercase tracking-widest">
              <span>Delivery</span>
              <span>FREE</span>
            </div>
            <div className="pt-4 border-t-2 border-dashed border-gray-200 flex justify-between items-center">
              <span className="text-[10px] font-black uppercase text-gray-900">
                Payable Amount
              </span>
              <span className="text-3xl font-black text-black italic tracking-tighter">
                ₹{order.total_amount?.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Footer Branding */}
      <div className="mt-8 text-center no-print">
        <p className="text-[9px] font-bold text-gray-300 uppercase tracking-[0.5em]">
          WebExpert Solutions Admin Panel
        </p>
      </div>

      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            padding: 0;
            background: white;
          }
          .rounded-3xl {
            border-radius: 0 !important;
            border: 1px solid #eee !important;
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
}
