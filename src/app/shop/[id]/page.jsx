"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useCart } from "@/app/context/CartContext";
import {
  AiOutlineShoppingCart,
  AiOutlineHeart,
  AiFillHeart,
} from "react-icons/ai";

// કલર મેપિંગ
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

  // ૧. મુખ્ય useEffect: ડેટા ફેચિંગ
  useEffect(() => {
    const loadProductData = async () => {
      try {
        // પ્રોડક્ટ ડેટા ફેચ કરો (price, old_price, discount બધું જ select(*) માં આવી જશે)
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

        // વેરિઅન્ટ્સ ફેચ કરવાનું લોજિક
        if (prod.group_id) {
          const { data: variants } = await supabase
            .from("products")
            .select("id, color, image1")
            .eq("group_id", prod.group_id);

          if (variants && variants.length > 0) {
            setRelatedVariants(variants);
          } else {
            setRelatedVariants([{ id: prod.id, color: prod.color, image1: prod.image1 }]);
          }
        } else {
          // જો group_id ન હોય તો સિંગલ બટન બતાવવા માટે
          setRelatedVariants([{ id: prod.id, color: prod.color, image1: prod.image1 }]);
        }

        // યુઝર સેશન અને વિઝલિસ્ટ સ્ટેટસ
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const currentUserId = session.user.id;
          setUserId(currentUserId);

          const { data: wishlistData } = await supabase
            .from("wishlist")
            .select("*")
            .eq("user_id", currentUserId)
            .eq("product_id", id)
            .single();

          setIsWishlisted(!!wishlistData);
        }
      } catch (err) {
        console.error("Error:", err.message);
      }
    };

    if (id) {
      loadProductData();
    }
  }, [id]);

  // ૨. Wishlist Toggle
  const toggleWishlist = async () => {
    if (!userId) { alert("Please login first!"); return; }
    try {
      if (isWishlisted) {
        await supabase.from("wishlist").delete().eq("user_id", userId).eq("product_id", id);
        setIsWishlisted(false);
      } else {
        await supabase.from("wishlist").insert([{ user_id: userId, product_id: id }]);
        setIsWishlisted(true);
      }
    } catch (err) { console.error("Wishlist error:", err.message); }
  };

  // ૩. Cart Update
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
        {/* ઈમેજ સેક્શન */}
        <div className="col-12 col-md-6">
          <div className="card border-0 shadow-sm mb-3 rounded-4 overflow-hidden">
            <img src={mainImage} className="img-fluid w-100" alt={product.name} style={{ minHeight: "450px", maxHeight: "600px", objectFit: "cover" }} />
          </div>
          <div className="d-flex gap-2 overflow-auto pb-2">
            {[product.image1, product.image2, product.image3].filter(Boolean).map((img, i) => (
              <img key={i} src={img} onClick={() => setMainImage(img)} className={`img-thumbnail rounded-3 ${mainImage === img ? "border-dark border-2 shadow-sm" : ""}`} style={{ width: "75px", height: "75px", cursor: "pointer", objectFit: "cover", flexShrink: 0 }} />
            ))}
          </div>
        </div>

        {/* ડિટેલ્સ સેક્શન */}
        <div className="col-12 col-md-6">
          <p className="text-muted text-uppercase small mb-1">{product.brand || "KAIRA"}</p>
          <h2 className="fw-bold mb-2 h3">{product.name}</h2>

          {/* કિંમત અને ડિસ્કાઉન્ટ સેક્શન */}
          <div className="d-flex align-items-center mb-4">
            {product.old_price && (
              <span className="text-muted text-decoration-line-through me-2" style={{ fontSize: '1.1rem' }}>
                ₹{product.old_price}
              </span>
            )}
            <h3 className="text-dark fw-bold mb-0">₹{product.price}</h3>
            {product.discount && (
              <span className="badge bg-success ms-3 small">
                {product.discount}% OFF
              </span>
            )}
          </div>

          {/* કલર સિલેક્શન */}
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

          {/* સાઈઝ સિલેક્શન */}
          <div className="mb-4">
            <h6 className="fw-bold mb-3">Select Size:</h6>
            <div className="d-flex gap-2 flex-wrap">
              {product.size?.map((size) => (
                <button key={size} onClick={() => setSelectedSize(size)} className={`btn px-4 py-2 fw-medium ${selectedSize === size ? "btn-dark" : "btn-outline-dark"}`}>{size}</button>
              ))}
            </div>
          </div>

          {/* સ્ટોક સ્ટેટસ */}
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

          {/* એક્શન બટન્સ */}
          {/* એક્શન બટન્સ અને સ્ટોક સ્ટેટસ */}
          <div className="mb-4">
            {/* સ્ટોક મેસેજ */}
            <div className="mb-2">
              {product.stock > 0 ? (
                <span className={`small fw-bold ${product.stock <= 5 ? "text-warning" : "text-success"}`}>
                  {product.stock <= 5 ? `⚠️ Only ${product.stock} units left!` : "✓ In Stock"}
                </span>
              ) : (
                <span className="small fw-bold text-danger">✕ Out of Stock</span>
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
          <div className="accordion accordion-flush border-top mt-4" id="productAccordion">
            <div className="accordion-item">
              <h2 className="accordion-header">
                <button className="accordion-button fw-bold text-uppercase px-0 bg-transparent shadow-none" type="button" data-bs-toggle="collapse" data-bs-target="#collapseDesc">Description</button>
              </h2>
              <div id="collapseDesc" className="accordion-collapse collapse show" data-bs-parent="#productAccordion">
                <div className="accordion-body px-0 py-2 text-muted small" style={{ whiteSpace: "pre-wrap" }}>{product.description || "No description available."}</div>
              </div>
            </div>
            {product.size_fit && (
              <div className="accordion-item">
                <h2 className="accordion-header">
                  <button className="accordion-button collapsed fw-bold text-uppercase px-0 bg-transparent shadow-none" type="button" data-bs-toggle="collapse" data-bs-target="#collapseSize">Size and Fit</button>
                </h2>
                <div id="collapseSize" className="accordion-collapse collapse" data-bs-parent="#productAccordion">
                  <div className="accordion-body px-0 py-2 text-muted small" style={{ whiteSpace: "pre-wrap" }}>{product.size_fit}</div>
                </div>
              </div>
            )}

            {product.fabric_care && (
              <div className="accordion-item">
                <h2 className="accordion-header">
                  <button className="accordion-button collapsed fw-bold text-uppercase px-0 bg-transparent shadow-none" type="button" data-bs-toggle="collapse" data-bs-target="#collapseFabric">Fabric and Care</button>
                </h2>
                <div id="collapseFabric" className="accordion-collapse collapse" data-bs-parent="#productAccordion">
                  <div className="accordion-body px-0 py-2 text-muted small" style={{ whiteSpace: "pre-wrap" }}>{product.fabric_care}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}