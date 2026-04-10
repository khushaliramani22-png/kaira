"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useSettings } from "@/app/context/SettingsContext";
import { Mail, Phone, Send, Loader2, Clock, Globe } from "lucide-react";
import { toast } from "react-hot-toast";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    order_number: "",
    subject: "General Inquiry",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const { settings } = useSettings();
  const email = settings?.global?.support_email || "care@kaira.com";
  const phone = settings?.global?.support_phone || "+91 90000 00000";

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("users")
          .select("name, email")
          .eq("id", user.id)
          .single();

        if (profile) {
          setFormData((prev) => ({
            ...prev,
            name: profile.name || "",
            email: profile.email || "",
          }));
        }
      }
    };
    fetchUser();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from("contact_messages").insert([formData]);
      if (error) throw error;

      toast.success("Message sent! Our team will contact you soon.");
      setFormData({ ...formData, order_number: "", message: "" });
    } catch (error) {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#fcfcfc] min-h-screen font-sans">
      {/* Top Banner Section */}
      <div className="bg-black text-white py-20 px-6 text-center">
        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-4">
          Support Center
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto font-medium text-lg">
         If you have any questions about your order or product, please let us know. 
We will get back to you within 24 hours.
        </p>
      </div>

      <div className="max-w-7xl mx-auto -mt-12 px-4 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Side: Contact Information */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-gray-100 p-8 rounded-[40px] shadow-xl shadow-gray-200/50">
              <h3 className="text-2xl font-bold text-gray-900 mb-8">Contact Info</h3>
              
              <div className="space-y-10">
                <div className="flex gap-5">
                  <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-900 border border-gray-100">
                    <Mail size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Email Support</p>
                    <p className="text-gray-900 font-semibold">{email}</p>
                  </div>
                </div>

                <div className="flex gap-5">
                  <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-900 border border-gray-100">
                    <Phone size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Phone Support</p>
                    <p className="text-gray-900 font-semibold">{phone}</p>
                  </div>
                </div>

                <div className="flex gap-5">
                  <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-900 border border-gray-100">
                    <Clock size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Working Hours</p>
                    <p className="text-gray-900 font-semibold">Mon - Sat: 10 AM to 7 PM</p>
                  </div>
                </div>
              </div>

              <hr className="my-10 border-gray-100" />
              
              <div className="flex items-center gap-3 text-gray-400">
                <Globe size={16} />
                <p className="text-sm font-medium">Available across India</p>
              </div>
            </div>
          </div>

          {/* Right Side: Contact Form */}
          <div className="lg:col-span-8">
            <div className="bg-white border border-gray-100 p-8 md:p-12 rounded-[40px] shadow-xl shadow-gray-200/50">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="relative">
                    <label className="text-xs font-black text-gray-900 uppercase tracking-widest absolute -top-2.5 left-4 bg-white px-2">Your Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-6 py-3 bg-transparent border-2 border-gray-100 rounded-2xl focus:border-black transition-all outline-none font-semibold"
                      placeholder="e.g. Khushali Ramani"
                      required
                    />
                  </div>
                  <div className="relative">
                    <label className="text-xs font-black text-gray-900 uppercase tracking-widest absolute -top-2.5 left-4 bg-white px-2">Email Address</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-6 py-3 bg-transparent border-2 border-gray-100 rounded-2xl focus:border-black transition-all outline-none font-semibold"
                      placeholder="name@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="relative">
                    <label className="text-xs font-black text-gray-900 uppercase tracking-widest absolute -top-2.5 left-4 bg-white px-2">Reason for Inquiry</label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-6 py-3 bg-transparent border-2 border-gray-100 rounded-2xl focus:border-black transition-all outline-none font-semibold appearance-none"
                    >
                      <option>General Inquiry</option>
                      <option>Order Tracking</option>
                      <option>Returns & Refunds</option>
                      <option>Payment Issues</option>
                    </select>
                  </div>
                  <div className="relative">
                    <label className="text-xs font-black text-gray-900 uppercase tracking-widest absolute -top-2.5 left-4 bg-white px-2">Order ID (Optional)</label>
                    <input
                      type="text"
                      value={formData.order_number}
                      onChange={(e) => setFormData({ ...formData, order_number: e.target.value })}
                      className="w-full px-6 py-3 bg-transparent border-2 border-gray-100 rounded-2xl focus:border-black transition-all outline-none font-semibold"
                      placeholder="#100234"
                    />
                  </div>
                </div>

                <div className="relative">
                  <label className="text-xs font-black text-gray-900 uppercase tracking-widest absolute -top-2.5 left-4 bg-white px-2">Message</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-6 py-3 bg-transparent border-2 border-gray-100 rounded-2xl focus:border-black transition-all outline-none font-semibold min-h-[150px]"
                    placeholder="Describe your issue in detail..."
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full md:w-auto px-12 py-2 bg-black text-white rounded-2xl font-black uppercase tracking-[0.2em] hover:bg-gray-800 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <Send size={20} />}
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}