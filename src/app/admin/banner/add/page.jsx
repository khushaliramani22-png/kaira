"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminBannerPage() {
  const [banners, setBanners] = useState([]);
  const [form, setForm] = useState({ title: "", subtitle: "", description: "" });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    const { data, error } = await supabase.from("banners").select("*").order("created_at", { ascending: false });
    if (!error) setBanners(data);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };
  const uploadBannerImage = async (file) => {
    if (!file) return null;
    const ext = file.name.split(".").pop();
    const fileName = `banner-${Date.now()}.${ext}`;
    const filePath = `banners/${fileName}`;

    const { data, error } = await supabase.storage
      .from("products") 
      .upload(filePath, file);

    if (error) throw error;

    const { data: urlData } = supabase.storage.from("products").getPublicUrl(filePath);
    return urlData.publicUrl;
  };


  const handleAddBanner = async (e) => {
    e.preventDefault();
    if (!file) return alert("select image");
    setLoading(true);

    try {
      const publicUrl = await uploadBannerImage(file);

      const { error: dbError } = await supabase
        .from("banners")
        .insert([{ ...form, image_url: publicUrl }]);

      if (dbError) throw dbError;

      alert("Banner added successfully! 🎉");
      setForm({ title: "", subtitle: "", description: "" });
      setFile(null);
      setPreview(null); 
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteBanner = async (id) => {
    if (!confirm("Are you sure you want to delete this banner?")) return;
    const { error } = await supabase.from("banners").delete().eq("id", id);
    if (!error) {
      fetchBanners();
    } else {
      alert("Error deleting banner");
    }
  };

  return (
    <div className="container py-5 font-sans">
      <h2 className="mb-4 uppercase fw-bold border-bottom pb-2">Manage Store Banners</h2>

      {/* --- Add Form --- */}
      <form onSubmit={handleAddBanner} className="card p-4 shadow-sm mb-5 bg-light">
        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="fw-bold small mb-1">BANNER TITLE</label>
            <input type="text" required value={form.title} placeholder="e.g. KAIRA FASHION"
              onChange={(e) => setForm({ ...form, title: e.target.value })} className="form-control" />
          </div>
          <div className="col-md-6 mb-3">
            <label className="fw-bold small mb-1">SUBTITLE</label>
            <input type="text" value={form.subtitle} placeholder="e.g. New Arrival 2026"
              onChange={(e) => setForm({ ...form, subtitle: e.target.value })} className="form-control" />
          </div>
          <div className="col-md-12 mb-3">
            <label className="fw-bold small mb-1">DESCRIPTION</label>
            <textarea value={form.description} placeholder="Short banner detail..."
              onChange={(e) => setForm({ ...form, description: e.target.value })} className="form-control" rows="2" />
          </div>
          <div className="col-md-12 mb-3">
            <label className="fw-bold small mb-1">SELECT BANNER IMAGE</label>
            <input type="file" accept="image/*" required onChange={handleFileChange} className="form-control" />
            {preview && (
              <div className="mt-3 position-relative d-inline-block">
                <img src={preview} alt="Preview" style={{ height: "150px", borderRadius: "8px" }} className="border" />
                <button type="button" onClick={() => { setFile(null); setPreview(null); }}
                  className="btn btn-danger btn-sm position-absolute top-0 end-0 m-1">✕</button>
              </div>
            )}
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn btn-dark w-100 fw-bold uppercase mt-2">
          {loading ? "Uploading to Kaira Store..." : "Add New Banner"}
        </button>
      </form>

      {/* --- Banners List --- */}
      <h4 className="mb-3 fw-bold">Live Banners</h4>
      <div className="row">
        {banners.map((b) => (
          <div key={b.id} className="col-md-4 mb-4">
            <div className="card h-100 shadow-sm overflow-hidden">
              <img src={b.image_url} alt={b.title} className="card-img-top" style={{ height: "180px", objectFit: "cover" }} />
              <div className="card-body">
                <h6 className="fw-bold mb-1">{b.title}</h6>
                <p className="text-muted small mb-3">{b.subtitle}</p>
                <button onClick={() => deleteBanner(b.id)} className="btn btn-outline-danger btn-sm w-100">Delete Banner</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}