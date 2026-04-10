"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { AiOutlineEdit, AiOutlineDelete } from "react-icons/ai";
import Swal from "sweetalert2";

export default function BlogsList() {
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchBlogs();
  }, []);

  // Search logic
  useEffect(() => {
    const filtered = blogs.filter((item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredBlogs(filtered);
    setCurrentPage(1);
  }, [searchQuery, blogs]);

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

  const deleteBlog = async (id, imageUrl) => {
    const result = await Swal.fire({
      title: "Delete Blog?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, Delete!",
    });

    if (!result.isConfirmed) return;

    try {
      // Delete image from storage if exists
      if (imageUrl) {
        const urlParts = imageUrl.split("/object/public/products/")[1];
        if (urlParts) {
          await supabase.storage.from("products").remove([urlParts]);
        }
      }

      // Delete blog from database
      const { error } = await supabase.from("blogs").delete().eq("id", id);

      if (error) throw error;

      Swal.fire("Deleted!", "Blog has been deleted.", "success");
      fetchBlogs();
    } catch (err) {
      console.error("Delete error:", err);
      Swal.fire("Error", "Failed to delete blog", "error");
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredBlogs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredBlogs.length / itemsPerPage);

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
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between mb-4 align-items-center gap-3">
        <h2 className="fw-bold m-0">📚 Blog Management</h2>
        <div className="d-flex gap-2 w-100" style={{ maxWidth: "400px" }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Link href="/admin/blogs/add" className="btn btn-dark text-nowrap">
            + Add Blog
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="table-responsive shadow-sm rounded">
        <table className="table table-hover align-middle bg-white">
          <thead className="table-light">
            <tr>
              <th style={{ width: "50px" }}>No.</th>
              <th style={{ width: "80px" }}>Image</th>
              <th>Title</th>
              <th style={{ width: "120px" }}>Category</th>
              <th style={{ width: "100px" }}>Status</th>
              <th style={{ width: "150px" }}>Date</th>
              <th style={{ width: "120px" }} className="text-end">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((blog, index) => (
                <tr key={blog.id}>
                  <td>
                    <strong>{indexOfFirstItem + index + 1}</strong>
                  </td>
                  <td>
                    {blog.image_url ? (
                      <img
                        src={blog.image_url}
                        alt={blog.title}
                        style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "4px" }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "60px",
                          height: "60px",
                          backgroundColor: "#e9ecef",
                          borderRadius: "4px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "12px",
                          color: "#6c757d",
                        }}
                      >
                        No Image
                      </div>
                    )}
                  </td>
                  <td>
                    <strong className="text-dark">{blog.title}</strong>
                    <br />
                    <small className="text-muted">{blog.description?.substring(0, 50)}...</small>
                  </td>
                  <td>
                    <span className="badge bg-info text-dark">{blog.category || "Uncategorized"}</span>
                  </td>
                  <td>
                    <span
                      className={`badge ${blog.status === "published" ? "bg-success" : "bg-warning text-dark"}`}
                    >
                      {blog.status?.charAt(0).toUpperCase() + blog.status?.slice(1) || "Draft"}
                    </span>
                  </td>
                  <td>
                    <small>{new Date(blog.created_at).toLocaleDateString()}</small>
                  </td>
                  <td className="text-end">
                    <Link
                      href={`/admin/blogs/edit/${blog.id}`}
                      className="btn btn-sm btn-warning me-2"
                      title="Edit"
                    >
                      <AiOutlineEdit />
                    </Link>
                    <button
                      onClick={() => deleteBlog(blog.id, blog.image_url)}
                      className="btn btn-sm btn-danger"
                      title="Delete"
                    >
                      <AiOutlineDelete />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-4">
                  <p className="text-muted m-0">No blogs found. Create your first blog!</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav aria-label="Page navigation" className="mt-4">
          <ul className="pagination justify-content-center">
            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <button
                className="page-link"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                First
              </button>
            </li>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <li
                key={page}
                className={`page-item ${currentPage === page ? "active" : ""}`}
              >
                <button
                  className="page-link"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              </li>
            ))}
            <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
              <button
                className="page-link"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                Last
              </button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
}
