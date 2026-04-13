"use client";
import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, EffectCoverflow } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-coverflow";

const Testimonials = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const testimonialsData = [
    { id: 1, text: "“More than expected crazy soft, flexible and best fitted white simple denim shirt.”", title: "casual way" },
    { id: 2, text: "“Best fitted white denim shirt more than expected crazy soft, flexible”", title: "uptop" },
    { id: 3, text: "“Best fitted white denim shirt more white denim than expected flexible crazy soft.”", title: "Denim craze" },
    { id: 4, text: "“Best fitted white denim shirt more than expected crazy soft, flexible”", title: "uptop" },
  ];

  if (!isClient) return null;

  return (
    <section className="testimonials py-5 bg-light">
      <div className="section-header text-center mt-5">
        <h3 className="section-title">WE LOVE GOOD COMPLIMENT</h3>
      </div>

      <div className="container my-5">
        <Swiper
          effect={"coverflow"}
          grabCursor={true}
          centeredSlides={true}
          slidesPerView={"auto"}
          loop={true}
          coverflowEffect={{
            rotate: 50,
            stretch: 0,
            depth: 100,
            modifier: 1,
            slideShadows: true,
          }}
          pagination={{
            clickable: true,
            el: ".custom-pagination",
          }}
          modules={[EffectCoverflow, Pagination]}
          className="testimonial-swiper"
        >
          {testimonialsData.map((item, index) => (
            <SwiperSlide key={index} style={{ width: "300px" }}>
              <div className="testimonial-item text-center p-4 shadow-sm rounded">
                <blockquote className="blockquote">
                  <p>{item.text}</p>
                  <div className="review-title text-uppercase fw-bold small mt-3">
                    {item.title}
                  </div>
                </blockquote>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        <div className="custom-pagination d-flex justify-content-center mt-4"></div>
      </div>

      <style jsx>{`
        .testimonial-item {
          min-height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .section-title {
          letter-spacing: 2px;
          font-weight: 700;
        }
      `}</style>
    </section>
  );
};

export default Testimonials;