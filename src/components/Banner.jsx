
"use client";
import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Navigation } from 'swiper/modules';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

// Swiper CSS
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/navigation';

const BannerSlider = () => {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [file, setFile] = useState(null); 

    useEffect(() => {
        const fetchBanners = async () => {
            const { data, error } = await supabase
                .from('banners')
                .select('*')
                .eq('is_active', true)
                .order('created_at', { ascending: false });

            if (!error) setBanners(data);
            setLoading(false);
        };
        fetchBanners();
    }, []);

    if (loading) return <div className="h-[70vh] bg-gray-900 animate-pulse" />;
    if (banners.length === 0) return null;

    return (
        <section className="w-full h-[70vh] md:h-[85vh]">
            <Swiper
                modules={[Autoplay, EffectFade, Navigation]}
                effect={'fade'}
                autoplay={{ delay: 5000 }}
                navigation={true}
                loop={true}
                className="h-full w-full"
            >
                {banners.map((slide) => (
                    <SwiperSlide key={slide.id}>
                        <div className="relative w-full h-full flex items-center overflow-hidden bg-gray-900">
                            <div 
                                className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-[500ms] scale-110 hover:scale-100"
                                style={{ backgroundImage: `url(${slide.image_url})` }}
                            >
                                <div className="absolute inset-0 bg-black/40"></div>
                            </div>

                            <div className="container mx-auto px-6 relative z-10 text-white">
                                <div className="max-w-2xl">
                                    <span className="inline-block text-sm font-bold tracking-[0.4em] uppercase mb-4 animate-pulse">
                                        {slide.subtitle}
                                    </span>
                                    <h1 className="text-5xl md:text-8xl font-black leading-none mb-6 italic">
                                        {slide.title}
                                    </h1>
                                    <p className="text-lg md:text-xl mb-10 text-gray-200 font-light">
                                        {slide.description}
                                    </p>
                                    <div className="flex gap-4">
                                        <Link href="/shop" className="bg-white text-black px-10 py-4 font-black uppercase hover:bg-black hover:text-white transition-all">
                                            Shop Now
                                        </Link>
                                        <a href="#Categories" className="border-2 border-white text-white px-10 py-4 font-black uppercase hover:bg-white hover:text-black transition-all">
                                            Explore
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </section>
    );
};

export default BannerSlider;