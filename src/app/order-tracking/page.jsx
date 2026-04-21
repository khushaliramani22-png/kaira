"use client";

import React, { useState, useEffect } from 'react';
import { Search, Clock, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function TrackOrder() {
  const [orderIdInput, setOrderIdInput] = useState('');
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, []);

  if (!mounted) return null;

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!user) {
      setError("Please login to track your orders.");
      return;
    }

    setLoading(true);
    setError('');
    setOrderData(null);

    let searchId = orderIdInput.trim();
    if (!searchId.startsWith('#')) {
      searchId = '#' + searchId;
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('orders')
        .select('*')
        .eq('order_number', searchId)
        .eq('user_id', user.id)
        .single();

      if (fetchError || !data) {
        setError("Invalid Order ID. Please check and try again.");
      } else {
        setOrderData(data);
      }
    } catch (err) {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen py-20 px-6 font-sans">
      <div className="max-w-xl mx-auto text-center">
        <h1 className="text-4xl font-light tracking-[0.3em] uppercase mb-4 text-gray-900">Track Order</h1>
        <p className="text-gray-400 text-sm mb-12 uppercase tracking-widest">Kaira Fashion Store</p>
        
        <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-3 mb-16">
          <input 
            type="text" 
            placeholder="Enter Order Number" 
            value={orderIdInput}
            onChange={(e) => setOrderIdInput(e.target.value)}
            className="flex-1 p-3 border-b-2 border-gray-100 focus:border-black outline-none transition-all text-center text-lg tracking-widest"
            required
          />
          <button className="bg-black text-white px-10 py-3 hover:bg-gray-900 transition flex items-center justify-center gap-3 shadow-2xl">
            {loading ? <Clock className="animate-spin" size={20} /> : <Search size={20} />}
            <span className="font-bold text-xs uppercase tracking-widest">Search</span>
          </button>
        </form>

        {error && (
          <div className="flex items-center justify-center gap-2 text-red-500 mb-10 animate-pulse font-medium text-sm italic">
            <AlertCircle size={16} />
            <p>{error}</p>
          </div>
        )}

        {orderData && (
          <div className="bg-gray-50/50 p-10 rounded-none border border-gray-100 text-left animate-in fade-in slide-in-from-bottom-4">
             <div className="flex justify-between items-end mb-12">
                <div>
                  <h2 className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-2">Order Reference</h2>
                  <p className="font-bold text-2xl text-black tracking-tighter">{orderData.order_number}</p>
                </div>
                <div className="text-right">
                  <span className="px-4 py-1 bg-black text-white text-[10px] font-bold uppercase tracking-widest">
                    {orderData.status}
                  </span>
                </div>
             </div>

             {/* Timeline UI */}
             <div className="space-y-12 relative">
                <div className="absolute left-[11px] top-2 bottom-2 w-[1px] bg-gray-200"></div>

                {/* Step 1 */}
                <div className="flex gap-8 relative items-center">
                  <div className="z-10 w-[23px] h-[23px] bg-black border-4 border-white rounded-full"></div>
                  <div>
                    <p className="font-black text-xs uppercase tracking-widest text-black">Order Placed</p>
                    <p className="text-[10px] text-gray-400 mt-1 uppercase">Confirmed</p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex gap-8 relative items-center text-gray-400">
                  <div className={`z-10 w-[23px] h-[23px] border-4 border-white rounded-full ${orderData.status === 'Processing' || orderData.status === 'Delivered' ? 'bg-black' : 'bg-gray-200'}`}></div>
                  <div className={orderData.status === 'Processing' || orderData.status === 'Delivered' ? 'text-black' : ''}>
                    <p className="font-black text-xs uppercase tracking-widest">Processing</p>
                    <p className="text-[10px] mt-1 uppercase italic">In Quality Check</p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex gap-8 relative items-center text-gray-400">
                   <div className={`z-10 w-[23px] h-[23px] border-4 border-white rounded-full ${orderData.status === 'Delivered' ? 'bg-black' : 'bg-gray-200'}`}></div>
                   <div className={orderData.status === 'Delivered' ? 'text-black' : ''}>
                    <p className="font-black text-xs uppercase tracking-widest">Delivered</p>
                    <p className="text-[10px] mt-1 uppercase">At your doorstep</p>
                  </div>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}