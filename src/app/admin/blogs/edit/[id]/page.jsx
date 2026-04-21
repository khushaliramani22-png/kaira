"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useParams } from "next/navigation";
import Swal from "sweetalert2";
import Link from "next/link";

export default function EditBlog() {
  const router = useRouter();
  const params = useParams();
  const blogId = params.id; // આ UUID હોવો જોઈએ

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
    category: "Fashion",
    status: "draft",
    image_url: "",
  });

  useEffect(() => {
    if (blogId) {
      fetchBlog();
    }
  }, [blogId]);

  const fetchBlog = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("blogs")
        .select("*")
        .eq("id", blogId)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          title: data.title || "",
          description: data.description || "",
          content: data.content || "",
          category: data.category || "Fashion",
          status: data.status || "draft",
          image_url: data.image_url || "",
        });

        if (data.image_url) {
          setImagePreview(data.image_url);
        }
      }
    } catch (err) {
      console.error("Error fetching blog:", err);
      Swal.fire("Error", "Failed to load blog", "error");
      router.push("/admin/blogs");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;


    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

    try {
      const timestamp = Date.now();
      const fileName = `blogs/${timestamp}-${file.name.replace(/\s+/g, '-')}`;

      const { error: uploadError } = await supabase.storage
        .from("products")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("products").getPublicUrl(fileName);

      setFormData((prev) => ({ ...prev, image_url: urlData.publicUrl }));
      Swal.fire("Success", "Image uploaded successfully!", "success");
    } catch (err) {
      console.error("Upload error:", err);
      Swal.fire("Error", "Failed to upload image. Check storage bucket permissions.", "error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.content.trim()) {
      Swal.fire("Error", "Title and Content are required", "error");
      return;
    }

    try {
      setSubmitting(true);

      
      const { data: { user } } = await supabase.auth.getUser();


      const response = await fetch(`/api/admin/blogs/${blogId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          updated_at: new Date().toISOString(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update blog");
      }

      await Swal.fire("Success!", "Blog updated successfully!", "success");
      router.push("/admin/blogs");
      router.refresh(); 
    } catch (err) {
      console.error("Submit error:", err);
      Swal.fire("Error", err.message || "Failed to update blog", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
        <div className="spinner-border text-dark" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-lg-8 mx-auto">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="fw-bold m-0 text-dark">✏️ Edit Blog</h2>
            <Link href="/admin/blogs" className="btn btn-outline-secondary btn-sm">
              ← Back to Blogs
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow-sm border">
            {/* Title */}
            <div className="mb-3">
              <label className="form-label fw-bold">Title *</label>
              <input
                type="text"
                className="form-control"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* Description */}
            <div className="mb-3">
              <label className="form-label fw-bold">Short Description</label>
              <textarea
                className="form-control"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="2"
              />
            </div>

            {/* Content */}
            <div className="mb-3">
              <label className="form-label fw-bold">Blog Content *</label>
              <textarea
                className="form-control"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                rows="10"
                style={{ fontFamily: "inherit" }}
                required
              />
            </div>

            <div className="row mb-3">
              {/* Category */}
              <div className="col-md-6">
                <label className="form-label fw-bold">Category</label>
                <select
                  className="form-select"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                >
                  <option value="Fashion">Fashion</option>
                  <option value="Lifestyle">Lifestyle</option>
                  <option value="Trends">Trends</option>
                  <option value="Tips & Tricks">Tips & Tricks</option>
                  <option value="Care Guide">Care Guide</option>
                  <option value="News">News</option>
                </select>
              </div>

              {/* Status */}
              <div className="col-md-6">
                <label className="form-label fw-bold">Status</label>
                <select
                  className="form-select"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="draft">Draft (Private)</option>
                  <option value="published">Published (Public)</option>
                </select>
              </div>
            </div>

            {/* Image Upload */}
            <div className="mb-4">
              <label className="form-label fw-bold">Featured Image</label>
              <div className="border border-2 border-dashed rounded p-3 text-center bg-light">
                {imagePreview && (
                  <div className="mb-3">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="img-thumbnail"
                      style={{ maxHeight: "200px" }}
                    />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="form-control mt-2"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="d-flex gap-3 mt-4">
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-dark flex-grow-1 py-2 fw-bold"
              >
                {submitting ? "Updating..." : "Update Blog"}
              </button>
              <Link href="/admin/blogs" className="btn btn-light border px-4 py-2">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}