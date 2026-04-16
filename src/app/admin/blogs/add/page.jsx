"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import Link from "next/link";

export default function AddBlog() {
  const router = useRouter();
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Supabase Storage in upload
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

      const response = await fetch("/api/admin/blogs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        
        body: JSON.stringify({
          ...formData,
          image_url: formData.image_url || null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.details || "Failed to create blog");
      }

      Swal.fire("Success!", "Blog created successfully!", "success");
      router.push("/admin/blogs");
    } catch (err) {
      console.error("Submit error:", err);
      Swal.fire("Error", err.message || "Failed to create blog", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-fluid py-4" style={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}>
      <div className="row justify-content-center">
        <div className="col-lg-8 col-12 px-md-4">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4 bg-white p-3 rounded shadow-sm">
            <h2 className="fw-bold m-0" style={{ fontSize: "1.5rem" }}>✍️ Add New Blog</h2>
            <Link href="/admin/blogs" className="btn btn-outline-secondary btn-sm">
              ← Back to Blogs
            </Link>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow-sm mb-5">
            {/* Title */}
            <div className="mb-3">
              <label className="form-label fw-bold">Title *</label>
              <input
                type="text"
                className="form-control shadow-sm"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter blog title..."
                required
              />
            </div>

            {/* Description */}
            <div className="mb-3">
              <label className="form-label fw-bold">Description</label>
              <textarea
                className="form-control shadow-sm"
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
                className="form-control shadow-sm"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                placeholder="Write the full blog content here..."
                rows="10"
                style={{ fontFamily: "sans-serif" }}
                required
              />
              <small className="text-muted">Supports plain text</small>
            </div>

            {/* Category & Status Row */}
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label fw-bold">Category</label>
                <select
                  className="form-select shadow-sm"
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
              <div className="col-md-6">
                <label className="form-label fw-bold">Status</label>
                <div className="d-flex gap-3 mt-2">
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
                    <label className="form-check-label" htmlFor="statusDraft">Draft</label>
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
                    <label className="form-check-label" htmlFor="statusPublished">Published</label>
                  </div>
                </div>
              </div>
            </div>

            {/* Image Upload */}
            <div className="mb-4">
              <label className="form-label fw-bold">Featured Image</label>
              <div className="border border-2 border-dashed rounded p-4 text-center bg-light">
                {imagePreview ? (
                  <div className="mb-2">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="img-fluid rounded shadow-sm"
                      style={{ maxHeight: "250px" }}
                    />
                    <p className="text-muted small mt-2">Click to change image</p>
                  </div>
                ) : (
                  <div className="py-3">
                    <p className="text-muted m-0">📁 Click 'Choose File' to upload image</p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="form-control mt-2 shadow-sm"
                />
              </div>
              <small className="text-muted">Recommended: JPG, PNG, or WebP (Max 5MB)</small>
            </div>

            {/* Submit Buttons */}
            <div className="d-flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-dark flex-grow-1 py-2 fw-bold"
              >
                {submitting ? (
                  <><span className="spinner-border spinner-border-sm me-2"></span>Creating...</>
                ) : (
                  "✓ Create Blog Post"
                )}
              </button>
              <Link href="/admin/blogs" className="btn btn-light border flex-grow-1 py-2 fw-bold">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
