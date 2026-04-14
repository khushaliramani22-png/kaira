"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation"; 
import { supabase } from "@/lib/supabase";
import { useCart } from "@/app/context/CartContext";
import { Heart, Eye } from "lucide-react";
import Link from "next/link";
import AOS from "aos";
import "aos/dist/aos.css";

function ShopContent() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");

  useEffect(() => {
    // AOS Initialize કરો
    AOS.init({
      duration: 800,
      once: true,
    });

 
    async function fetchProducts() {
      try {
        setLoading(true);

        let query = supabase.from("products").select(`*, product_reviews (rating)`);


        if (categoryParam) {

          const formattedCategory = categoryParam.toUpperCase().replace(/-/g, ' ');
          query = query.eq("category", formattedCategory);
        }

        const { data, error } = await query;
        if (error) throw error;
        //ratng calculetion
        const productsWithReviews = data.map((product) => {
          const allReviews = product.product_reviews || [];
          const totalReviews = allReviews.length;

          const avgRating = totalReviews > 0
            ? (allReviews.reduce((sum, item) => sum + item.rating, 0) / totalReviews).toFixed(1)
            : null;

          return { ...product, avgRating, totalReviews };
        });

        setProducts(productsWithReviews);
      } catch (error) {
        console.error("Error:", error.message);
      } finally {
        setLoading(false);
      }
    }
 
    fetchProducts();
  }, [categoryParam]);

  if (loading)
    return (
      <div className="p-20 text-center text-sm tracking-widest font-semibold">
        Loading {categoryParam ? categoryParam.replace(/-/g, ' ').toUpperCase() : "Collection"}...
      </div>
    );

  return (
    <div className="max-w-[1300px] mx-auto px-4 py-14">
      {/* Heading - Dynamic title based on category */}

      <h2 data-aos="fade-down"
      className="text-2xl md:text-3xl font-semibold text-center mb-12 tracking-wide uppercase">
        {categoryParam ? categoryParam.replace(/-/g, ' ') : "Our Collection"}
      </h2>

      {/* Grid */}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-6 p-2">
        {products.length > 0 ? (
          products.map((product,index) => (
            <div
              key={product.id}
              data-aos="fade-up"
              data-aos-delay={index * 50}
              className="group bg-white  overflow-hidden border hover:shadow-xl transition duration-300"
            >
              {/* Image Section */}
              <div className="relative aspect-square w-full">

                <Link href={`/shop/${product.id}`}>
                  <img
                    src={product.image1 || "https://via.placeholder.com/500"}
                    alt={product.name}
                    className="w-full h-60 object-cover group-hover:scale-105 transition duration-500"
                  />
                </Link>

                <button className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-sm text-gray-400">
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

              <div className=" flex flex-col gap-1">
                <h3 className="text-[12px] leading-tight font-medium mt-1 text-gray-800 line-clamp-2 sm:text-sm md:text-base">
                  {product.name}
                </h3>

                <div className="flex items-center gap-1">
                  <span className="text-sm md:text-base font-bold text-gray-800">₹{product.price}</span>


                  {product.old_price && Number(product.old_price) > Number(product.price) && (
                    <span className="text-[10px] md:text-xs text-gray-400 line-through">₹{product.oldPrice}</span>
                  )}

                  {product.old_price && (
                    <span className="text-blue-600 text-sm font-medium">
                      {Math.round(((product.old_price - product.price) / product.old_price) * 100)}% OFF
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 mt-1">
                  {product.avgRating ? (
                    <>

                      <span className="bg-green-700 text-white text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                        {product.avgRating} ★
                      </span>

                      <span className="text-[10px] text-gray-400">
                        ({product.totalReviews})
                      </span>
                    </>
                  ) : (
                    <span className="text-[10px] text-gray-400 italic">No reviews yet</span>
                  )}
                </div>


                <p className="text-blue-700 text-[10px] md:text-xs font-medium mt-1 uppercase">
                  NOW AT ₹{Math.round(product.price * 0.9)} WITH EXTRA ₹{Math.round(product.price * 0.1)}
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


export default function ShopPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center">Loading...</div>}>
      <ShopContent />
    </Suspense>
  );
}