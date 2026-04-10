
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase"; 
export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubscribe = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // email save
    const { error } = await supabase
      .from("newsletter_subscribers")
      .insert([{ email: email.toLowerCase() }]);

    if (error) {
      if (error.code === "23505") {
        setMessage("You are already subscribed! ✨");
      } else {
        setMessage("Something went wrong. Please try again.");
      }
    } else {
      setMessage("Thank you for successfully subscribing! 🎉");
      setEmail("");
    }
    
    setLoading(false);
  };

  return (
    <section
      className="newsletter bg-light"
      style={{ background: "url('/images/colorbox/pattern-bg.png') no-repeat" }}
    >
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8 py-5 my-5">
            <div className="subscribe-header text-center pb-3">
              <h3 className="section-title text-uppercase font-weight-bold">
                Sign Up for our newsletter
              </h3>
              <p className="text-muted small">Join to get information on new offers and collections.</p>
            </div>

            <form onSubmit={handleSubscribe} className="d-flex flex-wrap gap-2">
              <input
                type="email"
                name="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your Email Address"
                className="form-control form-control-lg flex-grow-1"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading}
                className="btn btn-dark btn-lg text-uppercase w-100 shadow-sm"
              >
                {loading ? "Signing Up..." : "Sign Up"}
              </button>
            </form>

            {/* sucess error msg  */}
            {message && (
              <p className={`text-center mt-3 font-weight-bold ${message.includes("ભૂલ") ? "text-danger" : "text-success"}`}>
                {message}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}