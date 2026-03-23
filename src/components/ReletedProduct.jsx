// components/RelatedProducts.jsx
"use client"; // if using Next.js 13+ app directory

import React from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination } from "swiper/modules";

const products = [
  {
    id: 1,
    name: "Dark florish onepiece",
    price: "$95.00",
    image: "/images/colorbox/product-item-5.jpg",
    link: "/",
  },
  {
    id: 2,
    name: "Baggy Shirt",
    price: "$55.00",
    image: "/images/colorbox/product-item-6.jpg",
    link: "/",
  },
  {
    id: 3,
    name: "Cotton off-white shirt",
    price: "$65.00",
    image: "/images/colorbox/product-item-7.jpg",
    link: "/",
  },
  {
    id: 4,
    name: "Handmade crop sweater",
    price: "$50.00",
    image: "/images/colorbox/product-item-8.jpg",
    link: "/",
  },
  {
    id: 5,
    name: "Handmade crop sweater",
    price: "$70.00",
    image: "/images/colorbox/product-item-1.jpg",
    link: "/",
  },
];

const RelatedProducts = () => {
  return (
    <section id="related-products" className="related-products product-carousel py-5 position-relative overflow-hidden">
      <div className="container">
        <div className="d-flex flex-wrap justify-content-between align-items-center mt-5 mb-3">
          <h4 className="text-uppercase">You May Also Like</h4>
          <a href="/" className="btn-link">View All Products</a>
        </div>

        <Swiper
          modules={[Navigation, Pagination]}
          navigation
          pagination={{ clickable: true }}
          spaceBetween={10}
          slidesPerView={3}
          breakpoints={{
            0: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            992: { slidesPerView: 3 },
          }}
        >
          {products.map((product) => (
            <SwiperSlide key={product.id}>
              <div className="product-item image-zoom-effect link-effect">
                <div className="image-holder">
                  <a href={product.link}>
                    <Image
                      src={product.image}
                      alt={product.name}
                      className="product-image img-fluid"
                      width={365}
                      height={400}
                    />
                  </a>
                  {/* <a href="/" className="btn-icon btn-wishlist">
                    <svg width="24" height="24" viewBox="0 0 24 24">
                      <use xlinkHref="#heart"></use>
                    </svg>
                  </a> */}
                  <div className="product-content">
                    <h5 className="text-uppercase fs-5 mt-3">
                      <a href={product.link}
                      className="text-black"
                        style={{ textDecoration: "none" }}>{product.name}</a>
                     
                    </h5>
                    <a href={product.link} className="text-decoration-none" data-after="Add to cart">
                      <span>{product.price}</span>
                    </a>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default RelatedProducts;