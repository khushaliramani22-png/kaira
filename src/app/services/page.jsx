import React from 'react';
import { Truck, RotateCcw, ShieldCheck, Headphones, Gift, Globe } from 'lucide-react';

const ServicesPage = () => {
  const services = [
    {
      icon: <Truck className="w-10 h-10 text-black" />,
      title: "Fast Shipping",
      description: "Free delivery on all orders above ₹999. We ensure your package reaches you in 3-5 business days."
    },
    {
      icon: <RotateCcw className="w-10 h-10 text-black" />,
      title: "7-Day Returns",
      description: "Not happy with the fit? No worries! We offer a hassle-free 7-day return and exchange policy."
    },
    {
      icon: <ShieldCheck className="w-10 h-10 text-black" />,
      title: "Secure Payments",
      description: "Your transactions are safe with us. We support all major UPI, Credit/Debit cards, and Net Banking."
    },
    {
      icon: <Headphones className="w-10 h-10 text-black" />,
      title: "24/7 Support",
      description: "Have questions? Our customer support team is available round the clock to help you."
    },
    {
      icon: <Gift className="w-10 h-10 text-black" />,
      title: "Gift Wrapping",
      description: "Sending a gift? Choose our premium gift wrapping service at checkout for a special touch."
    },
    {
      icon: <Globe className="w-10 h-10 text-black" />,
      title: "Ethical Sourcing",
      description: "All our products are made with high-quality western clothing fabrics, sourced ethically."
    }
  ];

  return (
    <div className="bg-white min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">Our Services</h1>
        <p className="mt-4 text-xl text-gray-500">
          At KAIRA, we prioritize your shopping experience with premium services.
        </p>
      </div>

      {/* Services Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 gap-y-12 sm:grid-cols-2 sm:gap-x-8 lg:grid-cols-3">
        {services.map((service, index) => (
          <div 
            key={index} 
            className="flex flex-col items-center text-center p-8 border border-gray-100 rounded-2xl hover:shadow-lg transition-shadow duration-300"
          >
            <div className="mb-4 p-3 bg-gray-50 rounded-full">
              {service.icon}
            </div>
            <h3 className="text-xl font-semibold text-gray-900">{service.title}</h3>
            <p className="mt-3 text-gray-600 leading-relaxed">
              {service.description}
            </p>
          </div>
        ))}
      </div>

      {/* CTA Section */}
      <div className="mt-20 text-center">
        <p className="text-lg text-gray-600">Need help with something else?</p>
        <button className="mt-4 px-8 py-3 bg-black text-white font-medium rounded-md hover:bg-gray-800 transition-colors">
          Contact Support
        </button>
      </div>
    </div>
  );
};

export default ServicesPage;