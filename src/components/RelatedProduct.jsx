"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link"; 
import { supabase } from "@/lib/supabase";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination } from "swiper/modules";


const RelatedProducts = ({ currentCategory = null, currentProductId = null }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        let query = supabase.from("products").select("*").limit(8);
        if (currentCategory) {
          query = query.eq("category", currentCategory);
        }
        if (currentProductId) {
          query = query.not("id", "eq", currentProductId);
        }
        const { data, error } = await query;
        if (error) throw error;
        setProducts(data || []);
      } catch (err) {
        console.error("Error fetching products:", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [currentCategory, currentProductId]);
  if (loading || products.length === 0) return null;
  return (
    <section id="related-products" className="related-products product-carousel py-5 position-relative overflow-hidden">
      <div className="container">
        <div className="d-flex flex-wrap justify-content-between align-items-center mt-5 mb-3">
          <h4 className="text-uppercase">
            {currentCategory ? "You May Also Like" : "You May Also Like"}
          </h4>
          <Link href="/shop" className="btn-link">View All Products</Link>
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
                  <Link href={`/shop/${product.id}`}>
                    <img
                      src={product.image1}
                      alt={product.name}
                      className="product-image img-fluid"
                      style={{ width: '365px', height: '400px', objectFit: 'cover' }}
                    />
                  </Link>
                  <div className="product-content">
                    <h5 className="text-uppercase fs-5 mt-3">
                      <Link 
                        href={`/shop/${product.id}`}
                        className="text-black"
                        style={{ textDecoration: "none" }}
                      >
                        {product.name}
                      </Link>
                    </h5>               
                    <Link href={`/shop/${product.id}`} className="text-decoration-none" data-after="Add to cart">
                      <span className="fw-bold">₹{product.price}</span>
                    </Link>
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