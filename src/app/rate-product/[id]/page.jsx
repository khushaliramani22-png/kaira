"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { AiOutlineLeft, AiFillStar, AiOutlineStar } from "react-icons/ai";
import { IoCameraOutline } from "react-icons/io5";
import Swal from "sweetalert2";

export default function RateProductPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const productName = searchParams.get("name") || "Product";
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [step, setStep] = useState(1);
  const [rating, setRating] = useState(0);
  const [fabricRating, setFabricRating] = useState(0);
  const [comment, setComment] = useState("");
  const [selectedImages, setSelectedImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [existingReviewId, setExistingReviewId] = useState(null);

  const labels = ["Very Bad", "Bad", "Ok-Ok", "Good", "Very Good"];

 useEffect(() => {
  if (!id) return;

  const fetchExistingReview = async () => {
    // console.log("🔍 Fetching review for ID:", id); 

    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      // console.log("🛑 User not logged in");
      return;
    }
    setUser(authUser);

    const { data, error } = await supabase
      .from("product_reviews")
      .select("*")
      .eq("product_id", id)
      .eq("user_id", authUser.id)
      .maybeSingle();

    if (error) {
      // console.error("❌ Fetch error:", error.message);
      return;
    }

    if (data) {
      // console.log(" Data loaded from DB:", data);
      setExistingReviewId(data.id);
      setRating(Number(data.rating));
      setFabricRating(Number(data.fabric_rating));
      setComment(data.comment || "");
      if (data.review_image) {
        setSelectedImages([{ preview: data.review_image, isExisting: true }]);
      }
    } else {
      // console.log("No existing review found for this product/user.");
    }
  };

  fetchExistingReview();
}, [id, supabase]); 

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newImgs = files.map(file => ({ file, preview: URL.createObjectURL(file), isExisting: false }));
    setSelectedImages([...selectedImages, ...newImgs]);
  };

 const handleSubmit = async () => {
  const currentUser = user || (await supabase.auth.getUser()).data.user;
  if (!currentUser || !id || id === "undefined") {
    Swal.fire("Error", "Invalid Session", "error");
    return;
  }

  if (rating === 0) {
    Swal.fire("Error", "Please select a product rating", "error");
    return;
  }

  try {
    setLoading(true);
    let imageUrl = selectedImages[0]?.isExisting ? selectedImages[0].preview : null;

    // Image Upload Logic
    if (selectedImages.length > 0 && !selectedImages[0].isExisting) {
      const file = selectedImages[0].file;
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `review_images/${currentUser.id}/${fileName}`;
      const { error: uploadError } = await supabase.storage.from("products").upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from("products").getPublicUrl(filePath);
      imageUrl = publicUrl;
    }

    const reviewData = {
      product_id: id,
      user_id: currentUser.id, // અહીં ચેક કરો કે આ સાચો UUID છે
      customer_name: currentUser.user_metadata?.full_name || "Guest",
      rating: Number(rating),
      fabric_rating: Number(fabricRating),
      comment,
      status: "pending",
      review_image: imageUrl,
    };

    let result;
    if (existingReviewId) {
      // જો રિવ્યૂ પહેલેથી હોય તો Update કરો
      result = await supabase
        .from("product_reviews")
        .update(reviewData)
        .eq("id", existingReviewId);
    } else {
      // નવો રિવ્યૂ Insert કરો
      result = await supabase
        .from("product_reviews")
        .insert([reviewData]);
    }

    if (result.error) throw result.error;

    await Swal.fire('Success', existingReviewId ? 'Review Updated!' : 'Feedback Submitted!', 'success');
    router.push('/user-order');
  } catch (err) {
    console.error("❌ Submission Error:", err.message);
    Swal.fire("Error", err.message, "error");
  } finally {
    setLoading(false);
  }
};

  const getButtonText = () => {
    if (loading) return "Processing...";
    if (step === 3) return existingReviewId ? "Update Review" : "Submit Review";
    if (step === 1 && rating === 0) return "Skip";
    if (step === 2 && selectedImages.length === 0) return "Skip";
    return "Next";
  };

  return (
    <div className="bg-white min-h-screen flex flex-col font-sans">
      {/* Header */}
      <div className="flex items-center p-4 border-b">
        <button onClick={() => (step > 1 ? setStep(step - 1) : router.back())}>
          <AiOutlineLeft size={20} className="mr-4" />
        </button>
        <div className="flex flex-col">
          <span className="font-bold text-sm uppercase">Rating & Review</span>
          <span className="text-[10px] text-gray-500 truncate w-40">{productName}</span>
        </div>
      </div>

     
      <div className="flex justify-between px-12 py-6 relative">
        <div className="absolute top-1/2 left-12 right-12 h-[2px] bg-gray-100 -translate-y-1/2">
          <div className="h-full bg-purple-600 transition-all duration-300" style={{ width: `${(step - 1) * 50}%` }}></div>
        </div>
        {[1, 2, 3].map((s) => (
          <div key={s} className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${step >= s ? "bg-purple-700 text-white" : "bg-gray-200 text-gray-500"}`}>
            {step > s ? "✓" : s}
          </div>
        ))}
      </div>

      <div className="flex-grow px-6">
        {step === 1 && (
          <div className="text-center animate-in fade-in duration-500">
            <h2 className="text-lg font-bold mb-1">How was the product?</h2>
            <p className="text-xs text-gray-400 mb-6">Your feedback helps other shoppers</p>
            <div className="flex justify-center gap-3 mb-8">
              {[1, 2, 3, 4, 5].map((s) => (
                <button key={s} onClick={() => setRating(s)} className="focus:outline-none">
                  {rating >= s ? <AiFillStar size={48} className="text-yellow-400" /> : <AiOutlineStar size={48} className="text-gray-200" />}
                </button>
              ))}
            </div>
            
            <div className="text-left bg-gray-50 p-5 rounded-2xl">
              <h3 className="text-gray-800 font-bold text-sm mb-4">Fabric Quality</h3>
              <div className="flex justify-between items-center">
                {[1, 2, 3, 4, 5].map((s) => (
                  <div key={s} className="flex flex-col items-center">
                    <button onClick={() => setFabricRating(s)} className={`w-10 h-10 rounded-full border-2 mb-1 flex items-center justify-center font-bold ${fabricRating === s ? 'bg-purple-800 border-purple-800 text-white' : 'bg-white border-gray-200 text-gray-400'}`}>
                      {s}
                    </button>
                    <span className="text-[9px] text-gray-400 uppercase">{labels[s-1]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in slide-in-from-right duration-300">
            <h3 className="font-bold text-gray-800 text-lg mb-1">Add Photos</h3>
            <p className="text-xs text-gray-400 mb-6">Real images help people decide better</p>
            
            <div className="flex flex-wrap gap-3 mb-6">
              {selectedImages.map((img, i) => (
                <div key={i} className="relative w-24 h-24">
                  <img src={img.preview} className="w-full h-full object-cover rounded-xl border-2 border-purple-100" />
                  <button onClick={() => setSelectedImages(selectedImages.filter((_, idx) => idx !== i))} className="absolute -top-2 -right-2 bg-black text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-lg">✕</button>
                </div>
              ))}
              <button onClick={() => fileInputRef.current.click()} className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                <IoCameraOutline size={28} />
                <span className="text-[10px] mt-1 font-bold">Add More</span>
              </button>
            </div>
            
            <input type="file" hidden ref={fileInputRef} onChange={handleImageChange} accept="image/*" />
          </div>
        )}

        {step === 3 && (
          <div className="animate-in slide-in-from-right duration-300">
            <h3 className="font-bold text-gray-800 text-lg mb-4">Write a Review</h3>
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <textarea 
                className="w-full bg-transparent outline-none py-2 text-sm h-40 resize-none" 
                placeholder="Share your experience with the product..." 
                value={comment} 
                onChange={(e) => setComment(e.target.value)} 
              />
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white shadow-[0_-4px_10px_rgba(0,0,0,0.03)]">
        <button 
          onClick={step === 3 ? handleSubmit : () => setStep(step + 1)}
          disabled={loading}
          className={`w-full py-4 rounded-xl font-bold uppercase text-xs tracking-widest transition-all ${getButtonText() === "Skip" ? "bg-gray-100 text-gray-500" : "bg-purple-800 text-white shadow-lg shadow-purple-200"}`}
        >
          {getButtonText()}
        </button>
      </div>
    </div>
  );
}