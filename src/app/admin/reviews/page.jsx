"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
  AiFillStar, 
  AiOutlineCheck, 
  AiOutlineDelete, 
  AiOutlineLink 
} from "react-icons/ai";
import Swal from "sweetalert2";

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);


 const [user, setUser] = useState(null); 

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      
    };

    checkUser();
    fetchReviews();
  }, []);

const fetchReviews = async () => {
  setLoading(true);
  try {
  
    const { data, error } = await supabase
      .from("product_reviews")
    .select(`*,products ( name )`)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase Error:", error.message);
      throw error;
    }

    console.log("Data Received:", data);
    setReviews(data || []);
  } catch (err) {
    console.error("Fetch error:", err.message);
  } finally {
    setLoading(false);
  }
};
  // --- REVIEW APPROVE LOGIC ---

const approveReview = async (id) => {
  try {
    const { error } = await supabase
      .from("product_reviews")
      .update({ status: "approved" }) 
      .eq("id", id);

    if (error) throw error;

    
    await fetchReviews(); 

    Swal.fire({
      icon: "success",
      title: "Approved!",
      text: "Review is now visible to customers.",
      timer: 1500, 
      showConfirmButton: false
    });
  } catch (error) {
    console.error("Approve Error:", error.message);
    Swal.fire("Error", error.message, "error");
  }
};

// --- DELETE LOGIC ---
const deleteReview = async (id) => {
  const result = await Swal.fire({
    title: "Are you sure?",
    text: "This action cannot be undone!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#000",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!"
  });

  if (result.isConfirmed) {
    try {
      const { error } = await supabase
        .from("product_reviews")
        .delete()
        .eq("id", id);

      if (error) throw error;

      await fetchReviews();
      Swal.fire("Deleted!", "Review removed.", "success");
    } catch (error) {
      console.error("Delete Error:", error.message);
      Swal.fire("Error", error.message, "error");
    }
  }
};

  

  if (loading) return <div className="p-5 text-center font-bold">Loading reviews...</div>;

  return (
    <div className="container-fluid py-4 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-2xl shadow-sm border">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tighter mb-0 italic">Review Moderation</h2>
          <p className="text-gray-500 text-xs font-bold uppercase">Manage Kaira Customer Feedback</p>
        </div>
        <span className="bg-black text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg">
          {reviews.length} Total Reviews
        </span>
      </div>

      <div className="overflow-hidden shadow-sm rounded-3xl border bg-white">
        <table className="w-full text-left align-middle border-collapse">
          <thead className="bg-gray-50 border-b">
            <tr className="text-[10px] text-gray-400 uppercase font-black tracking-widest">
              <th className="p-4">Product</th>
              <th>Customer</th>
              <th>Rating</th>
              <th>Comment</th>
              <th>Status</th>
              <th className="text-right p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {reviews.map((rev) => (
              <tr key={rev.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    {rev.review_image ? (
                      <img src={rev.review_image} className="w-10 h-10 rounded-lg object-cover border" alt="Review" />
                    ) : (
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-[8px] text-gray-400 font-bold border border-dashed">NO PIC</div>
                    )}
                    <span className="font-bold text-gray-900 text-xs uppercase tracking-tight">
                      {rev.products?.name || "Kaira Product"}
                    </span>
                  </div>
                </td>
                <td><span className="text-xs font-bold text-gray-600 uppercase">{rev.customer_name}</span></td>
                <td>
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <AiFillStar key={i} size={12} className={i < rev.rating ? "text-yellow-400" : "text-gray-200"} />
                    ))}
                  </div>
                </td>
                <td className="max-w-[200px]">
                  <p className="text-xs text-gray-700 italic line-clamp-2">"{rev.comment}"</p>
                </td>
                <td>
                  <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full border ${
                    rev.status === 'approved' 
                      ? 'bg-green-50 text-green-600 border-green-100' 
                      : 'bg-orange-50 text-orange-600 border-orange-100'
                  }`}>
                    {rev.status || 'pending'}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <div className="flex gap-2 justify-end">
                    {rev.status !== "approved" && (
                      <button 
                        onClick={() => approveReview(rev.id)} 
                        className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 shadow-sm flex items-center gap-1 text-[10px] font-bold uppercase"
                      >
                        <AiOutlineCheck size={14} /> Approve
                      </button>
                    )}
                    <button onClick={() => deleteReview(rev.id)} className="text-red-400 hover:text-red-600 p-2">
                      <AiOutlineDelete size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {reviews.length === 0 && (
          <div className="p-20 text-center text-gray-400 font-bold uppercase text-xs tracking-widest">No reviews to show.</div>
        )}
      </div>
    </div>
  );
}