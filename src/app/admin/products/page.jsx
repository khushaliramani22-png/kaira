"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { AiOutlineEdit, AiOutlineDelete } from "react-icons/ai";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchProducts();
  }, []);

  // સર્ચ લોજિક: જ્યારે પણ સર્ચ ક્વેરી બદલાય ત્યારે લિસ્ટ ફિલ્ટર થશે
  useEffect(() => {
    const filtered = products.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredProducts(filtered);
    setCurrentPage(1);
  }, [searchQuery, products]);

  // const fetchProducts = async () => {
  //   const { data } = await supabase
  //     .from("products")
  //     .select("*")
  //     .order("id", { ascending: false });

  //   if (data) {
  //     setProducts(data);
  //   }
  // };
 const fetchProducts = async () => {
  setLoading(true);
  try {
    console.log("Fetching products from Supabase...");
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.error("Supabase Error:", error.message);
      return;
    }

    console.log("Data received from Supabase:", data);
    
    // જો ડેટા મળે તો સેટ કરો, નહીં તો ખાલી એરે
    if (data && data.length > 0) {
      setProducts(data);
    } else {
      setProducts([]);
      console.warn("No products found in the database table.");
    }
  } catch (err) {
    console.error("Unexpected fetch error:", err);
  } finally {
    setLoading(false);
  }
};
  const deleteProduct = async (id) => {
    const confirmDelete = confirm("Are you sure you want to delete this product?");
    if (!confirmDelete) return;

    const response = await fetch('/api/admin/products', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id }),
    });

    const result = await response.json();
    if (!response.ok || !result.success) {
      alert('Error deleting product: ' + (result.error || 'Unknown error'));
      return;
    }

    fetchProducts();
  };
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);


  return (
    <div className="container py-5">
      <div className="d-flex flex-column flex-md-row justify-content-between mb-4 align-items-center gap-3">
        <h2 className="fw-bold m-0">Products Listing</h2>
        <div className="d-flex gap-2 w-100" style={{ maxWidth: '400px' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Link href="/admin/products/add" className="btn btn-dark text-nowrap">+ Add New</Link>
        </div>
      </div>

      <div className="table-responsive shadow-sm rounded">
        <table className="table table-hover align-middle bg-white">
          <thead className="table-light">
            <tr>
              <th style={{ width: "50px" }}>No.</th>
              <th>Image</th>
              <th>Name</th>
              <th>Price</th>

              <th>Size</th>
              <th>Color</th>
              <th>Stock</th>
              <th className="text-end">Action</th>
            </tr>
          </thead>

          <tbody>
            {products.length > 0 ? (

              currentItems.map((item, index) => (
                <tr key={item.id}>
                  <td className="text-muted">{indexOfFirstItem + index + 1}</td>

                  <td>
                    {item.image1 ? (
                      <img
                        src={item.image1}
                        alt={item.name}
                        style={{
                          width: "50px",
                          height: "50px",
                          objectFit: "cover",
                          borderRadius: "8px",
                        }}
                      />
                    ) : (
                      <div
                        className="bg-light d-flex align-items-center justify-content-center"
                        style={{ width: "50px", height: "50px", borderRadius: "8px" }}
                      >
                        <small className="text-muted">No img</small>
                      </div>
                    )}
                  </td>

                  <td className="fw-medium">{item.name}</td>
                  <td>₹{item.price}</td>

          
                  <td className="text-muted small">
                    {item.size ? item.size : "—"}
                  </td>
                  <td className="text-muted small">
                    {item.color ? item.color : "—"}
                  </td>

                  <td>
                    {item.stock > 0 ? (
                      <span className="badge bg-success-subtle text-success">
                        {item.stock} in stock
                      </span>
                    ) : (
                      <span className="badge bg-danger-subtle text-danger">
                        Out of stock
                      </span>
                    )}
                  </td>

                
                  <td className="text-end pe-4">
                    <div className="d-flex justify-content-end gap-2">
                      {/* Edit Button */}
                      <Link
                        href={`/admin/products/edit/${item.id}`}
                        className="btn btn-sm btn-outline-dark"
                        title="Edit Product"
                      >
                        <AiOutlineEdit size={18} />
                      </Link>

                      {/* Delete Button */}
                      <button
                        onClick={() => deleteProduct(item.id)}
                        className="btn btn-sm btn-outline-danger"
                        title="Delete Product"
                      >
                        <AiOutlineDelete size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))

            ) : (
              <tr>
                <td colSpan="8" className="text-center py-4 text-muted">
                  loading...
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {totalPages > 1 && (
          <nav className="d-flex justify-content-between align-items-center mt-4">
            <ul className="pagination pagination-sm mb-0">
              <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)}>Previous</button>
              </li>
              <li className="page-item disabled"><span className="page-link text-dark">Page {currentPage} of {totalPages}</span></li>
              <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)}>Next</button>
              </li>
            </ul>
          </nav>
        )}
      </div>

    </div>
  );
}