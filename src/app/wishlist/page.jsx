"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { AiOutlineClose } from "react-icons/ai";

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const removeFromWishlist = async (id) => {
    const { error } = await supabase
      .from("wishlist")
      .delete()
      .eq("id", id);

    if (!error) {

      setWishlistItems((prev) => prev.filter((item) => item.id !== id));
    } else {
      console.error("Error removing item:", error.message);
    }
  };
  useEffect(() => {
    const fetchWishlist = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {

        const { data, error } = await supabase
          .from("wishlist")
          .select(`
                  id,
                  product_id,
                  products (
                    id,
                    name,
                    price,
                    image1
                  )
                `)
          .eq("user_id", user.id);

        if (!error) {
                  console.log("Data found:", data);
                  setWishlistItems(data || []);
                } else {
                  console.error("Error Detail:", error);
                }
              }
              setLoading(false);
            };

            fetchWishlist();
          }, []);

  if (loading) return <div className="text-center py-5">Loading...</div>;

  return (
    <div className="container py-5">
      <h2 className="mb-4">My Wishlist ❤️</h2>
      {wishlistItems.length === 0 ? (
        <div className="text-center">
          <p>Your wishlist is empty</p>
          <Link href="/shop" className="btn btn-primary">Shop Now</Link>
        </div>
      ) : (
        <div className="row">
          {wishlistItems.map((item) => (
            <div key={item.id} className="col-md-3 mb-4">

              <div className="card h-100 shadow-sm position-relative">


                <button
                  onClick={() => removeFromWishlist(item.id)}
                  className="btn btn-sm btn-light position-absolute top-0 end-0 m-2 shadow-sm"
                  style={{ borderRadius: "50%", zIndex: 10 }}
                  title="Remove"
                >
                  <AiOutlineClose size={16} className="text-danger" />
                </button>


                <img src={item.products?.image1} className="card-img-top" alt={item.products?.name} />
                <div className="card-body text-center">
                  <h6 className="card-title text-truncate">{item.products?.name}</h6>
                  <p className="text-primary fw-bold">₹{item.products?.price}</p>
                  <Link href={`/shop/${item.product_id}`} className="btn btn-sm btn-outline-dark w-100">
                    View Product
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}