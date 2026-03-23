"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function ProductList() {

  const [products, setProducts] = useState([]);

  const getProducts = async () => {

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) {
      setProducts(data);
    }

  };

  const deleteProduct = async (id) => {

    const confirmDelete = confirm("Delete this product?");

    if (!confirmDelete) return;

    await supabase
      .from("products")
      .delete()
      .eq("id", id);

    getProducts();

  };

  const toggleStatus = async (id, status) => {

    await supabase
      .from("products")
      .update({ status: !status })
      .eq("id", id);

    getProducts();

  };

  useEffect(() => {
    getProducts();
  }, []);

  return (

    <div className="container py-5">

      <div className="d-flex justify-content-between mb-4">

        <h2>Product List</h2>

        <Link
          href="/admin/product/add"
          className="btn btn-primary"
        >
          Add Product
        </Link>

      </div>

      <div className="table-responsive">

        <table className="table table-bordered table-hover">

          <thead className="table-dark">

            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Brand</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th width="200">Action</th>
            </tr>

          </thead>

          <tbody>

            {products?.map((p) => (

              <tr key={p.id}>

                <td>

                  <img
                    src={p.image1}
                    width="60"
                    height="60"
                    style={{objectFit:"cover"}}
                  />

                </td>

                <td>{p.name}</td>

                <td>{p.brand}</td>

                <td>₹{p.price}</td>

                <td>{p.stock}</td>

                <td>

                  {p.status ? (

                    <span className="badge bg-success">
                      Active
                    </span>

                  ) : (

                    <span className="badge bg-danger">
                      Inactive
                    </span>

                  )}

                </td>

                <td>

                  <Link
                    href={`/admin/product/edit/${p.id}`}
                    className="btn btn-warning btn-sm me-2"
                  >
                    Edit
                  </Link>

                  <button
                    onClick={() => deleteProduct(p.id)}
                    className="btn btn-danger btn-sm me-2"
                  >
                    Delete
                  </button>

                  <button
                    onClick={() => toggleStatus(p.id, p.status)}
                    className="btn btn-secondary btn-sm"
                  >
                    {p.status ? "Deactivate" : "Activate"}
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>

  );
}