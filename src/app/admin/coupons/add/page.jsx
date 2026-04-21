

"use client";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function AddCouponPage() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  

  const [formData, setFormData] = useState({
    code: "",
    discount_type: "fixed",
    discount_value: "",
    min_cart_amount: "",
    expiry_date: "",
    is_first_order_only: false,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from("coupons").insert([
      {
        code: formData.code.toUpperCase(),
        discount_type: formData.discount_type,
        discount_value: parseFloat(formData.discount_value) || 0,
        min_cart_amount: parseFloat(formData.min_cart_amount) || 0,
        expiry_date: formData.expiry_date,
        is_first_order_only: formData.is_first_order_only,
        is_active: true,
      },
    ]);

    if (error) {
      alert("Error adding coupon: " + error.message);
    } else {
      alert("Coupon created successfully!");
      router.push("/admin/coupons");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm border">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Add New Coupon</h2>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Coupon Code */}
        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Coupon Code</label>
          <input
            type="text"
            className="w-full border border-gray-200 p-3 rounded-xl uppercase focus:border-black outline-none transition-all bg-gray-50"
            placeholder="E.G. SUMMER50"
            value={formData.code || ""}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Discount Type */}
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Type</label>
            <select 
              className="w-full border border-gray-200 p-3 rounded-xl focus:border-black outline-none bg-gray-50"
              value={formData.discount_type || "fixed"}
              onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
            >
              <option value="fixed">Fixed Amount (₹)</option>
              <option value="percentage">Percentage (%)</option>
            </select>
          </div>

          {/* Discount Value */}
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Value</label>
            <input
              type="number"
              className="w-full border border-gray-200 p-3 rounded-xl focus:border-black outline-none bg-gray-50"
              value={formData.discount_value || ""}
              onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
              required
            />
          </div>
        </div>

        {/* First Order Checkbox */}
        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
          <input 
            type="checkbox" 
            id="firstOrder"
            className="w-5 h-5 accent-black"
            checked={formData.is_first_order_only}
            onChange={(e) => setFormData({ ...formData, is_first_order_only: e.target.checked })}
          />
          <label htmlFor="firstOrder" className="text-sm font-bold text-blue-700 cursor-pointer">
            Valid for First Order Only?
          </label>
        </div>

        {/* Min Purchase Amount */}
        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Min. Purchase Amount</label>
          <input
            type="number"
            className="w-full border border-gray-200 p-3 rounded-xl focus:border-black outline-none bg-gray-50"
            value={formData.min_cart_amount || ""}
            onChange={(e) => setFormData({ ...formData, min_cart_amount: e.target.value })}
            required
          />
        </div>

        {/* Expiry Date */}
        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Expiry Date</label>
          <input
            type="date"
            className="w-full border border-gray-200 p-3 rounded-xl focus:border-black outline-none bg-gray-50"
            value={formData.expiry_date || ""}
            onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
            required
          />
        </div>

        {/* Submit Button */}
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-black text-white py-4 rounded-xl font-black uppercase tracking-[0.2em] hover:bg-gray-800 disabled:bg-gray-300 transition-all mt-4"
        >
          {loading ? "CREATING..." : "CREATE COUPON"}
        </button>
      </form>
    </div>
  );
}