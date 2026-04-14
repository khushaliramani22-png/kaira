"use client";

import React, { useState } from 'react';
import { Plus, Minus, HelpCircle } from 'lucide-react';

const faqData = [
  {
    question: "When will I receive my order?",
    answer: "Typically, orders are delivered within 1-2 days in Surat and 3-5 days for locations outside Gujarat."
  },
  {
    question: "Is Cash on Delivery (COD) available?",
    answer: "Yes, we offer COD for Surat and nearby areas. For other cities, we recommend using online payment methods for faster processing."
  },
  {
    question: "What is your Return and Refund policy?",
    answer: "If the product is damaged, please inform us within 48 hours. Once verified, refunds are processed within 5-7 business days."
  },
  {
    question: "How do I choose the perfect size?",
    answer: "A detailed size chart is available on every product page. If you're still unsure, feel free to contact us via WhatsApp for assistance."
  }
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="bg-white min-h-screen py-12 px-4">
      <div className="max-w-3xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block p-3 bg-gray-100 rounded-full mb-4">
            <HelpCircle size={32} className="text-black" />
          </div>
          <h1 className="text-3xl font-bold uppercase tracking-widest text-black">FAQs</h1>
          <p className="text-gray-500 mt-2">Find answers to your most frequently asked questions here.</p>
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {faqData.map((faq, index) => (
            <div 
              key={index} 
              className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm transition-all"
            >
              <button 
                onClick={() => toggleFAQ(index)}
                className="w-full flex items-center justify-between p-5 text-left bg-white hover:bg-gray-50 transition-colors"
              >
                <span className="font-bold text-gray-800 text-sm md:text-base uppercase tracking-tight">
                  {faq.question}
                </span>
                {openIndex === index ? (
                  <Minus size={20} className="text-black" />
                ) : (
                  <Plus size={20} className="text-black" />
                )}
              </button>
              
              {openIndex === index && (
                <div className="p-5 bg-gray-50 border-t border-gray-100 text-gray-600 text-sm leading-relaxed animate-in fade-in slide-in-from-top-2 duration-300">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Support Section */}
        <div className="mt-16 bg-black rounded-3xl p-8 text-center text-white">
          <h3 className="text-lg font-bold uppercase tracking-wider mb-2">Still have questions?</h3>
          <p className="text-gray-400 text-sm mb-6">Our support team is here to help you with anything you need.</p>
          <a 
            href="/contact" 
            className="inline-block bg-white text-black px-8 py-3 rounded-full font-bold uppercase text-xs tracking-widest hover:bg-gray-200 transition"
          >
            Contact Us
          </a>
        </div>

      </div>
    </div>
  );
}