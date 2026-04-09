"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { AiOutlineEdit, AiOutlineDelete, AiOutlinePlus } from "react-icons/ai";

export default function BannerList() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("banners")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBanners(data || []);
    } catch (error) {
      console.error("Error fetching banners:", error.message);
    } finally {
      setLoading(false);
    }
  };
  const handleDelete = async (id) => {
    if (confirm("you are sure this banner is deleted..?")) {
      try {
        const { error } = await supabase.from("banners").delete().eq("id", id);
        if (error) throw error;
        setBanners(banners.filter((b) => b.id !== id));
        alert("Banner deleted successfully!");
      } catch (error) {
        alert("Error deleting banner: " + error.message);
      }
    }
  };
  if (loading) return <div className="container py-5 text-center">Loading Banners...</div>;
  return (
    <div className="container py-5 font-sans">
      <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
        <h2 className="fw-bold uppercase mb-0">Store Banners</h2>
        <Link href="/admin/banner/add" className="btn btn-dark d-flex align-items-center gap-2">
          <AiOutlinePlus /> Add New Banner
        </Link>
      </div>
      {banners.length === 0 ? (
        <div className="text-center py-5 border rounded bg-light">
          <p className="text-muted">add new banner!</p>
        </div>
      ) : (
        <div className="table-responsive bg-white shadow-sm rounded">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light text-uppercase small fw-bold">
              <tr>
                <th className="ps-4">Image</th>
                <th>Title & Subtitle</th>
                <th>Description</th>
                <th className="text-end pe-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {banners.map((banner) => (
                <tr key={banner.id}>
                  <td className="ps-4">
                    <img
                      src={banner.image_url}
                      alt={banner.title}
                      className="rounded border"
                      style={{ width: "100px", height: "60px", objectFit: "cover" }}
                    />
                  </td>
                  <td>
                    <div className="fw-bold">{banner.title}</div>
                    <div className="text-muted small">{banner.subtitle}</div>
                  </td>
                  <td>
                    <p className="mb-0 text-truncate" style={{ maxWidth: "250px" }}>
                      {banner.description || "-"}
                    </p>
                  </td>
                  <td className="text-end pe-4">
                    <div className="d-flex justify-content-end gap-2">                  
                      <Link 
                        href={`/admin/banner/edit/${banner.id}`} 
                        className="btn btn-sm btn-outline-dark"
                        title="Edit Banner"
                      >
                        <AiOutlineEdit size={18} />
                      </Link>
                      {/* Delete બટન */}
                      <button
                        onClick={() => handleDelete(banner.id)}
                        className="btn btn-sm btn-outline-danger"
                        title="Delete Banner"
                      >
                        <AiOutlineDelete size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}