"use client";
import { useState } from 'react';
import { supabase } from "@/lib/supabase";

const CouponSystem = ({ cartTotal, onApplyDiscount, userEmail }) => {
  const [couponCode, setCouponCode] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handleApplyCoupon = async () => {

    if (!couponCode) {
      setMessage({ type: 'error', text: 'Please enter a coupon code.' });
      return;
    }

    if (!userEmail) {
      setMessage({ type: 'error', text: 'Please enter your email first to apply coupon.' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {

      const { data: coupon, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode.toUpperCase())
        .eq('is_active', true)
        .single();

      if (error || !coupon) {
        setMessage({ type: 'error', text: 'Invalid or expired coupon code.' });
        onApplyDiscount(0);
        return;
      }

if (coupon.is_first_order_only === true) {
 const { data: existingOrders, error: orderError } = await supabase
    .from('orders')
    .select('id')
    .eq('email', userEmail) 
    .limit(1);

  if (orderError) {
    console.error("Database Error:", orderError.message);
    return;
  }
  if (existingOrders && existingOrders.length > 0) {
    setMessage({ type: 'error', text: 'This coupon is valid only for your first order.' });
    onApplyDiscount(0);
    return;
  }
}

      const expiryDate = new Date(coupon.expiry_date);
      const today = new Date();
      if (expiryDate < today.setHours(0,0,0,0)) {
        setMessage({ type: 'error', text: 'This coupon has expired.' });
        onApplyDiscount(0);
        return;
      }

      if (cartTotal < coupon.min_cart_amount) {
        setMessage({ 
          type: 'error', 
          text: `Minimum purchase of ₹${coupon.min_cart_amount} required.` 
        });
        onApplyDiscount(0);
        return;
      }

      let discountAmount = 0;
      if (coupon.discount_type === 'percentage') {
        discountAmount = (cartTotal * coupon.discount_value) / 100;
      } else {
        discountAmount = coupon.discount_value;
      }

      setMessage({ type: 'success', text: `Success! You saved ₹${discountAmount.toLocaleString()}.` });
      onApplyDiscount(discountAmount);

    } catch (err) {
      console.error("Coupon Error:", err);
      setMessage({ type: 'error', text: 'Something went wrong. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-2xl bg-white shadow-sm mb-4">
      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-3 text-gray-400">Apply Coupon</h3>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="ENTER CODE"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value)}
          className="border border-gray-100 p-3 rounded-xl w-full uppercase text-xs focus:border-black outline-none transition-all bg-gray-50"
        />
        <button
          onClick={handleApplyCoupon}
          disabled={loading}
          className="bg-black text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 disabled:bg-gray-300 transition-all"
        >
          {loading ? '...' : 'APPLY'}
        </button>
      </div>
      
      {message.text && (
        <p className={`mt-3 text-[10px] font-bold uppercase tracking-tight ${message.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
          {message.text}
        </p>
      )}
    </div>
  );
};

export default CouponSystem;