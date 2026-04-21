"use client";
import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { AiOutlineCamera, AiOutlineUser, AiOutlineRight, AiOutlinePhone, AiOutlineHome, AiOutlineEnvironment } from "react-icons/ai";
import Swal from "sweetalert2";

export default function AccountPage() {
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  
  const [profile, setProfile] = useState({
    customer_name: "",
    phone: "",
    email: "",
    address: "",
    pincode: "",
    city: "",
    avatar_url: ""
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;


      const meta = user.user_metadata;

      const { data: lastOrder } = await supabase
        .from("orders")
        .select("*")
        .eq("email", user.email)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      setProfile({
        customer_name: meta?.full_name || lastOrder?.customer_name || "User",
        email: user.email || "",
        phone: meta?.phone || lastOrder?.phone || "",
        address: meta?.address || lastOrder?.address || "",
        pincode: meta?.pincode || lastOrder?.pincode || "",
        city: meta?.city || lastOrder?.city || "",
        avatar_url: meta?.avatar_url || ""
      });
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    try {
      setUploading(true);
      const file = e.target.files[0];
      if (!file) return;

      const { data: { user } } = await supabase.auth.getUser();
      const fileName = `avatars/${user.id}-${Date.now()}`;

      const { error: uploadError } = await supabase.storage
        .from("products")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from("products").getPublicUrl(fileName);

      const { data: { user: updatedUser }, error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });

      if (updateError) throw updateError;

      setProfile(prev => ({ ...prev, avatar_url: publicUrl }));

      const event = new CustomEvent('profilePictureUpdated', {
        detail: { user: updatedUser }
      });
      window.dispatchEvent(event);
      console.log('Profile picture updated and event dispatched:', updatedUser);

      Swal.fire("Success", "update your profile!", "success");
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveProfilePicture = async () => {
    const result = await Swal.fire({
      title: 'Remove Profile Picture?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Remove it!',
      cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) return;

    try {
      setUploading(true);
      const { data: { user } } = await supabase.auth.getUser();

   
      if (profile.avatar_url) {
      
        const urlParts = profile.avatar_url.split('/object/public/products/')[1];
        
        if (urlParts) {
          const { error: deleteError } = await supabase.storage
            .from('products')
            .remove([urlParts]);

          if (deleteError) {
            console.warn('Storage delete warning:', deleteError);
          }
        }
      }

      const { data: { user: updatedUser }, error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: null }
      });

      if (updateError) throw updateError;

      setProfile(prev => ({ ...prev, avatar_url: '' }));

      const event = new CustomEvent('profilePictureUpdated', {
        detail: { user: updatedUser }
      });
      window.dispatchEvent(event);
      console.log('Profile picture removed and event dispatched:', updatedUser);

      Swal.fire('Removed!', 'Your profile picture has been deleted.', 'success');
    } catch (err) {
      console.error('Remove picture error:', err);
      Swal.fire('Error', err.message || 'Failed to remove profile picture', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const { data: { user: updatedUser }, error } = await supabase.auth.updateUser({
        data: { 
          full_name: profile.customer_name,
          phone: profile.phone,
          address: profile.address,
          pincode: profile.pincode,
          city: profile.city
        }
      });
      
      if (error) throw error;
      const event = new CustomEvent('profilePictureUpdated', {
        detail: { user: updatedUser }
      });
      window.dispatchEvent(event);
      console.log('Profile updated and event dispatched:', updatedUser);

      Swal.fire({ icon: 'success', title: 'save Profile!', showConfirmButton: false, timer: 1500 });
    } catch (err) {
      Swal.fire('Error', err.message, 'error');
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen text-gray-600 font-bold">Loading...</div>;

  return (
    <div className="bg-gray-100 min-h-screen pb-10">

      {/* Profile Header Section */}
      <div className="bg-white p-8 flex flex-col items-center border-b shadow-sm">
        <div className="relative">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-gray-600 overflow-hidden border-2 border-gray-100 shadow-inner">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <AiOutlineUser size={50} />
            )}
          </div>
          <button 
            type="button"
            onClick={() => fileInputRef.current.click()}
            disabled={uploading}
            className="absolute bottom-0 right-0 bg-gray-600 text-white p-2 rounded-full shadow-lg hover:scale-110 transition-all disabled:opacity-50"
            title="Upload new picture"
          >
            <AiOutlineCamera size={16} />
          </button>
          <input type="file" ref={fileInputRef} onChange={handleImageUpload} hidden accept="image/*" />
        </div>
        <h2 className="text-xl font-bold mt-4 text-gray-800">{profile.customer_name}</h2>
        <p className="text-sm text-gray-400 font-medium">{profile.email}</p>
        
        {/* Remove Picture Button - Only show if avatar exists */}
        {profile.avatar_url && (
          <button
            type="button"
            onClick={handleRemoveProfilePicture}
            disabled={uploading}
            className="mt-3 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            Remove Picture
          </button>
        )}
      </div>

      <form onSubmit={handleUpdate}>

        {/* Account Settings List */}
        <div className="mt-4 bg-white">
          <div className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest border-b">Personal Information</div>
          
          {/* Full Name Input */}
          <div className="flex items-center p-4 border-b group">
            <AiOutlineUser className="text-gray-400 mr-4" size={20} />
            <div className="flex-grow">
              <label className="text-[20px] text-black-600 block font-bold">Name</label>
              <input 
                type="text" 
                className="w-full outline-none text-sm text-gray-700 font-medium"
                value={profile.customer_name}
                onChange={(e) => setProfile({...profile, customer_name: e.target.value})}
              />
            </div>
            <AiOutlineRight className="text-gray-300" />
          </div>

          {/* Phone Input */}
          <div className="flex items-center p-4 border-b">
            <AiOutlinePhone className="text-gray-400 mr-4" size={20} />
            <div className="flex-grow">
              <label className="text-[20px] text-black-600 block font-bold">Mobile No.</label>
              <input 
                type="text" 
                className="w-full outline-none text-sm text-gray-700 font-medium"
                value={profile.phone}
                onChange={(e) => setProfile({...profile, phone: e.target.value})}
              />
            </div>
            <AiOutlineRight className="text-gray-300" />
          </div>
        </div>

        {/* Address Section */}
        <div className="mt-4 bg-white">
          <div className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest border-b">Address Detail</div>
          
          <div className="flex items-start p-4 border-b">
            <AiOutlineHome className="text-gray-400 mr-4 mt-1" size={20} />
            <div className="flex-grow">
              <label className="text-[20px] text-black-600 block font-bold">Address</label>
              <textarea 
                className="w-full outline-none text-sm text-gray-700 font-medium h-16 resize-none"
                value={profile.address}
                onChange={(e) => setProfile({...profile, address: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2">
            <div className="flex items-center p-4 border-r border-b">
              <AiOutlineEnvironment className="text-gray-400 mr-3" size={18} />
              <div className="flex-grow">
                <label className="text-[20px] text-black-600 block font-bold">Pin Code:</label>
                <input 
                  type="text" 
                  className="w-full outline-none text-sm text-gray-700 font-medium"
                  value={profile.pincode}
                  onChange={(e) => setProfile({...profile, pincode: e.target.value})}
                />
              </div>
            </div>
            <div className="flex items-center p-4 border-b">
              <div className="flex-grow ml-2">
                <label className="text-[20px] text-black-600 block font-bold">City:</label>
                <input 
                  type="text" 
                  className="w-full outline-none text-sm text-gray-700 font-medium"
                  value={profile.city}
                  onChange={(e) => setProfile({...profile, city: e.target.value})}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Save Button  */}
        <div className="p-4 mt-6">
          <button 
            type="submit" 
            className="w-full py-3  active:bg-black text-white rounded-lg font-bold text-sm shadow-md bg-gray-600 transition-colors"
          >
            submit
          </button>
        </div>
      </form>
    </div>
  );
}