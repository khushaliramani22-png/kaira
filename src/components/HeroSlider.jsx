"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function HeroSlider() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  const targetCategories = ["NEW ARRIVALS", "BESTSELLER", "JEANS"];

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .in("category", targetCategories)
          .order("created_at", { ascending: false });

        if (error) throw error;

        // દરેક કેટેગરીમાંથી ૧-૧ લેટેસ્ટ પ્રોડક્ટ ફિલ્ટર કરો
        const filtered = targetCategories.map(cat =>
          data.find(p => p.category === cat)
        ).filter(Boolean);

        setBanners(filtered);
      } catch (error) {
        console.error("Error fetching banners:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  if (loading || banners.length === 0) return null;

  return (
    <section id="billboard" className="bg-light py-5">
      <div className="container">
        <div className="row justify-content-center">
          <h1 className="section-title text-center mt-4">
            New Collections
          </h1>
          <div className="col-md-6 text-center">
            <p>
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
            </p>
          </div>
        </div>

        <div className="row">
          {banners.map((item) => (
            <div className="col-md-4" key={item.id}>
              <div className="banner-item image-zoom-effect">
                <div className="image-holder">
                  {/* ઈમેજ પર ક્લિક કરતા શોપ પેજ ખુલશે */}
                  <Link href={`/shop/${item.id}`}>
                    <img
                      src={item.image1 || "/images/colorbox/placeholder.jpg"}
                      alt={item.name}
                      className="img-fluid"
                      style={{ height: '450px', width: '100%', objectFit: 'cover' }}
                    />
                  </Link>
                </div>

                <div className="banner-content py-4">
                  <h5 className="element-title text-uppercase">
                    <Link href={`/shop/${item.id}`} className="item-anchor text-decoration-none">
                      {item.category} {/* અહીં તમારી કેટેગરીનું નામ આવશે */}
                    </Link>
                  </h5>

                  <p>{item.name}</p>

                  {/* <div className="btn-left">
                    <Link
                      href={`/shop/${item.id}`}
                      className="btn-link fs-6 text-uppercase text-decoration-none"
                    >
                      Discover Now
                    </Link>
                  </div> */}
                  <div className="btn-left">
                    {/* અહીં આપણે પ્રોડક્ટના ID ને બદલે કેટેગરીનું નામ મોકલીશું */}
                    <Link
                      href={`/shop?category=${item.category}`}
                      className="btn-link fs-6 text-uppercase text-decoration-none"
                    >
                      Discover Now
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}