// components/Newsletter.jsx
"use client"; // if using Next.js 13+ app directory

export default function Newsletter() {
  return (
    <section
      className="newsletter bg-light"
      style={{ background: "url('/images/pattern-bg.png') no-repeat" }}
    >
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8 py-5 my-5">
            <div className="subscribe-header text-center pb-3">
              <h3 className="section-title text-uppercase">
                Sign Up for our newsletter
              </h3>
            </div>
            <form id="form" className="d-flex flex-wrap gap-2">
              <input
                type="text"
                name="email"
                placeholder="Your Email Address"
                className="form-control form-control-lg"
              />
              <button
                type="submit"
                className="btn btn-dark btn-lg text-uppercase w-100"
              >
                Sign Up
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}