// "use client";

// import Image from "next/image";
// import Link from "next/link";
// import { Swiper, SwiperSlide } from "swiper/react";
// import { Navigation, Pagination } from "swiper/modules";
// import "swiper/css";
// import "swiper/css/navigation";
// import "swiper/css/pagination";

// export default function BestSellers() {
//   const products = [
//     { title: "Dark florish onepiece", img: "/images/colorbox/product-item-4.jpg", price: 95, href: "/" },
//     { title: "Baggy Shirt", img: "/images/colorbox/product-item-3.jpg", price: 55, href: "/" },
//     { title: "Cotton off-white shirt", img: "/images/colorbox/product-item-5.jpg", price: 65, href: "/" },
//     { title: "Handmade crop sweater", img: "/images/colorbox/product-item-6.jpg", price: 50, href: "/" },
//     { title: "Dark florish onepiece", img: "/images/colorbox/product-item-9.jpg", price: 70, href: "/" },
//     { title: "Cotton off-white shirt", img: "/images/colorbox/product-item-10.jpg", price: 70, href: "/" },
//   ];

//   return (
//     <section id="best-sellers" className="best-sellers product-carousel py-5 relative overflow-hidden">
//       <div className="container">
//         <div className="flex flex-wrap justify-between items-center mt-5 mb-3">
//           <h4 className="text-uppercase">Best Selling Items</h4>
//           <Link href="/" className="btn-link no-underline text-black hover:text-black">
//             View All Products
//           </Link>
//         </div>

//         <Swiper
//           modules={[Navigation, Pagination]}
//           spaceBetween={20}
//           slidesPerView={3}
//           navigation
//           pagination={{ clickable: true }}
//         >
//           {products.map((product, index) => (
//             <SwiperSlide key={index}>
//               <div className="product-item image-zoom-effect link-effect relative">
//                 <div className="image-holder relative">
//                   {/* Product Image */}
//                   <Link href={product.href}>
//                     <Image
//                       src={product.img}
//                       alt={product.title}
//                       width={365}
//                       height={365}
//                       className="product-image img-fluid"
//                     />
//                   </Link>

//                   {/* Wishlist Icon
//                   <Link href={product.href} className="btn-icon btn-wishlist absolute top-2 right-2">
//                     <svg width="24" height="24" viewBox="C5.4 15.36 2 12.28 2 8.5" fill="none">
//                       <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.8 4.5 2.09C13.09 3.8 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
//                     </svg>
//                   </Link> */}

//                   {/* Product Content */}
//                   <div className="product-content mt-2">
//                     <h5 className="text-uppercase fs-5 mt-3">
//                       <Link
//                         href={product.href}
//                         className="text-black"
//                         style={{ textDecoration: "none" }}
//                       >
//                         {product.title}
//                       </Link>
//                     </h5>
//                     <span>${product.price.toFixed(2)}</span>
//                   </div>
//                 </div>
//               </div>
//             </SwiperSlide>
//           ))}
//         </Swiper>
//       </div>
//     </section>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";

// Swiper CSS (તમારી ડિઝાઈન માટે જરૂરી)
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function BestSellers() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        setLoading(true);
        // એડમિન પેનલમાંથી લેટેસ્ટ 8 પ્રોડક્ટ્સ ખેંચવા માટે
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("category", "BESTSELLER")
          .order("created_at", { ascending: false })
          .limit(8);

        if (error) throw error;
        setProducts(data || []);
      } catch (err) {
        console.error("Error:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBestSellers();
  }, []);

  if (loading) return null;

  return (
    <section id="best-sellers" className="best-sellers product-carousel py-5 relative overflow-hidden">
      <div className="container">
        {/* તમારી ઓરિજિનલ હેડિંગ ડિઝાઈન */}
        <div className="flex flex-wrap justify-between items-center mt-5 mb-3">
          <h4 className="text-uppercase">Best Selling Items</h4>
          <Link href="/shop" className="btn-link no-underline text-black hover:text-black">
            View All Products
          </Link>
        </div>

        <Swiper
          modules={[Navigation, Pagination]}
          spaceBetween={20}
          slidesPerView={3} // તમારી મૂળ સ્લાઈડ સંખ્યા
          navigation
          pagination={{ clickable: true }}
          breakpoints={{
            320: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 }
          }}
        >
          {products.map((product) => (
            <SwiperSlide key={product.id}>
              {/* તમારી ઓરિજિનલ પ્રોડક્ટ આઈટમ ડિઝાઈન */}
              <div className="product-item image-zoom-effect link-effect relative">
                <div className="image-holder relative">
                  <Link href={`/shop/${product.id}`}>
                    <img
                      src={product.image1} 
                      alt={product.name}
                      width={365}
                      height={365}
                      className="product-image img-fluid"
                      style={{ objectFit: 'cover', height: '365px', width: '100%' }}
                    />
                  </Link>

                  {/* તમારી ઓરિજિનલ કન્ટેન્ટ ડિઝાઈન */}
                  <div className="product-content mt-2">
                    <h5 className="text-uppercase fs-5 mt-3">
                      <Link
                        href={`/shop/${product.id}`}
                        className="text-black"
                        style={{ textDecoration: "none" }}
                      >
                        {product.name}
                      </Link>
                    </h5>
                    {/* પ્રાઈસ ડિસ્પ્લે */}
                    <span className="fw-bold">₹{product.price}</span>
                    {product.old_price && (
                      <span className="text-muted text-decoration-line-through ms-2 small">
                        ₹{product.old_price}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}