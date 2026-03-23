"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState(1); 
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: email,
      options: { shouldCreateUser: false },
    });
    if (error) {
      alert("Error: " + error.message);
    } else {
      alert("OTP has been sent to your email ID.");
      setStep(2);
    }
    setLoading(false);
  };

  const handleVerifyAndReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error: otpError } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'recovery', 
    });
    if (otpError) {
      alert("Invalid OTP: " + otpError.message);
      setLoading(false);
      return;
    }
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword
    });
    if (updateError) {
      alert("Password Update Error: " + updateError.message);
    } else {
      alert("password chnged successfully !");
      router.push("/login");
    }
    setLoading(false);
  };

  return (
    <div className="container-fluid bg-light min-vh-100 d-flex align-items-center justify-content-center p-3">
      <div 
        className="card border-0 shadow-lg p-3 p-sm-4 p-md-5" 
        style={{ 
          width: "100%", 
          maxWidth: "450px", 
          borderRadius: "20px" 
        }}
      >
        {step === 1 ? (
          <form onSubmit={handleSendOTP}>
            <div className="text-center mb-4">
              <h2 className="fw-bold text-dark">Forgot Password?</h2>
              <p className="text-muted small px-2">
                Don't worry! Enter your registered email, we will send you an OTP.
              </p>
            </div>
            
            <div className="mb-4">
              <label className="form-label small fw-bold text-secondary">Email Address</label>
              <input 
                type="email" 
                className="form-control form-control-lg fs-6" 
                placeholder="example@mail.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
                style={{ borderRadius: "10px" }}
              />
            </div>
            
            <button 
              type="submit" 
              className="btn btn-dark w-100 py-2 fs-5 shadow-sm mb-3" 
              disabled={loading}
              style={{ borderRadius: "10px" }}
            >
              {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : null}
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyAndReset}>
            <div className="text-center mb-4">
              <h2 className="fw-bold text-dark">Reset Password</h2>
              <p className="text-muted small">Enter the 6-digit code sent to your email..</p>
            </div>
            
            <div className="mb-3">
              <label className="form-label small fw-bold text-secondary">Enter OTP</label>
              <input 
                type="text" 
                className="form-control form-control-lg text-center fw-bold" 
                placeholder="0 0 0 0 0 0" 
                maxLength="6"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required 
                style={{ borderRadius: "10px", letterSpacing: "5px" }}
              />
            </div>

            <div className="mb-4">
              <label className="form-label small fw-bold text-secondary">New Password</label>
              <div className="position-relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  className="form-control form-control-lg fs-6" 
                  placeholder="••••••••" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required 
                  style={{ borderRadius: "10px", paddingRight: "45px" }}
                />
                <span 
                  className="position-absolute top-50 end-0 translate-middle-y me-3" 
                  style={{ cursor: "pointer", zIndex: 10, color: "#6c757d" }}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <AiOutlineEyeInvisible size={22} /> : <AiOutlineEye size={22} />}
                </span>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-dark w-100 py-2 fs-5 shadow-sm mb-3" 
              disabled={loading}
              style={{ borderRadius: "10px" }}
            >
              {loading ? "updateed..." : "Update Password"}
            </button>
            
            <button 
              type="button" 
              className="btn btn-outline-secondary w-100 btn-sm border-0 mb-2" 
              onClick={() => setStep(1)}
            >
              ઈમેલ બદલવો છે? પાછા જાઓ
            </button>
          </form>
        )}

        <div className="text-center mt-2">
          <Link href="/login" className="text-decoration-none small fw-bold text-primary">
            ← Back to Login
          </Link>
        </div>
      </div>
      
      {/* Custom CSS for Mobile Optimization */}
      <style jsx>{`
        @media (max-width: 576px) {
          .card {
            box-shadow: none !important;
            background: transparent !important;
          }
          h2 {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}