// components/Collection.jsx
import Image from "next/image";
import React from "react";

const Collection = () => {
  return (
    <section className="collection bg-light position-relative py-5">
      <div className="container">
        <div className="row">
          <div className="title-xlarge text-uppercase txt-fx domino">
            <span className="word">
              <span className="letter" style={{ transitionDelay: "300ms" }}>C</span>
              <span className="letter" style={{ transitionDelay: "310ms" }}>o</span>
              <span className="letter" style={{ transitionDelay: "320ms" }}>l</span>
              <span className="letter" style={{ transitionDelay: "330ms" }}>l</span>
              <span className="letter" style={{ transitionDelay: "340ms" }}>e</span>
              <span className="letter" style={{ transitionDelay: "350ms" }}>c</span>
              <span className="letter" style={{ transitionDelay: "360ms" }}>t</span>
              <span className="letter" style={{ transitionDelay: "370ms" }}>i</span>
              <span className="letter" style={{ transitionDelay: "380ms" }}>o</span>
              <span className="letter" style={{ transitionDelay: "390ms" }}>n</span>
            </span>
            <span className="letter" style={{ transitionDelay: "300ms" }}>&nbsp;</span>
          </div>

          <div className="collection-item d-flex flex-wrap my-5">
            <div className="col-md-6 column-container">
              <div className="image-holder">
                <Image
                  src="/images/colorbox/single-image-2.jpg"
                  alt="collection"
                  className="product-image img-fluid"
                  width={600} // adjust based on your design
                  height={400} // adjust based on your design
                  priority
                />
              </div>
            </div>

            <div className="col-md-6 column-container bg-white">
              <div className="collection-content p-5 m-0 m-md-5">
                <h3 className="element-title text-uppercase">Classic winter collection</h3>
                <p>
                  Dignissim lacus, turpis ut suspendisse vel tellus. Turpis purus, gravida orci, fringilla a. Ac sed eu
                  fringilla odio mi. Consequat pharetra at magna imperdiet cursus ac faucibus sit libero. Ultricies quam
                  nunc, lorem sit lorem urna, pretium aliquam ut. In vel, quis donec dolor id in. Pulvinar commodo mollis
                  diam sed facilisis at cursus imperdiet cursus ac faucibus sit faucibus sit libero.
                </p>
                <a href="#" className="btn btn-dark text-uppercase mt-3">Shop Collection</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Collection;