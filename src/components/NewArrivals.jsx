
"use client";

import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";

// Correct Swiper v10+ imports
import { Navigation, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";



export default function NewArrivals() {
  const products = [
    { title: "Dark florish onepiece", img: "/images/colorbox/product-item-1.jpg", price: 95, href: "/" },
    { title: "Baggy Shirt", img: "/images/colorbox/product-item-2.jpg", price: 55, href: "/" },
    { title: "Cotton off-white shirt", img: "/images/colorbox/product-item-3.jpg", price: 65, href: "/" },
    { title: "Crop sweater", img: "/images/colorbox/product-item-4.jpg", price: 50, href: "/" },
    { title: "Crop sweater", img: "/images/colorbox/product-item-10.jpg", price: 70, href: "/" },
  ];

  return (
    <section id="new-arrival" className="new-arrival product-carousel py-5 relative overflow-hidden">
      <div className="container">
        <div className="d-flex flex-wrap justify-between items-center mt-5 mb-3">
          <h4 className="text-uppercase">Our New Arrivals</h4>

          <Link 
    href="/shop?category=JEANS" 
    className="text-blue-600 hover:underline font-medium"
  >
    View All
  </Link>
          {/* <Link href="/" className="btn-link no-underline text-black hover:text-black">
            View All Products
          </Link> */}
        </div>

        <Swiper
          modules={[Navigation, Pagination]}
          spaceBetween={20}
          slidesPerView={3}
          navigation
          pagination={{ clickable: true }}
        >
          {products.map((product, index) => (
            <SwiperSlide key={index}>
              <div className="product-item image-zoom-effect link-effect relative">
                <div className="image-holder relative">
                  {/* Product Image */}
                  <Link href={product.href}>
                    <Image
                      src={product.img}
                      alt={product.title}
                      width={365}
                      height={365}
                      className="product-image img-fluid"
                    />
                  </Link>

                  {/* Product Info */}
                  <div className="product-content mt-2">
                    <h5 className="text-uppercase fs-5 mt-3">
                      <Link
                        href={product.href}
                        className="text-black"
                        style={{ textDecoration: "none" }}
                      >
                        {product.title}
                      </Link>
                    </h5>
                    <span>${product.price.toFixed(2)}</span>
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