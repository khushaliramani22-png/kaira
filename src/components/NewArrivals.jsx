"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";


import { supabase } from "@/lib/supabase"; 

// Swiper CSS
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function NewArrivals() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        const { data, error } = await supabase
          .from('products') 
          .select('*')
          .eq('category', 'NEW ARRIVALS')
          .order('created_at', { ascending: false }) 
          .limit(8); 

        if (error) throw error;
        if (data) setProducts(data);
      } catch (error) {
        console.error("Error fetching arrivals:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNewArrivals();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <section id="new-arrival" className="py-12 bg-white">
      <div className="container mx-auto px-4">
        {/* Title Section */}
        <div className="flex justify-between items-end mb-8 border-b border-gray-100 pb-4">
          <div>
            <span className="text-blue-600 font-bold text-sm uppercase tracking-widest">Fresh Collection</span>
            <h2 className="text-3xl font-bold text-gray-900 mt-1 uppercase">Our New Arrivals</h2>
          </div>
          <Link 
            href="/shop" 
            className="text-gray-900 font-semibold border-b-2 border-black hover:text-blue-600 hover:border-blue-600 transition-all pb-1"
          >
            Shop All
          </Link>
        </div>

        {/* Swiper Slider */}
        {products.length === 0 ? (
          <div className="text-center py-20 text-gray-400">Coming Soon New Collection...</div>
        ) : (
          <Swiper
            modules={[Navigation, Pagination]}
            spaceBetween={25}
            slidesPerView={1}
            navigation
            pagination={{ clickable: true, dynamicBullets: true }}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
              1280: { slidesPerView: 4 },
            }}
            className="pb-12"
          >
            {products.map((product) => (
              <SwiperSlide key={product.id}>
              
                <div className="group relative">

                  <div className="relative aspect-[3/4] overflow-hidden  bg-gray-100 shadow-sm">
             
                    <Link href={`/shop/${product.id}`} className="relative w-full h-full block">
                      <Image
                        src={product.image1 || "/images/placeholder.jpg"}
                        
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, 25vw"
                      />
                    </Link>
                    {/* New Badge */}
                    <div className="absolute top-4 left-4 bg-white px-3 py-1 rounded-full shadow-sm">
                      <span className="text-[10px] font-bold text-blue-600 uppercase">New</span>
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="mt-4 text-center">
                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-tight truncate px-2">
                      <Link href={`/product/${product.id}`} className="hover:text-blue-600 transition-colors">
                        {product.name}
                      </Link>
                    </h3>
                    <div className="flex justify-center items-center gap-2 mt-1">
                      <span className="text-lg font-black text-gray-900">₹{product.price}</span>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>
    </section>
  );
}