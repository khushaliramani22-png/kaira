export default function About() {
  return (
    <div>

      {/* HERO SECTION */}
      <section className="bg-dark text-white text-center py-5">
        <div className="container">
          <h1 className="fw-bold">About Kiara</h1>
          <p className="mt-3">
            Discover the latest trends in Men & Women Western Fashion.
          </p>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section className="py-5">
        <div className="container">
          <div className="row align-items-center">

            <div className="col-md-6">
              <img
                src="/images/colorbox/post-large-image4.jpg"
                className="img-fluid rounded"
                alt="about"
              />
            </div>

            <div className="col-md-6">
              <h2 className="fw-bold">Our Story</h2>
              <p className="text-muted mt-3">
                Kiara is a modern fashion brand that offers stylish western
                outfits for men and women. Our mission is to provide
                high-quality clothing that blends comfort with modern trends.
              </p>

              <p className="text-muted">
                From casual wear to premium fashion collections, Kiara
                delivers style that defines confidence.
              </p>

              <button className="btn btn-dark mt-3">
                Shop Now
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="bg-light py-5">
        <div className="container">
          <div className="row text-center">

            <div className="col-md-4 mb-4">
              <h4>🚚 Free Shipping</h4>
              <p className="text-muted">
                Free delivery on orders above ₹999.
              </p>
            </div>

            <div className="col-md-4 mb-4">
              <h4>🔄 Easy Returns</h4>
              <p className="text-muted">
                7-day hassle free return policy.
              </p>
            </div>

            <div className="col-md-4 mb-4">
              <h4>⭐ Premium Quality</h4>
              <p className="text-muted">
                High quality western clothing collection.
              </p>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}