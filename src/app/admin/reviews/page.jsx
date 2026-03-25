"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { AiFillStar, AiOutlineCheck, AiOutlineDelete, AiOutlineEye } from "react-icons/ai";

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      // રિવ્યુની સાથે પ્રોડક્ટનું નામ પણ ફેચ કરીએ
      const { data, error } = await supabase
        .from("product_reviews")
        .select(`
          *,
          products ( name )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data) setReviews(data);
    } catch (err) {
      console.error("Fetch error:", err.message);
    } finally {
      setLoading(false);
    }
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
    } else {
      alert("Error approving review: " + error.message);
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
        <div>
          <h2 className="fw-black uppercase italic tracking-tighter mb-0">Review Moderation</h2>
          <p className="text-muted small">Manage customer feedback for Kaira products</p>
        </div>
        <span className="badge bg-dark px-3 py-2 shadow-sm">{reviews.length} Total Reviews</span>
      </div>

      <div className="table-responsive shadow-sm rounded-4 overflow-hidden border">
        <table className="table table-hover align-middle bg-white mb-0">
          <thead className="table-light">
            <tr className="small uppercase tracking-wider">
              <th className="ps-4">Product & Image</th>
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
                  <div className="d-flex align-items-center gap-3">
                    {/* જો રિવ્યુમાં ઈમેજ હોય તો અહીં દેખાશે */}
                    {rev.review_image ? (
                      <a href={rev.review_image} target="_blank" rel="noreferrer">
                        <img 
                          src={rev.review_image} 
                          alt="Review" 
                          className="rounded-2 border shadow-sm" 
                          style={{ width: "45px", height: "45px", objectFit: "cover" }} 
                        />
                      </a>
                    ) : (
                      <div className="bg-light rounded-2 border d-flex align-items-center justify-content-center" style={{ width: "45px", height: "45px" }}>
                        <span className="text-muted" style={{ fontSize: '10px' }}>No Pic</span>
                      </div>
                    )}
                    <span className="fw-bold text-dark small">{rev.products?.name || "Deleted Product"}</span>
                  </div>
                </td>
                <td><span className="small text-muted fw-medium">{rev.customer_name}</span></td>
                <td>
                  <div className="text-warning d-flex">
                    {[...Array(5)].map((_, i) => (
                      <AiFillStar key={i} size={14} style={{ color: i < rev.rating ? "#FFC107" : "#E5E7EB" }} />
                    ))}
                  </div>
                </td>
                <td style={{ maxWidth: "250px" }}>
                  <p className="small mb-0 text-dark italic" style={{ fontSize: '13px' }}>"{rev.comment}"</p>
                </td>
                <td>
                  <span className={`badge rounded-pill px-3 py-2 border ${
                    rev.status === 'approved' 
                      ? 'bg-success-subtle text-success border-success-subtle' 
                      : 'bg-warning-subtle text-warning border-warning-subtle'
                  }`}>
                    {rev.status || 'pending'}
                  </span>
                </td>
                <td className="text-end pe-4">
                  <div className="d-flex gap-2 justify-content-end">
                    {rev.status !== "approved" && (
                      <button 
                        onClick={() => approveReview(rev.id)} 
                        className="btn btn-sm btn-success d-flex align-items-center gap-1 shadow-sm px-3"
                      >
                        <AiOutlineCheck /> Approve
                      </button>
                    )}
                    <button 
                      onClick={() => deleteReview(rev.id)} 
                      className="btn btn-sm btn-outline-danger border-0 hover-bg-danger"
                      title="Delete Review"
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
          <div className="p-5 text-center text-muted italic bg-white">
            <p className="mb-0">No reviews found in database.</p>
          </div>
        )}
      </div>
    </div>
  );
}