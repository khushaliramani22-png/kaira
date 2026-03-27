"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);

  const [message, setMessage] = useState("");

  const router = useRouter();

  // OTP send
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        shouldCreateUser: true,
      },
    });

    if (error) {
      alert(error.message);
    } else {
      setShowOtpInput(true);
      setMessage("A 6-digit code has been sent to your email.");
    }
    setLoading(false);
  };

  //  OTP verify
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
setMessage("");
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'email',
    });

    if (error) {
      setMessage("Incorrect code! Try again.");
      setLoading(false)
    } else {
      router.push("/");


    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div className="card border-0 shadow-lg p-4" style={{ width: "400px", borderRadius: "15px" }}>
        <div className="text-center mb-4">
          <h2 className="fw-bold text-dark">Kaira Store</h2>
          <p className="text-muted small">
            {showOtpInput ? "Enter the code sent to your email" : "Login or Sign up with email"}
          </p>
        </div>

        {message && <div className="alert alert-info small p-2 text-center">{message}</div>}

        {!showOtpInput ? (
          /* e-mail form */
          <form onSubmit={handleSendOTP}>
            <div className="mb-3">
              <label className="form-label small fw-bold">Email Address</label>
              <input
                type="email"
                className="form-control py-2"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-dark w-100 mb-3 py-2 fw-bold" disabled={loading}>
              {loading ? "Sending..." : "Continue with Email"}
            </button>
          </form>
        ) : (
          /* OTP form */
          <form onSubmit={handleVerifyOTP}>
            {/* OTP Input Field */}
            <div className="mb-3">
              <label className="form-label small fw-bold">Verification Code</label>
              <input
                type="text"
                className="form-control py-2 text-center fw-bold"
                style={{ letterSpacing: '0.3rem', fontSize: '1.2rem' }} // 8 આંકડા માટે સ્પેસ થોડી ઓછી કરી
                placeholder="00000000"
                maxLength={8} // અહીં 8 કરી દો
                value={otp}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, ""); // ફક્ત નંબર્સ
                  setOtp(value);

                  if (message) setMessage("");
                }}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-100 mb-2 py-2 fw-bold" disabled={loading}>
              {loading ? "Verifying..." : "Verify & Login"}
            </button>
            <button
              type="button"
              className="btn btn-link w-100 text-muted small text-decoration-none"
              onClick={() => setShowOtpInput(false)}
            >
              ← Back to Email
            </button>
          </form>
        )}

        <div className="text-center my-3 position-relative">
          <hr />
          <span className="position-absolute top-50 start-50 translate-middle bg-white px-2 text-muted small">OR</span>
        </div>

        <button onClick={handleGoogleLogin} className="btn btn-outline-dark w-100 d-flex align-items-center justify-content-center gap-2 py-2 mb-3">
          <FcGoogle size={22} />
          Continue with Google
        </button>

        <p className="text-center text-muted" style={{ fontSize: '11px' }}>
          No password required. We'll send a secure code to your inbox.
        </p>
      </div>
    </div>
  );
}