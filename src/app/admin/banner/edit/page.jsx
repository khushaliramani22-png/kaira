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
      alert("error " + error.message);
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

  const uploadImage = async (file) => {
    if (!file) return form.image_url;
    
    const ext = file.name.split(".").pop();
    const fileName = `banner-update-${Date.now()}.${ext}`;
    const filePath = `banners/${fileName}`;

    const { error } = await supabase.storage
      .from("products")
      .upload(filePath, file);

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from("products")
      .getPublicUrl(filePath);

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
      console.error(err);
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <h2 className="mb-4">Edit Banner</h2>
      <form onSubmit={handleUpdate} className="card p-4 shadow-sm bg-light">
        <div className="mb-3">
          <label className="fw-bold">Title</label>
          <input 
            className="form-control" 
            value={form.title} 
            onChange={(e) => setForm({...form, title: e.target.value})} 
            required 
          />
        </div>
        
        <div className="mb-3">
          <label className="fw-bold">Subtitle</label>
          <input 
            className="form-control" 
            value={form.subtitle} 
            onChange={(e) => setForm({...form, subtitle: e.target.value})} 
          />
        </div>

        <div className="mb-3">
          <label className="fw-bold">Description</label>
          <textarea 
            className="form-control" 
            rows="3"
            value={form.description} 
            onChange={(e) => setForm({...form, description: e.target.value})} 
          />
        </div>

        <div className="mb-3">
          <label className="fw-bold d-block">Banner Image</label>
          <input type="file" accept="image/*" onChange={handleFileChange} className="form-control mb-3" />
          
          <div style={{ height: "200px", border: "1px solid #ddd", borderRadius: "8px", overflow: "hidden" }}>
            {preview ? (
              <img src={preview} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <div className="h-100 d-flex align-items-center justify-content-center text-muted">No Image</div>
            )}
          </div>
        </div>

        <div className="d-flex gap-2">
          <button type="submit" className="btn btn-dark flex-grow-1" disabled={loading}>
            {loading ? "Updating..." : "Update Banner"}
          </button>
          <button type="button" className="btn btn-outline-secondary" onClick={() => router.back()}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}