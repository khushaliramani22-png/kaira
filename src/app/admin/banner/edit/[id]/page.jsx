"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useParams } from "next/navigation";

export default function EditBanner() {
  const { id } = useParams();
  const router = useRouter();

  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    description: "",
    image_url: ""
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) fetchBannerData();
  }, [id]);

  const fetchBannerData = async () => {
    const { data, error } = await supabase
      .from("banners")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      alert("ડેટા મેળવવામાં ભૂલ આવી: " + error.message);
    } else {
      setForm(data);
      setPreview(data.image_url);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  // ઈમેજ અપલોડ કરવાનું સુધારેલું ફંક્શન
  const uploadImage = async (file) => {
    if (!file) return form.image_url;
    
    const ext = file.name.split(".").pop();
    const fileName = `banner-${Date.now()}.${ext}`;

    // નોંઘ: અહીં 'banners/' પાથ હટાવી દીધો છે જેથી 400 એરર ન આવે
    const { data, error } = await supabase.storage
      .from("products") 
      .upload(fileName, file);

    if (error) {
      console.error("Storage Error Details:", error);
      throw error;
    }

    const { data: urlData } = supabase.storage
      .from("products")
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const finalImageUrl = file ? await uploadImage(file) : form.image_url;

      const { error } = await supabase
        .from("banners")
        .update({
          title: form.title,
          subtitle: form.subtitle,
          description: form.description,
          image_url: finalImageUrl,
        })
        .eq("id", id);

      if (error) throw error;

      alert("Banner Updated Successfully! ✅");
      router.push("/admin/banner"); 
    } catch (err) {
      console.error("Full Error Object:", err);
      alert("Error: " + (err.message || "error."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold uppercase">Edit Banner</h2>
        <button className="btn btn-outline-secondary btn-sm" onClick={() => router.back()}>
          Back to List
        </button>
      </div>

      <form onSubmit={handleUpdate} className="card p-4 shadow-sm bg-light border-0">
        <div className="mb-3">
          <label className="fw-bold small mb-1">BANNER TITLE</label>
          <input 
            className="form-control" 
            value={form.title} 
            onChange={(e) => setForm({...form, title: e.target.value})} 
            required 
          />
        </div>
        
        <div className="mb-3">
          <label className="fw-bold small mb-1">SUBTITLE</label>
          <input 
            className="form-control" 
            value={form.subtitle} 
            onChange={(e) => setForm({...form, subtitle: e.target.value})} 
          />
        </div>

        <div className="mb-3">
          <label className="fw-bold small mb-1">DESCRIPTION</label>
          <textarea 
            className="form-control" 
            rows="3"
            value={form.description} 
            onChange={(e) => setForm({...form, description: e.target.value})} 
          />
        </div>

        <div className="mb-4">
          <label className="fw-bold small mb-1">BANNER IMAGE</label>
          <input type="file" accept="image/*" onChange={handleFileChange} className="form-control mb-3" />
          
          <div className="rounded border bg-white overflow-hidden" style={{ height: "250px", position: "relative" }}>
            {preview ? (
              <img src={preview} alt="Preview" className="w-100 h-100" style={{ objectFit: "cover" }} />
            ) : (
              <div className="h-100 d-flex align-items-center justify-content-center text-muted italic">
                No preview available
              </div>
            )}
          </div>
        </div>

        <div className="d-grid gap-2">
          <button type="submit" className="btn btn-dark fw-bold py-2" disabled={loading}>
            {loading ? (
              <span className="spinner-border spinner-border-sm me-2"></span>
            ) : null}
            {loading ? "SAVING CHANGES..." : "UPDATE BANNER"}
          </button>
        </div>
      </form>
    </div>
  );
}