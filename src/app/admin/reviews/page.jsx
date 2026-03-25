"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { AiFillStar, AiOutlineCheck, AiOutlineDelete } from "react-icons/ai";

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    // રિવ્યુની સાથે પ્રોડક્ટનું નામ પણ ફેચ કરીએ
    const { data, error } = await supabase
      .from("product_reviews")
      .select(`
        *,
        products ( name )
      `)
      .order("created_at", { ascending: false });

    if (data) setReviews(data);
    setLoading(false);
  };

  // રિવ્યુ એપ્રુવ કરવાનું ફંક્શન
  const approveReview = async (id) => {
    const { error } = await supabase
      .from("product_reviews")
      .update({ status: "approved" })
      .eq("id", id);

    if (!error) {
      alert("Review Approved!");
      fetchReviews();
    }
  };

  // રિવ્યુ ડિલીટ કરવાનું ફંક્શન
  const deleteReview = async (id) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    
    const { error } = await supabase
      .from("product_reviews")
      .delete()
      .eq("id", id);

    if (!error) {
      fetchReviews();
    }
  };

  if (loading) return <div className="p-5 text-center fw-bold">Loading reviews...</div>;

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-black uppercase italic tracking-tighter">Review Moderation</h2>
        <span className="badge bg-dark px-3 py-2">{reviews.length} Total Reviews</span>
      </div>

      <div className="table-responsive shadow-sm rounded-4 overflow-hidden">
        <table className="table table-hover align-middle bg-white mb-0">
          <thead className="table-light">
            <tr className="small uppercase tracking-wider">
              <th className="ps-4">Product</th>
              <th>Customer</th>
              <th>Rating</th>
              <th>Comment</th>
              <th>Status</th>
              <th className="text-end pe-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((rev) => (
              <tr key={rev.id}>
                <td className="ps-4">
                  <span className="fw-bold text-dark small">{rev.products?.name || "Unknown Product"}</span>
                </td>
                <td><span className="small text-muted">{rev.customer_name}</span></td>
                <td>
                  <div className="text-warning d-flex">
                    {[...Array(5)].map((_, i) => (
                      <AiFillStar key={i} size={14} style={{ color: i < rev.rating ? "#FFC107" : "#E5E7EB" }} />
                    ))}
                  </div>
                </td>
                <td style={{ maxWidth: "250px" }}>
                  <p className="small mb-0 text-truncate italic">"{rev.comment}"</p>
                </td>
                <td>
                  <span className={`badge rounded-pill px-3 ${
                    rev.status === 'approved' ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'
                  }`}>
                    {rev.status}
                  </span>
                </td>
                <td className="text-end pe-4">
                  <div className="d-flex gap-2 justify-content-end">
                    {rev.status === "pending" && (
                      <button 
                        onClick={() => approveReview(rev.id)} 
                        className="btn btn-sm btn-success d-flex align-items-center gap-1 shadow-sm"
                      >
                        <AiOutlineCheck /> Approve
                      </button>
                    )}
                    <button 
                      onClick={() => deleteReview(rev.id)} 
                      className="btn btn-sm btn-outline-danger border-0"
                    >
                      <AiOutlineDelete size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {reviews.length === 0 && (
          <div className="p-5 text-center text-muted italic bg-white">No reviews found in database.</div>
        )}
      </div>
    </div>
  );
}