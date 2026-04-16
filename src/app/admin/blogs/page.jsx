"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Swal from "sweetalert2";

export default function BlogList() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // blog fatch
  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("blogs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBlogs(data || []);
    } catch (err) {
      console.error("Error fetching blogs:", err);
      Swal.fire("Error", "Failed to load blogs", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  // blog delat
  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (confirm.isConfirmed) {
      try {
        const response = await fetch(`/api/admin/blogs/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) throw new Error("Failed to delete");

        Swal.fire("Deleted!", "Blog has been deleted.", "success");
        fetchBlogs(); 
      } catch (err) {
        Swal.fire("Error", err.message, "error");
      }
    }
  };

  // sarch filter
  const filteredBlogs = blogs.filter((blog) =>
    blog.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12 px-md-4">
          
          {/* Header Section */}
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 bg-white p-3 rounded shadow-sm gap-3">
            <div>
              <h2 className="fw-bold m-0">📰 Manage Blogs</h2>
              <p className="text-muted m-0">Create, edit, and manage your fashion stories</p>
            </div>
            <Link href="/admin/blogs/add" className="btn btn-dark fw-bold px-4">
              + Add New Blog
            </Link>
          </div>

          {/* Search and Table Card */}
          <div className="card border-0 shadow-sm rounded">
            <div className="card-body p-0">
              <div className="p-3 border-bottom">
                <div className="input-group" style={{ maxWidth: "400px" }}>
                  <span className="input-group-text bg-white border-end-0">
                    🔍
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0 shadow-none"
                    placeholder="Search by title..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-4">Image</th>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th className="text-end pe-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="6" className="text-center py-5">
                          <div className="spinner-border spinner-border-sm text-dark me-2"></div>
                          Loading blogs...
                        </td>
                      </tr>
                    ) : filteredBlogs.length > 0 ? (
                      filteredBlogs.map((blog) => (
                        <tr key={blog.id}>
                          <td className="ps-4">
                            <img
                              src={blog.image_url || "https://via.placeholder.com/50"}
                              alt="blog"
                              className="rounded shadow-sm"
                              style={{ width: "50px", height: "50px", objectFit: "cover" }}
                            />
                          </td>
                          <td>
                            <div className="fw-bold text-dark">{blog.title}</div>
                            <small className="text-muted d-block text-truncate" style={{ maxWidth: "200px" }}>
                              {blog.description}
                            </small>
                          </td>
                          <td>
                            <span className="badge bg-light text-dark border">
                              {blog.category}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${blog.status === "published" ? "bg-success-subtle text-success" : "bg-warning-subtle text-warning"} px-3 py-2 rounded-pill text-capitalize`}>
                              {blog.status}
                            </span>
                          </td>
                          <td>{new Date(blog.created_at).toLocaleDateString()}</td>
                          <td className="text-end pe-4">
                            <div className="d-flex justify-content-end gap-2">
                              <Link
                                href={`/admin/blogs/edit/${blog.id}`}
                                className="btn btn-sm btn-outline-primary"
                                title="Edit"
                              >
                                ✏️
                              </Link>
                              <button
                                onClick={() => handleDelete(blog.id)}
                                className="btn btn-sm btn-outline-danger"
                                title="Delete"
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center py-5 text-muted">
                          No blogs found. Start by creating one!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}