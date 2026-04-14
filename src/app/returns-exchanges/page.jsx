"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, RefreshCcw, Truck, CheckCircle } from 'lucide-react';

export default function ReturnsExchanges() {
    const [typedId, setTypedId] = useState("");
    const router = useRouter();

    const handleReturnRequest = () => {
        if (typedId.trim() !== "") {
            router.push(`/user-order/${encodeURIComponent(typedId.trim())}`);
        } else {
            alert("Please enter a valid Order ID!");
        }
    };

    return (
        <div className="bg-white min-h-screen">
            {/* Header Section */}
            <div className="border-b">
                <div className="max-w-4xl mx-auto px-4 py-8 text-center">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 uppercase">
                        Returns + Exchanges
                    </h1>
                    <p className="mt-2 text-gray-500">Kaira Fashion Store - Your satisfaction is our priority.</p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-12">

                {/* Quick Steps */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 text-center">
                    <div className="flex flex-col items-center">
                        <div className="bg-gray-100 p-4 rounded-full mb-4">
                            <CheckCircle className="text-black" size={32} />
                        </div>
                        <h3 className="font-bold uppercase text-sm">7 Days Policy</h3>
                        <p className="text-xs text-gray-500 mt-1">Request a return within 7 days of delivery.</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="bg-gray-100 p-4 rounded-full mb-4">
                            <Truck className="text-black" size={32} />
                        </div>
                        <h3 className="font-bold uppercase text-sm">Free Pick-up</h3>
                        <p className="text-xs text-gray-500 mt-1">We will pick up the item from your doorstep.</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="bg-gray-100 p-4 rounded-full mb-4">
                            <RefreshCcw className="text-black" size={32} />
                        </div>
                        <h3 className="font-bold uppercase text-sm">Easy Exchange</h3>
                        <p className="text-xs text-gray-500 mt-1">Found a size issue? Exchange it instantly.</p>
                    </div>
                </div>

                {/* Policy Details */}
                <div className="space-y-12 text-gray-700 leading-relaxed">
                    <section>
                        <h2 className="text-xl font-bold text-black uppercase mb-4 border-l-4 border-black pl-3">
                            Return Policy
                        </h2>
                        <p className="mb-4">
                            If you are not satisfied with your order, you can return the product within <strong>7 days</strong>. The product must be in its original packaging with all tags intact.
                        </p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Items must be unworn and unwashed.</li>
                            <li>All accessories and the original invoice must be included.</li>
                            <li>Innerwear and masks cannot be returned due to hygiene reasons.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-black uppercase mb-4 border-l-4 border-black pl-3">
                            Exchange Process
                        </h2>
                        <p>
                            In case of size issues, you can exchange the product for a different size of the same item. No additional charges will be applied for exchanges, subject to stock availability.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-black uppercase mb-4 border-l-4 border-black pl-3">
                            Refund Information
                        </h2>
                        <p>
                            Once the product reaches our warehouse and passes the quality check, the refund will be processed within <strong>5 to 7 business days</strong> to your original payment method.
                        </p>
                    </section>
                </div>

                {/* Action Section with Input */}
                <div className="mt-16 p-8 bg-gray-50 text-center rounded-lg border border-dashed border-gray-300">
                    <h3 className="text-lg font-bold mb-2 uppercase">Need to make a return?</h3>
                    <p className="text-sm text-gray-600 mb-6">Enter your Order ID below to start the process.</p>

                    <div className="flex flex-col md:flex-row justify-center items-center gap-4">
                        <input
                            type="text"
                            placeholder="Enter Order ID (e.g. #KRA-B26D20)"
                            value={typedId}
                            onChange={(e) => setTypedId(e.target.value)}
                            className="px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black w-full md:w-64 text-black"
                        />

                        <button
                            onClick={handleReturnRequest}
                            className="bg-black text-white px-8 py-3 text-sm font-bold uppercase tracking-widest hover:bg-gray-800 transition w-full md:w-auto"
                        >
                            Send a Return Request
                        </button>
                    </div>
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