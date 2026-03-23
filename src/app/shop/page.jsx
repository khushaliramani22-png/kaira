"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation"; // URL Parameters વાંચવા માટે
import { supabase } from "@/lib/supabase";
import { useCart } from "@/app/context/CartContext";
import { ShoppingBag, Heart, Eye } from "lucide-react";
import Link from "next/link";

function ShopContent() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  
  // URL માંથી 'category' મેળવો
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        let query = supabase.from("products").select("*");

        // જો URL માં કેટેગરી હોય, તો તેને ફિલ્ટર કરો
        if (categoryParam) {
          // URL ના 'jeans' ને DB ના 'JEANS' સાથે મેચ કરવા માટે ફોર્મેટિંગ
          const formattedCategory = categoryParam.toUpperCase().replace(/-/g, ' ');
          query = query.eq("category", formattedCategory);
        }

        const { data, error } = await query;
        if (error) throw error;
        setProducts(data || []);
      } catch (error) {
        console.error("Error:", error.message);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [categoryParam]); // જ્યારે પણ કેટેગરી બદલાય ત્યારે આ ફરીથી રન થશે

  if (loading)
    return (
      <div className="p-20 text-center text-sm tracking-widest font-semibold">
        Loading {categoryParam ? categoryParam.replace(/-/g, ' ').toUpperCase() : "Collection"}...
      </div>
    );

  return (
    <div className="max-w-[1300px] mx-auto px-4 py-14">
      {/* Heading - Dynamic title based on category */}
      <h2 className="text-2xl md:text-3xl font-semibold text-center mb-12 tracking-wide uppercase">
        {categoryParam ? categoryParam.replace(/-/g, ' ') : "Our Collection"}
      </h2>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {products.length > 0 ? (
          products.map((product) => (
            <div
              key={product.id}
              className="group bg-white rounded-xl overflow-hidden border hover:shadow-xl transition duration-300"
            >
              {/* Image Section */}
              <div className="relative overflow-hidden">
                <Link href={`/shop/${product.id}`}>
                  <img
                    src={product.image1 || "https://via.placeholder.com/500"}
                    alt={product.name}
                    className="w-full h-60 object-cover group-hover:scale-105 transition duration-500"
                  />
                </Link>

                <button className="absolute top-3 left-3 bg-white p-2 rounded-full shadow hover:text-red-500">
                  <Heart size={16} />
                </button>

                <Link
                  href={`/shop/${product.id}`}
                  className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition"
                >
                  <Eye size={20} className="text-white" />
                </Link>
              </div>

              {/* Info Section */}
              <div className="p-4 text-center">
                <h3 className="text-sm font-medium text-gray-800 line-clamp-1">
                  {product.name}
                </h3>

                <div className="flex items-center justify-center gap-2 mt-1">
                  <span className="text-base font-semibold">₹{product.price}</span>

                  {product.old_price && Number(product.old_price) > Number(product.price) && (
                    <span className="text-red-500 line-through text-sm">₹{product.old_price}</span>
                  )}

                  {product.old_price && (
                    <span className="text-blue-600 text-sm font-medium">
                      {Math.round(((product.old_price - product.price) / product.old_price) * 100)}% OFF
                    </span>
                  )}
                </div>
                <p className="text-blue-700 text-[10px] md:text-xs font-medium mt-1 uppercase">
                  NOW AT ₹{Math.round(product.price * 0.9)} WITH EXTRA10
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center text-gray-400">
            No products found in this category.
          </div>
        )}
      </div>
    </div>
  );
}

// Next.js માં searchParams વાપરવા માટે Suspense ફરજિયાત છે
export default function ShopPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center">Loading...</div>}>
      <ShopContent />
    </Suspense>
  );
}