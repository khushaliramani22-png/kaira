"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Mail, MessageSquare, Calendar, User, Hash, Filter, Trash2, Loader2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "react-hot-toast";

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("All");
  
  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const messagesPerPage = 6; // એક પેજ પર ૬ મેસેજ દેખાશે

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Error fetching messages");
    } else {
      setMessages(data || []);
    }
    setLoading(false);
  };

  const deleteMessage = async (id) => {
    if (!confirm("Are you sure you want to delete this message?")) return;
    const { error } = await supabase.from("contact_messages").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete");
    } else {
      toast.success("Message deleted");
      setMessages(messages.filter((m) => m.id !== id));
    }
  };

  // 1. Search & Filter Logic
  const filteredMessages = messages.filter((msg) => {
    const matchesSearch = 
      msg.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (msg.order_number && msg.order_number.includes(searchTerm));
    
    const matchesFilter = filter === "All" ? true : msg.subject === filter;
    
    return matchesSearch && matchesFilter;
  });

  // 2. Pagination Logic
  const indexOfLastMessage = currentPage * messagesPerPage;
  const indexOfFirstMessage = indexOfLastMessage - messagesPerPage;
  const currentMessages = filteredMessages.slice(indexOfFirstMessage, indexOfLastMessage);
  const totalPages = Math.ceil(filteredMessages.length / messagesPerPage);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen text-gray-500 italic">
      <Loader2 className="animate-spin mb-2" size={32} />
      <p>Loading Customer Inquiries...</p>
    </div>
  );

  return (
    <div className="p-6 md:p-10 bg-[#fbfbfb] min-h-screen">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="mb-10">
          <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">Messages</h1>
          <p className="text-gray-400 font-medium">Manage customer questions and feedback here.</p>
        </div>

        {/* Search & Filter Bar Section */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Search by Name, Email or Order ID..."
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-100 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-black transition-all font-medium"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // સર્ચ વખતે પહેલા પેજ પર આવી જવું
              }}
            />
          </div>
          
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-gray-100 shadow-sm min-w-[200px]">
            <Filter size={18} className="text-gray-400" />
            <select 
              className="outline-none bg-transparent font-bold text-sm text-gray-700 cursor-pointer w-full"
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="All">All Categories</option>
              <option value="General Inquiry">General Inquiry</option>
              <option value="Order Tracking">Order Tracking</option>
              <option value="Returns & Refunds">Returns & Refunds</option>
              <option value="Payment Issues">Payment Issues</option>
            </select>
          </div>
        </div>

        {/* Messages List Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-10">
          {currentMessages.length === 0 ? (
            <div className="col-span-full py-20 text-center bg-white rounded-[40px] border-2 border-dashed border-gray-100">
              <MessageSquare className="mx-auto text-gray-100 mb-4" size={60} />
              <p className="text-gray-300 font-bold uppercase tracking-widest">No matching messages found</p>
            </div>
          ) : (
            currentMessages.map((msg) => (
              <div key={msg.id} className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-all group">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      msg.subject === 'Payment Issues' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                    }`}>
                      {msg.subject}
                    </span>
                    <button onClick={() => deleteMessage(msg.id)} className="text-gray-300 hover:text-red-500"><Trash2 size={16} /></button>
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-900 border border-gray-100 font-bold">{msg.name.charAt(0)}</div>
                    <div>
                      <h4 className="font-bold text-gray-900 leading-none">{msg.name}</h4>
                      <p className="text-[11px] text-gray-400 mt-1">{msg.email}</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl text-gray-600 text-sm leading-relaxed mb-4">"{msg.message}"</div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                  <div className="flex items-center gap-2 text-gray-400"><Hash size={12} /><span className="text-[10px] font-bold uppercase">{msg.order_number || "No ID"}</span></div>
                  <div className="flex items-center gap-2 text-gray-400"><Calendar size={12} /><span className="text-[10px] font-bold">{new Date(msg.created_at).toLocaleDateString("en-IN")}</span></div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination Section */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-8">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`p-2 rounded-xl border ${currentPage === 1 ? 'text-gray-200 border-gray-50' : 'text-gray-600 border-gray-200 hover:bg-white shadow-sm'}`}
            >
              <ChevronLeft size={20} />
            </button>
            <span className="font-bold text-sm text-gray-700">Page {currentPage} of {totalPages}</span>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-xl border ${currentPage === totalPages ? 'text-gray-200 border-gray-50' : 'text-gray-600 border-gray-200 hover:bg-white shadow-sm'}`}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}