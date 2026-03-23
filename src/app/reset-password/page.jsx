"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      alert(error.message);
    } else {
      alert("Password updated successfully!");
      router.push("/login");
    }
    setLoading(false);
  };

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div className="card border-0 shadow-lg p-4" style={{ width: "400px", borderRadius: "15px" }}>
        <h3 className="text-center fw-bold mb-4">New Password</h3>
        
        <form onSubmit={handleUpdatePassword}>
          <div className="mb-3 position-relative">
            <label className="form-label small fw-bold">Enter New Password</label>
            <input 
              type={showPassword ? "text" : "password"} 
              className="form-control" 
              placeholder="••••••••" 
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
            <span 
              className="position-absolute top-50 end-0 translate-middle-y me-3 mt-3" 
              style={{ cursor: "pointer" }}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
            </span>
          </div>

          <button type="submit" className="btn btn-dark w-100" disabled={loading}>
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}