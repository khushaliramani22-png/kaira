"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function Products() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data } = await supabase
      .from("products")
      .select("*")
      .order("id", { ascending: false });

    if (data) {
      setProducts(data);
    }
  };

  const deleteProduct = async (id) => {
    const confirmDelete = confirm("Are you sure you want to delete this product?");
    if (!confirmDelete) return;

    await supabase.from("products").delete().eq("id", id);
    fetchProducts();
  };

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between mb-4 align-items-center">
        <h2 className="fw-bold">Products</h2>
        <Link href="/admin/products/add" className="btn btn-dark px-4">
          + Add Product
        </Link>
      </div>

      <div className="table-responsive shadow-sm rounded">
        <table className="table table-hover align-middle bg-white">
          <thead className="table-light">
            <tr>
              <th style={{ width: "50px" }}>No.</th>
              <th>Image</th>
              <th>Name</th>
              <th>Price</th>
              {/* નવી કોલમ્સ અહીં ઉમેરી */}
              <th>Size</th>
              <th>Color</th>
              <th>Stock</th>
              <th className="text-end">Action</th>
            </tr>
          </thead>

          <tbody>
            {products.length > 0 ? (
              products.map((item, index) => (
                <tr key={item.id}>
                  <td className="text-muted">{index + 1}</td>

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

                  {/* સાઈઝ અને કલરનો ડેટા બતાવવા માટે */}
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

                  <td className="text-end">
                    <Link
                      href={`/admin/products/edit/${item.id}`}
                      className="btn btn-outline-warning btn-sm me-2"
                    >
                      Edit
                    </Link>
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => deleteProduct(item.id)}
                    >
                      Delete
                    </button>
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
      </div>
    </div>
  );
}