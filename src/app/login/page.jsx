"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FcGoogle } from "react-icons/fc";
// ૧. આંખના આઇકોન માટે react-icons ઇમ્પોર્ટ કરો
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  // ૨. પાસવર્ડ દેખાડવા માટેનું સ્ટેટ
  const [showPassword, setShowPassword] = useState(false);
  
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    else router.push("/");
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error) {
      alert(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div className="card border-0 shadow-lg p-4" style={{ width: "400px", borderRadius: "15px" }}>
        <div className="text-center mb-4">
          <h2 className="fw-bold text-dark">Welcome Back</h2>
          <p className="text-muted small">Please enter your details</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label small fw-bold">Email Address</label>
            <input 
              type="email" 
              className="form-control" 
              placeholder="name@company.com" 
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>

          <div className="mb-2">
            <label className="form-label small fw-bold">Password</label>
            {/* ૩. પાસવર્ડ ઇનપુટ ફિલ્ડમાં ફેરફાર */}
            <div className="position-relative">
              <input 
                type={showPassword ? "text" : "password"} 
                className="form-control" 
                placeholder="••••••••" 
                onChange={(e) => setPassword(e.target.value)}
                required 
                style={{ paddingRight: "40px" }} // આઇકોન માટે જગ્યા
              />
              <span 
                className="position-absolute top-50 end-0 translate-middle-y me-3" 
                style={{ cursor: "pointer", zIndex: 10 }}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
              </span>
            </div>
          </div>

          <div className="d-flex justify-content-end mb-3">
            <Link href="/forgot-password" size="small" className="text-decoration-none small text-primary">
              Forgot password?
            </Link>
          </div>

          <button type="submit" className="btn btn-dark w-100 mb-3 py-2" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="text-center my-2 position-relative">
          <hr />
          <span className="position-absolute top-50 start-50 translate-middle bg-white px-2 text-muted small">OR</span>
        </div>

        <button 
          onClick={handleGoogleLogin} 
          disabled={loading}
          className="btn btn-outline-dark w-100 d-flex align-items-center justify-content-center gap-2 py-2 mb-3"
        >
          <FcGoogle size={22} />
          {loading ? "Connecting..." : "Continue with Google"}
        </button>

        <p className="text-center small text-muted">
          Don't have an account? <Link href="/register" className="text-primary fw-bold text-decoration-none">Create Account</Link>
        </p>
      </div>
    </div>
  );
}