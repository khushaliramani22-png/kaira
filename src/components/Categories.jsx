// "use client";

// import Image from "next/image";
// import Link from "next/link";

// export default function Categories() {
//   const categories = [
//     {
//       title: "Shop for men",
//       img: "/images/colorbox/cat-item1.jpg",
//       href: "/",
//     },
//     {
//       title: "Shop for women",
//       img: "/images/colorbox/cat-item2.jpg",
//       href: "/",
//     },
//     {
//       title: "Shop accessories",
//       img: "/images/colorbox/cat-item3.jpg",
//       href: "/",
//     },
//   ];

//   return (
//     <section className="categories overflow-hidden">
//       <div className="container">
//         <div className="open-up" data-aos="zoom-out">
//           <div className="row">
//             {categories.map((cat, index) => (
//               <div className="col-md-4" key={index}>
//                 <div className="cat-item image-zoom-effect">
//                   <div className="image-holder">
//                     <Link href={cat.href}>
//                       <Image
//                         src={cat.img}
//                         alt={cat.title}
//                         className="product-image img-fluid"
//                         width={500}
//                         height={500}
//                       />
//                     </Link>
//                   </div>
//                   <div className="category-content">
//                     <div className="product-button">
//                       <Link href={cat.href} className="btn btn-common text-uppercase">
//                         {cat.title}
//                       </Link>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";

// Swiper CSS
import "swiper/css";
import "swiper/css/navigation";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("products")
          .select("category, image1");

        if (error) throw error;

        const uniqueCategories = [];
        const seenCategories = new Set();

        data.forEach((item) => {
          if (item.category && !seenCategories.has(item.category)) {
            seenCategories.add(item.category);
            uniqueCategories.push({
              title: item.category,
              img: item.image1,
              href: `/shop?category=${encodeURIComponent(item.category)}`,
            });
          }
        });

        setCategories(uniqueCategories);
      } catch (err) {
        console.error("Error:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading || categories.length === 0) return null;

  return (
    <section className="categories overflow-hidden py-5">
      <div className="container">
        <div className="open-up" data-aos="zoom-out">
          {/* Swiper Slider - તમારી જૂની ડિઝાઈન મુજબ */}
          <Swiper
            modules={[Navigation]}
            navigation={true}
            spaceBetween={20}
            slidesPerView={3}
            breakpoints={{
              0: { slidesPerView: 1 },
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            className="category-slider"
          >
            {categories.map((cat, index) => (
              <SwiperSlide key={index}>
                {/* અહીં તમારી ઓરિજિનલ ડિઝાઈન અને ક્લાસ છે */}
                <div className="cat-item image-zoom-effect">
                  <div className="image-holder">
                    <Link href={cat.href}>
                      <img
                        src={cat.img}
                        alt={cat.title}
                        className="product-image img-fluid"
                        width={500}
                        height={500}
                        style={{ objectFit: "cover", height: "500px", width: "100%" }}
                      />
                    </Link>
                  </div>
                  <div className="category-content">
                    <div className="product-button">
                      <Link href={cat.href} className="btn btn-common text-uppercase">
                        Shop {cat.title}
                      </Link>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>

      {/* ફક્ત એરો માટે થોડી CSS */}
      <style jsx global>{`
        .category-slider .swiper-button-next,
        .category-slider .swiper-button-prev {
          color: #000 !important; /* એરોનો કલર કાળો કરવા માટે */
        }
        .category-slider .swiper-button-next:after,
        .category-slider .swiper-button-prev:after {
          font-size: 20px;
          font-weight: bold;
        }
      `}</style>
    </section>
  );
}