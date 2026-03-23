"use client";

export default function HeroSlider() {
  return (
    <section id="billboard" className="bg-light py-5">
      <div className="container">

        <div className="row justify-content-center">
          <h1 className="section-title text-center mt-4">
            New Collections
          </h1>

          <div className="col-md-6 text-center">
            <p>
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
            </p>
          </div>
        </div>

        <div className="row">

          <div className="col-md-4">
            <div className="banner-item image-zoom-effect">

              <div className="image-holder">
                <a href="#">
                  <img
                    src="/images/colorbox/banner-image-6.jpg"
                    alt="product"
                    className="img-fluid"
                  />
                </a>
              </div>

              <div className="banner-content py-4">
                <h5 className="element-title text-uppercase">
                  <a href="#" className="item-anchor">
                    Soft leather jackets
                  </a>
                </h5>

                <p>
                  Scelerisque duis aliquam qui lorem ipsum dolor amet.
                </p>

                <div className="btn-left">
                  <a
                    href="#"
                    className="btn-link fs-6 text-uppercase text-decoration-none"
                  >
                    Discover Now
                  </a>
                </div>
              </div>

            </div>
          </div>

          <div className="col-md-4">
            <div className="banner-item image-zoom-effect">

              <div className="image-holder">
                <a href="#">
                  <img
                    src="/images/colorbox/banner-image-1.jpg"
                    alt="product"
                    className="img-fluid"
                  />
                </a>
              </div>

              <div className="banner-content py-4">
                <h5 className="element-title text-uppercase">
                  <a href="#" className="item-anchor">
                    Modern fashion
                  </a>
                </h5>

                <p>Lorem ipsum dolor sit amet consectetur.</p>

                <div className="btn-left">
                  <a
                    href="#"
                    className="btn-link fs-6 text-uppercase text-decoration-none"
                  >
                    Discover Now
                  </a>
                </div>
              </div>

            </div>
          </div>

          <div className="col-md-4">
            <div className="banner-item image-zoom-effect">

              <div className="image-holder">
                <a href="#">
                  <img
                    src="/images/colorbox/banner-image-2.jpg"
                    alt="product"
                    className="img-fluid"
                  />
                </a>
              </div>

              <div className="banner-content py-4">
                <h5 className="element-title text-uppercase">
                  <a href="#" className="item-anchor">
                    Stylish wear
                  </a>
                </h5>

                <p>Lorem ipsum dolor sit amet consectetur.</p>

                <div className="btn-left">
                  <a
                    href="#"
                    className="btn-link fs-6 text-uppercase text-decoration-none"
                  >
                    Discover Now
                  </a>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}