"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock, Globe, ShieldCheck } from 'lucide-react';

export default function ShippingDelivery() {
  return (
    <div className="bg-white min-h-screen">
      {/* Header Section */}
      <div className="border-b">
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 uppercase">
            Shipping + Delivery
          </h1>
          <p className="mt-2 text-gray-500">Fast, reliable, and secure delivery to your doorstep.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        
        {/* Delivery Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 text-center">
          <div className="flex flex-col items-center">
            <div className="bg-gray-100 p-4 rounded-full mb-4">
              <Clock className="text-black" size={32} />
            </div>
            <h3 className="font-bold uppercase text-sm">Quick Dispatch</h3>
            <p className="text-xs text-gray-500 mt-1">Orders are processed within 24-48 hours.</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="bg-gray-100 p-4 rounded-full mb-4">
              <Globe className="text-black" size={32} />
            </div>
            <h3 className="font-bold uppercase text-sm">Pan India</h3>
            <p className="text-xs text-gray-500 mt-1">We deliver to over 19,000+ pin codes.</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="bg-gray-100 p-4 rounded-full mb-4">
              <ShieldCheck className="text-black" size={32} />
            </div>
            <h3 className="font-bold uppercase text-sm">Secure Packing</h3>
            <p className="text-xs text-gray-500 mt-1">Tamper-proof packaging for every order.</p>
          </div>
        </div>

        {/* Detailed Info */}
        <div className="space-y-12 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-black uppercase mb-4 border-l-4 border-black pl-3">
              Delivery Timelines
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 font-bold uppercase text-xs">Region</th>
                    <th className="py-2 font-bold uppercase text-xs">Estimated Time</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <tr className="border-b">
                    <td className="py-3 font-medium">Gujarat (Local)</td>
                    <td className="py-3 text-gray-600">2 - 3 Business Days</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 font-medium">Metro Cities</td>
                    <td className="py-3 text-gray-600">3 - 5 Business Days</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 font-medium">Rest of India</td>
                    <td className="py-3 text-gray-600">5 - 7 Business Days</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-black uppercase mb-4 border-l-4 border-black pl-3">
              Shipping Charges
            </h2>
            <p className="mb-4">
              We aim to keep our shipping transparent and affordable:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Free Shipping</strong> on all prepaid orders above ₹2,000.</li>
              <li>A flat shipping fee of ₹99 is applicable on orders below ₹2,000.</li>
              <li>Cash on Delivery (COD) is available with an additional ₹50 handling fee.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-black uppercase mb-4 border-l-4 border-black pl-3">
              Order Tracking
            </h2>
            <p>
              Once your order is shipped, you will receive a unique tracking link via <strong>SMS and Email</strong>. You can also track your order status directly through the 
              <Link href="/user-order" className="text-black underline font-medium ml-1">My Orders</Link> section on our website.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-black uppercase mb-4 border-l-4 border-black pl-3">
              Important Notes
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>Delivery times are estimates and may vary due to holidays or extreme weather.</li>
              <li>Please ensure your contact number is reachable for the courier partner.</li>
              <li>If the package appears tampered with, please do not accept it and contact us immediately.</li>
            </ul>
          </section>
        </div>

        {/* Support Section */}
        <div className="mt-16 p-8 bg-gray-50 text-center rounded-lg border border-dashed border-gray-300">
          <h3 className="text-lg font-bold mb-2 uppercase text-black">Still have questions?</h3>
          <p className="text-sm text-gray-600 mb-6">Our support team is here to help you with your delivery concerns.</p>
          <Link 
            href="/contact" 
            className="inline-block bg-black text-white px-8 py-3 text-sm font-bold uppercase tracking-widest hover:bg-gray-800 transition"
          >
            Contact Support
          </Link>
        </div>

        {/* Back to Shop */}
        <div className="mt-12 text-center">
          <Link href="/" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-black transition">
            <ArrowLeft size={16} className="mr-2" />
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}