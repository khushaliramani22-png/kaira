"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";

export default function EditProduct() {
  const { id } = useParams();
  const router = useRouter();

  const [product, setProduct] = useState({
    name: "", brand: "", gender: "", category: "",
    price: "", old_price: "", discount: "", stock: "",
    description: "",
    image1: null, image2: null, image3: null,
  });

  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [preview1, setPreview1] = useState(null);
  const [preview2, setPreview2] = useState(null);
  const [preview3, setPreview3] = useState(null);
  const [loading, setLoading] = useState(false);

  const sizesOptions = ["S", "M", "L", "XL", "XXL"];
  const colorsOptions = ["Red", "Blue", "Black", "White", "Beige", "Green", "Pink"];
  const shopCategories = [
    "NEW ARRIVALS", "BESTSELLER", "FS WORK", "DRESSES", "CO-ORDS",
    "TOPS & SHIRTS", "TEES", "WAISTCOATS", "CAMIS & TANKS",
    "BLAZERS", "TROUSERS", "JEANS", "LIVIN PANTS", "SKIRTS & SKORTS"
  ];

  // 1. પ્રોડક્ટનો જૂનો ડેટા લોડ કરવા માટે
  useEffect(() => {
    const fetchProduct = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        alert("Product not found!");
        router.push("/admin/products");
        return;
      }

      setProduct({
        ...data,
        image1: null, // નવી ફાઈલ માટે નલ રાખીએ
        image2: null,
        image3: null,
      });
      setSelectedSizes(data.size || []);
      setSelectedColors(data.color || []);
      setPreview1(data.image1);
      setPreview2(data.image2);
      setPreview3(data.image3);
    };

    if (id) fetchProduct();
  }, [id, router]);

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
    const { error } = await supabase.storage.from("products").upload(filePath, file);
    if (error) throw error;
    const { data: urlData } = supabase.storage.from("products").getPublicUrl(filePath);
    return urlData.publicUrl;
  };

  const updateProduct = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // જો નવી ઈમેજ પસંદ કરી હોય તો અપલોડ કરો, નહીંતર જૂની URL વાપરો
      const img1 = product.image1 ? await uploadImage(product.image1, 1) : preview1;
      const img2 = product.image2 ? await uploadImage(product.image2, 2) : preview2;
      const img3 = product.image3 ? await uploadImage(product.image3, 3) : preview3;

      const dataToUpdate = {
        name: product.name,
        brand: product.brand,
        gender: product.gender.toLowerCase(),
        category: product.category,
        price: Number(product.price),
        old_price: product.old_price ? Number(product.old_price) : null,
        discount: product.discount ? Number(product.discount) : null,
        stock: Number(product.stock),
        size: selectedSizes,
        color: selectedColors,
        description: product.description,
        image1: img1,
        image2: img2,
        image3: img3,
      };

      const { error } = await supabase.from("products").update(dataToUpdate).eq("id", id);
      if (error) throw error;

      alert("Product Updated Successfully! ✅");
      router.push("/admin/products");
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <h2 className="mb-4">Edit Product (Admin)</h2>
      <form onSubmit={updateProduct}>
        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="small fw-bold">Product Name</label>
            <input name="name" value={product.name} onChange={handleChange} className="form-control" required />
          </div>
          <div className="col-md-6 mb-3">
            <label className="small fw-bold">Brand</label>
            <input name="brand" value={product.brand} onChange={handleChange} className="form-control" />
          </div>
          <div className="col-md-6 mb-3">
            <label className="small fw-bold">Gender</label>
            <select name="gender" value={product.gender} onChange={handleChange} className="form-control" required>
              <option value="men">Men</option>
              <option value="women">Women</option>
              <option value="unisex">Unisex</option>
            </select>
          </div>
          <div className="col-md-6 mb-3">
            <label className="small fw-bold">Category</label>
            <select name="category" value={product.category} onChange={handleChange} className="form-control" required>
              {shopCategories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="col-md-4 mb-3">
            <label className="small fw-bold">Price</label>
            <input name="price" type="number" value={product.price} onChange={handleChange} className="form-control" />
          </div>
          <div className="col-md-4 mb-3">
            <label className="small fw-bold">Old Price</label>
            <input name="old_price" type="number" value={product.old_price} onChange={handleChange} className="form-control" />
          </div>
          <div className="col-md-4 mb-3">
            <label className="small fw-bold">Stock</label>
            <input name="stock" type="number" value={product.stock} onChange={handleChange} className="form-control" />
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

        <textarea name="description" value={product.description} onChange={handleChange} className="form-control mb-4" rows="3" />

        <h5 className="mb-3">Product Images</h5>
        <div className="row text-center">
          {[1, 2, 3].map((i) => (
            <div className="col-md-4 mb-3" key={i}>
              <input type="file" accept="image/*" onChange={(e) => handleImageInput(e, i)} className="form-control mb-2" />
              <div style={{ height: "150px", border: "1px dashed #ccc", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {i === 1 && preview1 && <img src={preview1} alt="p1" style={{ maxHeight: "100%", maxWidth: "100%" }} />}
                {i === 2 && preview2 && <img src={preview2} alt="p2" style={{ maxHeight: "100%", maxWidth: "100%" }} />}
                {i === 3 && preview3 && <img src={preview3} alt="p3" style={{ maxHeight: "100%", maxWidth: "100%" }} />}
              </div>
            </div>
          ))}
        </div>

        <button type="submit" className="btn btn-primary mt-4 w-100" disabled={loading}>
          {loading ? "Updating..." : "Update Product"}
        </button>
      </form>
    </div>
  );
}