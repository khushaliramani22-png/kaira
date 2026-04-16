"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useCart } from "@/app/context/CartContext";
import { AiOutlineShoppingCart, AiOutlineHeart, AiFillHeart, AiFillStar, AiOutlineStar, AiOutlineDown, } from "react-icons/ai";
import { toast } from 'react-hot-toast';
import RelatedProduct from "@/components/RelatedProduct"
import { useSettings } from "@/hooks/useSettings";

// color meping
const colorMap = {
  "pink": "#DCAE96",
  "dusty pink": "#DCAE96",
  "black": "#1A1A1A",
  "white": "#FFFFFF",
  "blue": "#2E5090",
  "red": "#FF0000",
  "green": "#008000",
  "beige": "#F5F5DC",
  "olive": "#556B2F",
  "olive green": "#556B2F",
};

export default function ProductDetail() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const { refreshCartCount } = useCart();

  const [product, setProduct] = useState(null);
  const [userId, setUserId] = useState(null);
  const [relatedVariants, setRelatedVariants] = useState([]);
  const [mainImage, setMainImage] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [loading, setLoading] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // reviews states
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "", name: "" });
  const [reviewLoading, setReviewLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDescOpen, setIsDescOpen] = useState(false);
  const [isSizeOpen, setIsSizeOpen] = useState(false);
  const [isFabricOpen, setIsFabricOpen] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  const { snippets, loading: settingsLoading, error: settingsError } = useSettings();
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);


  useEffect(() => {
    const loadProductData = async () => {
      try {
        // ૧. Product data fetch
        const { data: prod, error } = await supabase
          .from("products")
          .select("*")
          .eq("id", id)
          .single();

        if (error || !prod) throw error;

        setProduct(prod);
        setMainImage(prod.image1);
        const colName = Array.isArray(prod.color) ? prod.color[0] : prod.color;
        setSelectedColor(colName);

        if (prod.size && prod.size.length > 0) {
          setSelectedSize(prod.size[0]);
        }

        // ૨. veriyant fetch
        if (prod.group_id) {
          const { data: variants } = await supabase
            .from("products")
            .select("id, color, image1")
            .eq("group_id", prod.group_id);
          setRelatedVariants(variants || []);
        } else {
          setRelatedVariants([{ id: prod.id, color: prod.color, image1: prod.image1 }]);
        }

        // ૩. riview fetch
        const { data: approvedReviews } = await supabase
          .from("product_reviews")
          .select("*")
          .eq("product_id", id)
          .eq("status", "approved")
          .order("created_at", { ascending: false });

        if (approvedReviews) setReviews(approvedReviews);

        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (currentSession?.user) {
          setUserId(currentSession.user.id);
          setUserEmail(currentSession.user.email);
          setNewReview(prev => ({ ...prev, name: currentSession.user.email }));

          const { data: wishlistData, error: wishlistError } = await supabase
            .from("wishlist")
            .select("*")
            .eq("user_id", currentSession.user.id)
            .eq("product_id", id)
            .maybeSingle();

          if (wishlistError) {
            console.error("Wishlist error:", wishlistError.message);
          }

          setIsWishlisted(!!wishlistData);
        }
      } catch (err) {
        console.error("Error:", err.message);
      }
    };

    if (id) loadProductData();
  }, [id]);



  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    // login chack
    if (!userId) {
      alert("Please login to submit a review!");
      router.push("/login");
      return;
    }

    if (!newReview.name || !newReview.comment) return alert("Please fill all fields");
    setReviewLoading(true);

    let imageUrl = null;

    try {
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `review-images/${Date.now()}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("products")
          .upload(fileName, selectedFile);

        if (uploadError) throw uploadError;

        const { data: publicData } = supabase.storage
          .from("products")
          .getPublicUrl(fileName);

        imageUrl = publicData.publicUrl;
      }
      const { error: insertError } = await supabase.from("product_reviews").insert([
        {
          product_id: id,
          customer_name: newReview.name,
          rating: newReview.rating,
          comment: newReview.comment,
          review_image: imageUrl,
          status: "pending",
          user_id: userId
        }
      ]);

      if (insertError) throw insertError;

      alert("Review submitted! Admin approval pending.");
      setNewReview({ rating: 5, comment: "", name: "" });
      setSelectedFile(null);
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setReviewLoading(false);
    }
  };
  const toggleWishlist = async () => {
    if (!userId) {
      toast.error("Please login first!");
      return;
    }

    try {
      if (isWishlisted) {

        const { error } = await supabase
          .from("wishlist")
          .delete()
          .eq("user_id", userId)
          .eq("product_id", id);

        if (error) throw error;

        setIsWishlisted(false);
        toast.success("Removed from Wishlist");
      } else {

        const { error } = await supabase
          .from("wishlist")
          .insert([{ user_id: userId, product_id: id }]);

        if (error) throw error;

        setIsWishlisted(true);
        toast.success("Added to Wishlist");
      }
    } catch (err) {
      console.error("Wishlist error:", err.message);
      toast.error("Something went wrong!");
    }
  };

  const updateCartInDB = async () => {
    if (!userId) { alert("Please login first!"); return; }
    setLoading(true);
    try {
      const { error } = await supabase.from("cart").upsert({
        product_id: id, user_id: userId, quantity: 1,
        price: product.price, name: product.name, image: product.image1,
        selected_size: selectedSize, selected_color: selectedColor,
      }, { onConflict: "product_id, user_id" });

      if (error) throw error;
      if (refreshCartCount) await refreshCartCount();
      router.push("/cart");
    } catch (error) { alert(error.message); }
    finally { setLoading(false); }
  };

  if (!product) return <div className="container py-5 text-center fw-bold">Loading...</div>;

  return (
    <div className="container py-4 py-md-5">
      <div className="row g-4 g-lg-5">
        {/* img section */}
        <div className="col-12 col-md-6">
          <div className="card border-0 shadow-sm mb-3 rounded-4 overflow-hidden">
            <img src={mainImage} className="img-fluid w-100" alt={product.name} style={{ minHeight: "450px", maxHeight: "600px", objectFit: "cover" }} />
          </div>
          <div className="d-flex gap-2 overflow-auto pb-2">
            {[product.image1, product.image2, product.image3].filter(Boolean).map((img, i) => (
              <img key={i} src={img} onClick={() => setMainImage(img)} className={`img-thumbnail rounded-3 ${mainImage === img ? "border-dark border-2 shadow-sm" : ""}`}
                style={{ width: "75px", height: "75px", cursor: "pointer", objectFit: "cover", flexShrink: 0 }} />
            ))}
          </div>
        </div>

        {/* detail section */}
        <div className="col-12 col-md-6">
          <p className="text-muted text-uppercase small mb-1">{product.brand || "KAIRA"}</p>
          <h2 className="fw-bold mb-2 h3">{product.name}</h2>

          {/*reting average display */}
          <div className="d-flex align-items-center gap-2 mb-3">
            <div className="bg-success text-white px-2 py-1 rounded small d-flex align-items-center gap-1 fw-bold">
              {reviews.length > 0 ? (reviews.reduce((a, b) => a + b.rating, 0) / reviews.length).toFixed(1) : "5.0"} <AiFillStar size={14} />
            </div>
            <span className="text-muted small">({reviews.length} Verified Reviews)</span>
          </div>

          <div className="d-flex align-items-center mb-4">
            {product.old_price && <span className="text-muted text-decoration-line-through me-2">₹{product.old_price}</span>}
            <h3 className="text-dark fw-bold mb-0">₹{product.price}</h3>
            {product.old_price && product.price && (
              <span className="badge bg-success ms-3">
                {Math.round(((product.old_price - product.price) / product.old_price) * 100)}% OFF
              </span>
            )}

          </div>



          {/*color selection */}
          <div className="mb-4">
            <h6 className="fw-bold mb-3">Available Colors:</h6>
            <div className="d-flex gap-3 flex-wrap">
              {relatedVariants.map((v) => {
                const variantColor = Array.isArray(v.color) ? v.color[0] : v.color;
                const isActive = id === v.id;
                const hexColor = colorMap[variantColor?.toLowerCase()] || "#ccc";
                return (
                  <button
                    key={v.id}
                    onClick={() => router.push(`/shop/${v.id}`)}
                    className={`rounded-circle border-2 ${isActive ? 'border-dark shadow-lg scale-110' : 'border-light-subtle'}`}
                    style={{ width: "42px", height: "42px", backgroundColor: hexColor, cursor: 'pointer', padding: '2px', transition: 'all 0.2s ease' }}
                  >
                    {isActive && <div className="w-100 h-100 rounded-circle border border-white" style={{ background: 'rgba(255,255,255,0.1)' }}></div>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* size selection */}
          <div className="mb-4">
            <h6 className="fw-bold mb-3">Select Size:</h6>
            <div className="d-flex gap-2 flex-wrap">
              {product.size?.map((size) => (
                <button key={size} onClick={() => setSelectedSize(size)} className={`btn px-4 py-2 fw-medium ${selectedSize === size ? "btn-dark" : "btn-outline-dark"}`}>{size}</button>
              ))}
            </div>
            {snippets.size_guide && !settingsLoading && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <button 
                  onClick={() => setIsSizeGuideOpen(!isSizeGuideOpen)}
                  className="text-blue-700 font-semibold text-sm hover:underline flex items-center gap-1 mb-2"
                >
                  📏 Size Guide {isSizeGuideOpen ? '−' : '+'}
                </button>
                {isSizeGuideOpen && (
                  <div 
                    className="text-sm text-gray-700 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: snippets.size_guide }} 
                  />
                )}
              </div>
            )}
          </div>


          {/* stock status */}
          <div className="mb-3">
            {product.stock > 0 ? (
              <div className="d-flex align-items-center gap-2">
                <span className={`badge ${product.stock <= 5 ? "bg-warning text-dark" : "bg-light text-success border"}`}>
                  {product.stock <= 5 ? `Only ${product.stock} left!` : "In Stock"}
                </span>
                {product.stock > 5 && <span className="text-muted small">({product.stock} units available)</span>}
              </div>
            ) : (
              <span className="badge bg-danger">Out of Stock</span>
            )}
          </div>


          {/*action button*/}
          <div className="mb-4">
            {/* stock msg */}
            <div className="mb-2">
              {product.stock > 0 ? (
                <span className={`small fw-bold ${product.stock <= 5 ? "text-warning" : "text-success"}`}>
                  {product.stock <= 5 ? `⚠️ Only ${product.stock} units left! ${snippets.out_of_stock || ''}` : "✓ In Stock"}
                </span>
              ) : (
                <span className="small fw-bold text-danger">
                  ✕ Out of Stock {snippets.out_of_stock || ''}
                </span>
              )}
            </div>


            <div className="d-flex gap-3">
              <button
                onClick={updateCartInDB}
                disabled={loading || product.stock <= 0}
                className={`btn btn-lg flex-grow-1 d-flex align-items-center justify-content-center gap-2 py-3 rounded-3 shadow-sm ${product.stock > 0 ? "btn-dark" : "btn-secondary opacity-50"
                  }`}
              >
                <AiOutlineShoppingCart size={22} />
                {loading ? "Adding..." : product.stock > 0 ? "Buy Now" : "Currently Unavailable"}
              </button>

              <button
                onClick={toggleWishlist}
                className={`btn btn-lg border rounded-3 px-3 ${isWishlisted ? "text-danger border-danger shadow-sm" : "text-muted"}`}
              >
                {isWishlisted ? <AiFillHeart size={24} /> : <AiOutlineHeart size={24} />}
              </button>
            </div>
          </div>
          {/* Accordion Details */}
          <div className="border-top mt-4">
            <div className="py-3 border-bottom">
              <button
                type="button"
                className="d-flex align-items-center justify-content-between w-100 text-dark text-start p-0 bg-transparent border-0"
                style={{ cursor: "pointer" }}
                onClick={() => setIsDescOpen((prev) => !prev)}
              >
                <span className="fw-bold text-uppercase">Description</span>
                <AiOutlineDown className={`transition-transform ${isDescOpen ? "rotate-180" : ""}`} />
              </button>
              {isDescOpen && (
                <div
                  className="mt-3 text-muted small ql-editor list-disc ml-5"
                  dangerouslySetInnerHTML={{ __html: product.description || "No description available." }}
                />
              )}
            </div>

            <div className="py-3 border-bottom">
              <button
                type="button"
                className="d-flex align-items-center justify-content-between w-100 text-dark text-start p-0 bg-transparent border-0"
                style={{ cursor: "pointer" }}
                onClick={() => setIsSizeOpen((prev) => !prev)}
              >
                <span className="fw-bold text-uppercase">Size and Fit</span>
                <AiOutlineDown className={`transition-transform ${isSizeOpen ? "rotate-180" : ""}`} />
              </button>
              {isSizeOpen && (
                <div
                  className="mt-3 text-muted small ql-editor list-disc ml-5"
                  dangerouslySetInnerHTML={{ __html: product.size_fit || "No size and fit information available." }}
                />
              )}
            </div>

            <div className="py-3 border-bottom">
              <button
                type="button"
                className="d-flex align-items-center justify-content-between w-100 text-dark text-start p-0 bg-transparent border-0"
                style={{ cursor: "pointer" }}
                onClick={() => setIsFabricOpen((prev) => !prev)}
              >
                <span className="fw-bold text-uppercase">Fabric and Care</span>
                <AiOutlineDown className={`transition-transform ${isFabricOpen ? "rotate-180" : ""}`} />
              </button>
              {isFabricOpen && (
                <div
                  className="mt-3 text-muted small ql-editor list-disc ml-5"
                  dangerouslySetInnerHTML={{ __html: product.fabric_care || "No fabric and care information available." }}
                />
              )}
            </div>
          </div>
          {/* --- REVIEW SECTION--- */}
          <div className="mt-5 border-top pt-4">
            <h5 className="fw-black uppercase italic mb-4">Customer Experience ({reviews.length})</h5>

            <div className="mb-5">
              {reviews.length > 0 ? reviews.map(rev => (
                <div key={rev.id} className="mb-4 border-bottom pb-3">
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <div className="text-warning d-flex">
                      {[...Array(5)].map((_, i) => i < rev.rating ? <AiFillStar key={i} /> : <AiOutlineStar key={i} />)}
                    </div>
                    <span className="fw-bold small">{rev.customer_name}</span>
                  </div>
                  <p className="text-muted small mb-1 italic">"{rev.comment}"</p>

                  {rev.review_image && (
                    <div className="mt-2">
                      <img src={rev.review_image} alt="Customer" className="rounded-3 shadow-sm" style={{ width: '100px', height: '100px', objectFit: 'cover' }} />
                    </div>
                  )}

                  <small className="text-muted d-block mt-1" style={{ fontSize: '10px' }}>
                    Verified Buyer • {new Date(rev.created_at).toLocaleDateString()}
                  </small>
                </div>
              )) : <p className="text-muted small italic">No reviews yet.</p>}
            </div>


            <div className="bg-light p-4 rounded-4 shadow-sm">
              {!userId ? (
                <div className="text-center py-2">
                  <p className="mb-3 small fw-bold text-muted uppercase tracking-wider">Login to share your experience</p>
                  <button onClick={() => router.push('/login')} className="btn btn-dark btn-sm rounded-pill px-4 fw-bold italic">
                    Login Now
                  </button>
                </div>
              ) : (
                <>
                  <h6 className="fw-bold mb-3 italic">Rate this outfit</h6>
                  <form onSubmit={handleReviewSubmit}>
                    <div className="mb-3 d-flex gap-2">
                      {[1, 2, 3, 4, 5].map(s => (
                        <AiFillStar key={s} size={24} onClick={() => setNewReview({ ...newReview, rating: s })} style={{ cursor: 'pointer', color: s <= newReview.rating ? '#FFC107' : '#D1D5DB' }} />
                      ))}
                    </div>
                    <input type="text" placeholder="Your Name" className="form-control mb-2 rounded-3 border-0 shadow-sm" required value={newReview.name} onChange={e => setNewReview({ ...newReview, name: e.target.value })} />
                    <textarea placeholder="Tell us about the fabric and fit..." className="form-control mb-2 rounded-3 border-0 shadow-sm" rows="3" required value={newReview.comment} onChange={e => setNewReview({ ...newReview, comment: e.target.value })}></textarea>

                    <div className="mb-3">
                      <label className="small fw-bold text-muted mb-1">Add Photo (Optional)</label>
                      <input type="file" accept="image/*" className="form-control form-control-sm rounded-3 border-0 shadow-sm" onChange={(e) => setSelectedFile(e.target.files[0])} />
                    </div>

                    <button disabled={reviewLoading} className="btn btn-dark w-100 rounded-pill fw-bold uppercase italic">
                      {reviewLoading ? "Submitting..." : "Post Review"}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      {product && (
        <div className="mt-5 pt-5">
          <RelatedProduct
            currentCategory={product.category}
            currentProductId={id}
          />
        </div>
      )}

    </div>
  );
}