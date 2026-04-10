"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useParams } from "next/navigation";
import Swal from "sweetalert2";
import Link from "next/link";

export default function EditBlog() {
  const router = useRouter();
  const params = useParams();
  const blogId = params.id;

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

      setFormData({
        title: data.title,
        description: data.description,
        content: data.content,
        category: data.category,
        status: data.status,
        image_url: data.image_url,
      });

      if (data.image_url) {
        setImagePreview(data.image_url);
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

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload to Supabase
    try {
      const timestamp = Date.now();
      const fileName = `blogs/${timestamp}-${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("products")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("products").getPublicUrl(fileName);

      setFormData((prev) => ({ ...prev, image_url: urlData.publicUrl }));
      Swal.fire("Success", "Image uploaded successfully!", "success");
    } catch (err) {
      console.error("Upload error:", err);
      Swal.fire("Error", "Failed to upload image", "error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      Swal.fire("Error", "Title is required", "error");
      return;
    }
    if (!formData.content.trim()) {
      Swal.fire("Error", "Content is required", "error");
      return;
    }

    try {
      setSubmitting(true);

      const { error } = await supabase
        .from("blogs")
        .update({
          title: formData.title,
          description: formData.description,
          content: formData.content,
          category: formData.category,
          status: formData.status,
          image_url: formData.image_url,
        })
        .eq("id", blogId);

      if (error) throw error;

      Swal.fire("Success!", "Blog updated successfully!", "success");
      router.push("/admin/blogs");
    } catch (err) {
      console.error("Submit error:", err);
      Swal.fire("Error", err.message || "Failed to update blog", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "400px" }}>
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
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="fw-bold m-0">✏️ Edit Blog</h2>
            <Link href="/admin/blogs" className="btn btn-secondary btn-sm">
              ← Back to Blogs
            </Link>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow-sm">
            {/* Title */}
            <div className="mb-3">
              <label className="form-label fw-bold">Title *</label>
              <input
                type="text"
                className="form-control"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter blog title..."
              />
            </div>

            {/* Description */}
            <div className="mb-3">
              <label className="form-label fw-bold">Description</label>
              <textarea
                className="form-control"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Brief description of the blog..."
                rows="2"
              />
            </div>

            {/* Content */}
            <div className="mb-3">
              <label className="form-label fw-bold">Content *</label>
              <textarea
                className="form-control"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                placeholder="Write the full blog content here..."
                rows="8"
                style={{ fontFamily: "monospace" }}
              />
              <small className="text-muted">Supports plain text and basic formatting</small>
            </div>

            {/* Category */}
            <div className="mb-3">
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

            {/* Image Upload */}
            <div className="mb-3">
              <label className="form-label fw-bold">Featured Image</label>
              <div className="border-2 border-dashed border-gray-300 rounded p-3 text-center bg-light">
                {imagePreview ? (
                  <div>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      style={{ maxHeight: "200px", marginBottom: "10px" }}
                    />
                    <p className="text-muted small m-0">Click to change image</p>
                  </div>
                ) : (
                  <p className="text-muted m-0">📁 Click to upload image</p>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="form-control"
                  style={{ cursor: "pointer" }}
                />
              </div>
              <small className="text-muted">JPG, PNG, or WebP. Max 5MB</small>
            </div>

            {/* Status */}
            <div className="mb-4">
              <label className="form-label fw-bold">Status</label>
              <div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="status"
                    value="draft"
                    checked={formData.status === "draft"}
                    onChange={handleInputChange}
                    id="statusDraft"
                  />
                  <label className="form-check-label" htmlFor="statusDraft">
                    Draft (Not visible to visitors)
                  </label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="status"
                    value="published"
                    checked={formData.status === "published"}
                    onChange={handleInputChange}
                    id="statusPublished"
                  />
                  <label className="form-check-label" htmlFor="statusPublished">
                    Published (Visible to visitors)
                  </label>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="d-flex gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-dark flex-grow-1"
              >
                {submitting ? "Updating..." : "✓ Update Blog"}
              </button>
              <Link href="/admin/blogs" className="btn btn-secondary">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
