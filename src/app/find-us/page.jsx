"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, MapPin, Phone, Mail, Instagram, Clock, ArrowRight } from 'lucide-react';

export default function FindUs() {
  return (
    <div className="bg-white min-h-screen">
      {/* Header Section */}
      <div className="border-b">
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 uppercase">
            Find Us
          </h1>
          <p className="mt-2 text-gray-500">Visit our studio or get in touch with us.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

          {/* Left Side: Contact Information */}
          <div className="space-y-10">
            <section>
              <h2 className="text-xl font-bold text-black uppercase mb-6 border-l-4 border-black pl-3">
                Our Location
              </h2>
              <div className="flex items-start gap-4">
                <div className="bg-gray-100 p-3 rounded-full">
                  <MapPin size={24} className="text-black" />
                </div>
                <div>
                  <h3 className="font-bold text-sm uppercase">Headquarters</h3>
                  <p className="text-gray-600 mt-1">
                    <br />
                    Surat, Gujarat - 395010
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-black uppercase mb-6 border-l-4 border-black pl-3">
                Contact Details
              </h2>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="bg-gray-100 p-3 rounded-full">
                    <Phone size={20} className="text-black" />
                  </div>
                  <p className="text-gray-600 font-medium">+91 12345 67891</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="bg-gray-100 p-3 rounded-full">
                    <Mail size={20} className="text-black" />
                  </div>
                  <p className="text-gray-600 font-medium">hello@kairafashion.com</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="bg-gray-100 p-3 rounded-full">
                    <Instagram size={20} className="text-black" />
                  </div>
                  <p className="text-gray-600 font-medium">@kaira_fashion_store</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-black uppercase mb-6 border-l-4 border-black pl-3">
                Working Hours
              </h2>
              <div className="flex items-start gap-4">
                <div className="bg-gray-100 p-3 rounded-full">
                  <Clock size={20} className="text-black" />
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><span className="font-bold text-black">Mon - Sat:</span> 10:00 AM - 08:00 PM</p>
                  <p><span className="font-bold text-black">Sunday:</span> Closed (Online orders only)</p>
                </div>
              </div>
            </section>
          </div>

          {/* Right Side: High-Quality Brand Image */}

          <div className="grid grid-cols-1 gap-6">

            {/* WhatsApp Support Card */}
            <div className="w-full space-y-4">
              <h2 className="text-xl font-bold text-black uppercase mb-6 border-l-4 border-black pl-3 tracking-tight">
                Quick Contact
              </h2>

              {/* Call Card */}
              <a
                href="tel:+911234567891"
                className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-black hover:text-white transition-all duration-300 group shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-white p-4 rounded-full shadow-sm group-hover:bg-gray-800 transition-colors">
                    <Phone size={24} className="text-black group-hover:text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider">Call Our Support</h3>
                    <p className="text-xs text-gray-500 group-hover:text-gray-300 mt-1">+91 12345 67891</p>
                  </div>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight size={20} />
                </div>
              </a>

              {/* Email Card */}
              <a
                href="mailto:hello@kairafashion.com"
                className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-black hover:text-white transition-all duration-300 group shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-white p-4 rounded-full shadow-sm group-hover:bg-gray-800 transition-colors">
                    <Mail size={24} className="text-black group-hover:text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider">Email Inquiry</h3>
                    <p className="text-xs text-gray-500 group-hover:text-gray-300 mt-1">hello@kairafashion.com</p>
                  </div>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight size={20} />
                </div>
              </a>

              {/* Instagram Card */}
              <a
                href="https://instagram.com/kaira_fashion_store"
                target="_blank"
                className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-gradient-to-tr hover:from-purple-600 hover:to-pink-500 hover:text-white transition-all duration-500 group shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-white p-4 rounded-full shadow-sm group-hover:bg-white/20 transition-colors">
                    <Instagram size={24} className="text-black group-hover:text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider">Follow Us</h3>
                    <p className="text-xs text-gray-500 group-hover:text-gray-100 mt-1">@kaira_fashion_store</p>
                  </div>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight size={20} />
                </div>
              </a>
            </div>

            {/* Brand Trust Card */}
            <div className="bg-black p-8 rounded-2xl text-white">
              <h3 className="text-lg font-bold uppercase mb-4 tracking-tighter">Visit our Studio</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Our studio is in the heart of Surat. If you want to come and check the fabric in person, definitely come.
              </p>
              <div className="mt-6 flex items-center gap-2 text-yellow-500">
                <span>★★★★★</span>
                <span className="text-xs text-gray-400 font-medium">Verified Store</span>
              </div>
            </div>

          </div>
        </div>

        {/* Back to Shop */}
        <div className="mt-16 text-center">
          <Link href="/" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-black transition">
            <ArrowLeft size={16} className="mr-2" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}