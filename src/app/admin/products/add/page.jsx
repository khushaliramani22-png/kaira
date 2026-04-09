"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { AiOutlineDown } from "react-icons/ai";
import dynamic from 'next/dynamic';
const ReactQuill = dynamic(() => import('react-quill-new'), { 
  ssr: false,
  loading: () => <p>Loading Editor...</p>
});
import 'react-quill-new/dist/quill.snow.css';

export default function AddProduct() {
  const [product, setProduct] = useState({
    name: "", brand: "", gender: "", category: "",
    price: "", old_price: "", discount: "", stock: "",
    description: "",
    size_fit: "",      
    fabric_care: "",    
    image1: null, image2: null, image3: null,
  });

  // Quill Toolbar Config
  const modules = {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['clean']
    ],
  };


  // Multi-select mate state
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [preview1, setPreview1] = useState(null);
  const [preview2, setPreview2] = useState(null);
  const [preview3, setPreview3] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isDescOpen, setIsDescOpen] = useState(true);
  const [isSizeOpen, setIsSizeOpen] = useState(false);
  const [isFabricOpen, setIsFabricOpen] = useState(false);

  // Options
  const sizesOptions = ["S", "M", "L", "XL", "XXL"];
  const colorsOptions = ["Red", "Blue", "Black", "White", "Beige", "Green", "Pink","olive green"];

  const shopCategories = [
    "NEW ARRIVALS", "BESTSELLER", "FS WORK", "DRESSES", "CO-ORDS",
    "TOPS & SHIRTS", "TEES", "WAISTCOATS", "CAMIS & TANKS",
    "BLAZERS", "TROUSERS", "JEANS", "LIVIN PANTS", "SKIRTS & SKORTS"
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct({ ...product, [name]: value });
  };

  const toggleSelection = (item, list, setList) => {
    if (list.includes(item)) {
      setList(list.filter((i) => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleImageInput = (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    if (index === 1 && preview1) URL.revokeObjectURL(preview1);
    if (index === 2 && preview2) URL.revokeObjectURL(preview2);
    if (index === 3 && preview3) URL.revokeObjectURL(preview3);

    const previewUrl = URL.createObjectURL(file);
    setProduct({ ...product, [`image${index}`]: file });

    if (index === 1) setPreview1(previewUrl);
    if (index === 2) setPreview2(previewUrl);
    if (index === 3) setPreview3(previewUrl);
  };

  const uploadImage = async (file, index) => {
    if (!file) return null;
    const ext = file.name.split(".").pop();
    const fileName = `product-${Date.now()}-${index}.${ext}`;
    const filePath = `colorbox/${fileName}`;

    const { data, error } = await supabase.storage
      .from("products")
      .upload(filePath, file, { upsert: true });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from("products")
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  };

 const addProduct = async (e) => {
  e.preventDefault();
  setLoading(true);

    try {
      const imageUrls = {};
      for (let i = 1; i <= 3; i++) {
        const file = product[`image${i}`];
        imageUrls[`image${i}`] = file ? await uploadImage(file, i) : null;
      }

      const dataToInsert = {
        name: product.name,
        brand: product.brand,
        gender: product.gender.toLowerCase(),
        category: product.category,
        price: product.price ? Number(product.price) : null,
        old_price: product.old_price ? Number(product.old_price) : null,
        discount: product.discount ? Number(product.discount) : null,
        stock: product.stock ? Number(product.stock) : null,
        size: selectedSizes,
        color: selectedColors,
        description: product.description,
        size_fit: product.size_fit,       
        fabric_care: product.fabric_care, 
        image1: imageUrls.image1,
        image2: imageUrls.image2,
        image3: imageUrls.image3,
      };

      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToInsert),
      });

      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        const text = await response.text();
        console.error('Invalid JSON response from admin product API:', text);
        throw new Error(response.ok ? 'Invalid JSON response from server' : `Server error: ${response.status}`);
      }

      if (!response.ok || !result.success) {
        console.error('Supabase Error Details:', result.error);
        throw new Error(result.error || 'Failed to create product');
      }

      alert('Product Uploaded Successfully! ✅');

      setProduct({
        name: "", brand: "", gender: "", category: "",
        price: "", old_price: "", discount: "", stock: "",
        description: "", size_fit: "", fabric_care: "",
        image1: null, image2: null, image3: null,
      });
      setSelectedSizes([]);
      setSelectedColors([]);
      setPreview1(null); setPreview2(null); setPreview3(null);

    } catch (err) {
      console.error(err);
      alert("Error: " + (err.details || err.message || err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <h2 className="mb-4">Add New Product (Admin)</h2>
      <form onSubmit={addProduct}>
        <div className="row">
          <div className="col-md-6 mb-3">
            <input name="name" placeholder="Product Name" value={product.name} onChange={handleChange} className="form-control" required />
          </div>
          <div className="col-md-6 mb-3">
            <input name="brand" placeholder="Brand" value={product.brand} onChange={handleChange} className="form-control" />
          </div>
          <div className="col-md-6 mb-3">
            <select name="gender" value={product.gender} onChange={handleChange} className="form-control" required>
              <option value="">Select Gender</option>
              <option value="men">Men</option>
              <option value="women">Women</option>
              <option value="unisex">Unisex</option>
            </select>
          </div>
          <div className="col-md-6 mb-3">
            <select name="category" value={product.category} onChange={handleChange} className="form-control" required>
              <option value="">Select Category</option>
              {shopCategories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="col-md-4 mb-3">
            <input name="price" type="number" placeholder="Price" value={product.price} onChange={handleChange} className="form-control" />
          </div>
          <div className="col-md-4 mb-3">
            <input name="old_price" type="number" placeholder="Old Price" value={product.old_price} onChange={handleChange} className="form-control" />
          </div>
          <div className="col-md-4 mb-3">
            <input name="discount" type="number" placeholder="Discount %" value={product.discount} onChange={handleChange} className="form-control" />
          </div>
          <div className="col-md-4 mb-3">
            <input name="stock" type="number" placeholder="Stock" value={product.stock} onChange={handleChange} className="form-control" />
          </div>

          <div className="col-md-12 mb-3">
            <label className="fw-bold mb-2 d-block">Available Sizes:</label>
            <div className="d-flex gap-2 flex-wrap">
              {sizesOptions.map(s => (
                <button type="button" key={s}
                  className={`btn btn-sm ${selectedSizes.includes(s) ? 'btn-dark' : 'btn-outline-secondary'}`}
                  onClick={() => toggleSelection(s, selectedSizes, setSelectedSizes)}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="col-md-12 mb-3">
            <label className="fw-bold mb-2 d-block">Available Colors:</label>
            <div className="d-flex gap-2 flex-wrap">
              {colorsOptions.map(c => (
                <button type="button" key={c}
                  className={`btn btn-sm ${selectedColors.includes(c) ? 'btn-dark' : 'btn-outline-secondary'}`}
                  onClick={() => toggleSelection(c, selectedColors, setSelectedColors)}>
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* --- Accordion Details Inputs --- */}
        <div className="border-top mt-4">
          <div className="py-3 border-bottom">
            <button
              type="button"
              className="d-flex align-items-center justify-content-between w-100 text-dark text-start p-2 bg-transparent border-0"
              style={{ cursor: "pointer" }}
              onClick={() => setIsDescOpen((prev) => !prev)}
            >
              <span className="fw-bold text-uppercase">Description</span>
              <AiOutlineDown style={{ transform: isDescOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
            </button>
            {isDescOpen && (
              <div className="mt-3 bg-white">
                <ReactQuill 
                  theme="snow" 
                  value={product.description} 
                  onChange={(val) => setProduct({ ...product, description: val })}
                  modules={modules}
                  placeholder="product information ..."
                />
              </div>
            )}
          </div>

          <div className="py-3 border-bottom">
            <button
              type="button"
              className="d-flex align-items-center justify-content-between w-100 text-dark text-start p-2 bg-transparent border-0"
              style={{ cursor: "pointer" }}
              onClick={() => setIsSizeOpen((prev) => !prev)}
            >
              <span className="fw-bold text-uppercase">Size & Fit Details</span>
              <AiOutlineDown style={{ transform: isSizeOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
            </button>
            {isSizeOpen && (
              <div className="mt-3 bg-white">
                <ReactQuill 
                  theme="snow" 
                  value={product.size_fit} 
                  onChange={(val) => setProduct({ ...product, size_fit: val })}
                  modules={modules}
                  placeholder="write in Detail Size And Fit ..."
                />
              </div>
            )}
          </div>

          <div className="py-3 border-bottom">
            <button
              type="button"
              className="d-flex align-items-center justify-content-between w-100 text-dark text-start p-2 bg-transparent border-0"
              style={{ cursor: "pointer" }}
              onClick={() => setIsFabricOpen((prev) => !prev)}
            >
              <span className="fw-bold text-uppercase">Fabric & Care Details</span>
              <AiOutlineDown style={{ transform: isFabricOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
            </button>
            {isFabricOpen && (
             <div className="mt-3 bg-white">
                <ReactQuill 
                  theme="snow" 
                  value={product.fabric_care} 
                  onChange={(val) => setProduct({ ...product, fabric_care: val })}
                  modules={modules}
                  placeholder="Write in Detail Fabric and Care..."
                />
              </div>
            )}
          </div>
        </div>

        <style jsx global>{`
          .ql-container { height: 150px; font-size: 14px; }
          .ql-editor { background: white; }
        `}</style>

        <h5 className="mb-3">Product Images</h5>
        <div className="row text-center">
          {[1, 2, 3].map((i) => (
            <div className="col-md-4 mb-3" key={i}>
              <input type="file" accept="image/*" onChange={(e) => handleImageInput(e, i)} className="form-control mb-2" />
              <div style={{ height: "150px", border: "1px dashed #ccc", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {i === 1 && preview1 && <img src={preview1} alt="p1" style={{ maxHeight: "100%", maxWidth: "100%" }} />}
                {i === 2 && preview2 && <img src={preview2} alt="p2" style={{ maxHeight: "100%", maxWidth: "100%" }} />}
                {i === 3 && preview3 && <img src={preview3} alt="p3" style={{ maxHeight: "100%", maxWidth: "100%" }} />}
                {((i === 1 && !preview1) || (i === 2 && !preview2) || (i === 3 && !preview3)) && <small>No Preview</small>}
              </div>
            </div>
          ))}
        </div>

        <button type="submit" className="btn btn-primary mt-4 w-100" disabled={loading}>
          {loading ? "Uploading..." : "Add Product"}
        </button>
      </form>
    </div>
  );
}