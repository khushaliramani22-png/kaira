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

  const labels = ["Very Bad", "Bad", "Ok-Ok", "Good", "Very Good"];

  
useEffect(() => {
    if (!id || id === "undefined") return;

    const fetchExistingReview = async () => {
    
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;
      setUser(authUser);

      const { data, error } = await supabase
        .from("product_reviews")
        .select("*")
        .eq("product_id", id)
        .eq("user_id", authUser.id) 
        .maybeSingle();

      if (data) {
        setRating(Number(data.rating));
        setFabricRating(Number(data.fabric_rating));
        setComment(data.comment || "");
      }
    };

    fetchExistingReview();
  }, [id]);

    const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newImgs = files.map(file => ({ file, preview: URL.createObjectURL(file) }));
    setSelectedImages([...selectedImages, ...newImgs]);
  };
const handleSubmit = async () => {
  const currentUser = user || (await supabase.auth.getUser()).data.user; 
  if (!currentUser || !id || id === "undefined") {
    Swal.fire("Error", "Invalid Session or Product ID", "error");
    return;
  }

  try {
    setLoading(true);

    let imageUrl = null;

    // 1. જો ઈમેજ સિલેક્ટ કરી હોય, તો તેને સ્ટોરેજમાં અપલોડ કરો
    if (selectedImages.length > 0) {
      const img = selectedImages[0]; // અત્યારે આપણે પહેલી ઈમેજ લઈએ છીએ
      const file = img.file;
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`; // યુનિક નામ માટે timestamp
      const filePath = `review_images/${currentUser.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("products") // તમારું બકેટ નામ
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // ઈમેજની પબ્લિક URL મેળવો
      const { data: { publicUrl } } = supabase.storage
        .from("products")
        .getPublicUrl(filePath);

      imageUrl = publicUrl;
    }

    // 2. જૂનો રિવ્યુ ચેક કરો
    const { data: existingReview } = await supabase
      .from("product_reviews")
      .select("id")
      .eq("product_id", id)
      .eq("user_id", currentUser.id)
      .maybeSingle();

    // 3. ડેટા તૈયાર કરો
    const reviewData = {
      product_id: id,
      user_id: currentUser.id,
      customer_name: currentUser.user_metadata?.full_name || "Guest",
      rating: rating,
      fabric_rating: fabricRating,
      comment: comment,
      status: "pending",
      review_image: imageUrl, 
    };

    if (existingReview) {
      reviewData.id = existingReview.id;
    }

    const { error } = await supabase
      .from("product_reviews")
      .upsert(reviewData); 

    if (error) throw error;

    await Swal.fire("Success", "Feedback submitted! It will be visible after admin approval.", "success");
    router.push("/user-order");
  } catch (err) {
    console.error("Submission Error:", err.message);
    Swal.fire("Error", "Could not submit: " + err.message, "error");
  } finally {
    setLoading(false);
  }
};
const getButtonText = () => {
    if (step === 1) return rating > 0 ? "Next" : "Skip";
    if (step === 2) return selectedImages.length > 0 ? "Next" : "skip";
    return "Submit";
  };

  return (
    <div className="bg-white min-h-screen flex flex-col font-sans">
      <div className="flex items-center p-4 border-b">
        <button onClick={() => (step > 1 ? setStep(step - 1) : router.back())}>
          <AiOutlineLeft size={20} className="mr-4" />
        </button>
        <span className="font-bold uppercase text-xs tracking-widest">Add Feedback</span>
      </div>

      {/* Progress Bar */}
      <div className="flex justify-between px-12 py-6 relative">
        <div className="absolute top-1/2 left-12 right-12 h-[1px] bg-gray-200 -translate-y-1/2">
          <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${(step - 1) * 50}%` }}></div>
        </div>
        {[1, 2, 3].map((s) => (
          <div key={s} className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${step >= s ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"}`}>
            {step > s ? "✓" : s}
          </div>
        ))}
      </div>

      <div className="flex-grow px-6">
        {step === 1 && (
          <div className="text-center">
            <div className="flex justify-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((s) => (
                <div key={s} onClick={() => setRating(s)} className="cursor-pointer flex flex-col items-center">
                  {rating >= s ? <AiFillStar size={38} className="text-green-500" /> : <AiOutlineStar size={38} className="text-gray-300" />}
                  
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mb-10">We are glad you liked the product!</p>
            
            <div className="text-left">
              <h3 className="text-gray-400 font-bold text-[10px] uppercase mb-4 tracking-wider">Tell us more about the product</h3>
              <p className="text-sm font-bold text-gray-800 mb-4">Fabric</p>
              <div className="flex gap-4">
                {[1, 2, 3, 4, 5].map((s) => (
                  <div key={s} onClick={() => setFabricRating(s)} className="cursor-pointer">
                    {fabricRating >= s ? <AiFillStar size={32} className="text-green-500" /> : <AiOutlineStar size={32} className="text-gray-300" />}
                 <p className="text-[9px] text-gray-400 mt-1">{labels[s-1]}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h3 className="font-bold text-gray-800 mb-4">Add Photos and Videos</h3>
            <input type="file" multiple accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageChange} />
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedImages.map((img, i) => (
                <div key={i} className="relative w-20 h-20">
                  <img src={img.preview} className="w-full h-full object-cover rounded border" />
                  <button onClick={() => setSelectedImages(selectedImages.filter((_, idx) => idx !== i))} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-[10px]">✕</button>
                </div>
              ))}
            </div>
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 flex items-center justify-between cursor-pointer" onClick={() => fileInputRef.current.click()}>
               <span className="text-blue-700 text-sm font-medium">Show us what your product looks like</span>
               <div className="text-3xl">📷</div>
            </div>
            <button onClick={() => fileInputRef.current.click()} className="w-full py-4 bg-purple-800 text-white rounded-lg font-bold flex items-center justify-center gap-2 mt-4 uppercase text-xs tracking-widest">
              <IoCameraOutline size={22} /> Add Photos & Videos
            </button>
          </div>
        )}

        {step === 3 && (
          <div>
            <h3 className="font-bold text-gray-800 mb-6">Type Comment</h3>
            <textarea 
              className="w-full border-b border-gray-300 outline-none py-2 text-sm h-32 resize-none focus:border-purple-800 transition-colors" 
              placeholder="Type Comment" 
              value={comment} 
              onChange={(e) => setComment(e.target.value)} 
            />
          </div>
        )}
      </div>

      <div className="p-4 border-t bg-white">
        <button 
          onClick={step === 3 ? handleSubmit : () => setStep(step + 1)}
          disabled={loading}
          className={`w-full py-3.5 rounded font-bold uppercase text-xs tracking-widest transition-all ${getButtonText() === "Skip" ? "border border-gray-300 text-gray-600" : "bg-purple-800 text-white"}`}
        >
          {loading ? "Submitting..." : getButtonText()}
        </button>
      </div>
    </div>
  );
}