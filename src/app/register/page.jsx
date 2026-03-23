"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";  
// ૧. આઇકોન ઇમ્પોર્ટ કરો
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

export default function Register() {
  const router = useRouter(); 

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: ""
  });

  // ૨. પાસવર્ડ વિઝિબિલિટી માટે સ્ટેટ
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password
    });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    const user = data.user;

    if (user) {
      const { error: dbError } = await supabase.from("users").insert([
        {
          id: user.id,
          name: form.name,
          email: form.email,
          phone: form.phone,
          address: form.address
        }
      ]);

      if (dbError) {
        alert("Database Error: " + dbError.message);
      } else {
        alert("Registration Successful! Please check your email for verification.");
        router.push("/login");
      }
    }
    setLoading(false);
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-5">
          <div className="card p-4 shadow border-0" style={{ borderRadius: "15px" }}>
            <h3 className="text-center mb-4 fw-bold">Register</h3>

            <form onSubmit={handleRegister}>
              <div className="mb-3">
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  className="form-control"
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  className="form-control"
                  onChange={handleChange}
                  required
                />
              </div>

              {/* ૩. પાસવર્ડ ફિલ્ડ વિથ શો/હાઈડ બટન */}
              <div className="mb-3 position-relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  className="form-control"
                  onChange={handleChange}
                  required
                  style={{ paddingRight: "45px" }}
                />
                <span 
                  className="position-absolute top-50 end-0 translate-middle-y me-3" 
                  style={{ cursor: "pointer", zIndex: 10, color: "#6c757d" }}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
                </span>
              </div>

              <div className="mb-3">
                <input
                  type="text"
                  name="phone"
                  placeholder="Phone Number"
                  className="form-control"
                  onChange={handleChange}
                />
              </div>

              <div className="mb-3">
                <input
                  type="text"
                  name="address"
                  placeholder="Address"
                  className="form-control"
                  onChange={handleChange}
                />
              </div>

              <button className="btn btn-dark w-100 py-2" disabled={loading}>
                {loading ? "Creating Account..." : "Register"}
              </button>
            </form>
            
            <div className="text-center mt-3">
              <small className="text-muted">
                Already have an account? <a href="/login" className="text-primary text-decoration-none fw-bold">Login</a>
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}