"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminWishlist() {
  const [stats, setStats] = useState([]);

  useEffect(() => {
    const getStats = async () => {
      const { data } = await supabase.from('wishlist').select('product_id, products(name, image1)');
      
      // પ્રોડક્ટ વાઇઝ કાઉન્ટ કરવાનું લોજિક
      const counts = data.reduce((acc, item) => {
        const id = item.product_id;
        if (!acc[id]) {
          acc[id] = { name: item.products.name, count: 0, image: item.products.image1 };
        }
        acc[id].count++;
        return acc;
      }, {});

      setStats(Object.values(counts).sort((a, b) => b.count - a.count));
    };
    getStats();
  }, []);

  return (
    <div className="p-4">
      <h3>Wishlist Insights 📊</h3>
      <table className="table mt-4">
        <thead>
          <tr>
            <th>Product</th>
            <th>Name</th>
            <th>Total Wishlists</th>
          </tr>
        </thead>
        <tbody>
          {stats.map((item, index) => (
            <tr key={index}>
              <td><img src={item.image} width="50" /></td>
              <td>{item.name}</td>
              <td><span className="badge bg-primary">{item.count} Users</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}