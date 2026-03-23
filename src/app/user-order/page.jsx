"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function UserOrderPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchUserOrders();
  }, []);

  const fetchUserOrders = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`*, order_items (*)`)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;
      setOrders(ordersData || []);
    } catch (error) {
      console.error('Error fetching orders:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-700"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 min-h-screen bg-gray-50">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">My Orders</h1>

      <div className="space-y-6">
        {orders.length > 0 ? (
          orders.map((order, index) => (
            <div key={order.id} className="border rounded-lg p-5 shadow-sm bg-white overflow-hidden">
              
              {/* --- ORDER HEADER --- */}
              <div className="flex flex-wrap justify-between items-center border-b pb-4 mb-4 gap-4">
                <div className="flex gap-8">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Order Placed</p>
                    <p className="text-sm font-medium text-gray-700">{formatDate(order.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Order No.</p>
                    <p className="text-sm font-bold text-gray-900">
                      #{String(orders.length - index).padStart(3, '0')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Total Amount</p>
                    <p className="font-bold text-lg text-gray-900">₹{order.total_amount.toLocaleString()}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                    order.status === 'delivered' ? 'bg-green-100 text-green-700' : 
                    order.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>

              {/* --- ORDER ITEMS LIST --- */}
              <div className="divide-y divide-gray-100">
                {order.order_items?.map((item) => (
                  <div key={item.id} className="flex gap-5 py-4 items-center">
                    {/* Image Section */}
                    <div className="h-24 w-20 bg-gray-50 rounded border flex-shrink-0 overflow-hidden">
                      {item.image ? (
                        <img 
                          src={item.image} 
                          alt={item.product_name} 
                        style={{ width: '80px', height: '80px', cursor: 'pointer', objectFit: 'cover' }}
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-[10px] text-gray-300">No Image</div>
                      )}
                    </div>

                    {/* Details Section */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <h6 className="font-semibold text-gray-900 text-[15px] mb-1 truncate">
                            {item.product_name}
                          </h6>
                          <p className="text-xs text-gray-500">
                            Qty: <span className="text-gray-800 font-medium">{item.quantity}</span> | 
                            Size: <span className="text-gray-800 font-medium">{item.size || 'N/A'}</span> | 
                            Color: <span className="text-gray-800 font-medium">{item.color || 'N/A'}</span>
                          </p>
                        </div>
                        <div className="text-right ml-4">
                          <p className="font-bold text-gray-900 text-[15px]">
                            ₹{item.price.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-white rounded-lg border border-dashed">
            <p className="text-gray-500">No orders found.</p>
          </div>
        )}
      </div>
    </div>
  );
}