export default function Instagram() {
  return (
    <section className="instagram position-relative">

      <div className="position-absolute bottom-0 w-100 text-center">
        <a
          href="https://www.instagram.com/templatesjungle/"
          className="btn btn-dark px-5"
        >
          Follow us on Instagram
        </a>
      </div>

      <div className="row g-0">

        <div className="col-6 col-md-2">
          <img src="/images/insta-item1.jpg" className="img-fluid"/>
        </div>

        <div className="col-6 col-md-2">
          <img src="/images/insta-item2.jpg" className="img-fluid"/>
        </div>

        <div className="col-6 col-md-2">
          <img src="/images/insta-item3.jpg" className="img-fluid"/>
        </div>

        <div className="col-6 col-md-2">
          <img src="/images/insta-item4.jpg" className="img-fluid"/>
        </div>

        <div className="col-6 col-md-2">
          <img src="/images/insta-item5.jpg" className="img-fluid"/>
        </div>

        <div className="col-6 col-md-2">
          <img src="/images/insta-item6.jpg" className="img-fluid"/>
        </div>

      </div>

    </section>
  );
}