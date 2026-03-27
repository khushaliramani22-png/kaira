"use client";

import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";



import HeroSlider from "@/components/HeroSlider";
import Blog from "@/components/Blog";
import Features from "@/components/Features";
import Categories from "@/components/Categories";
import NewArrivals from "@/components/NewArrivals";
import Collection from "@/components/Collection";
import BestSellers from "@/components/BestSellers";
import RelatedProducts from "@/components/RelatedProduct";
import Newsletter from "@/components/Newsletter";


export default function Page() {

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true
    });
  }, []);

  return (
    <><div data-aos="fade-up">

      <HeroSlider />
       <Features />
       <Categories />
       <NewArrivals />
       <Collection />
       <BestSellers />
       <RelatedProducts />
       <Newsletter />
       
      <Blog />
    
   
      
      
      </div>


    </>
  );
}