export default function Blog() {
  return (
    <section className="blog py-5">
      <div className="container">

        <div className="d-flex flex-wrap justify-content-between align-items-center mt-5 mb-3">
          <h4 className="text-uppercase">Read Blog Posts</h4>
          <a href="/" className="btn-link">View All</a>
        </div>

        <div className="row">

          <div className="col-md-4">
            <article className="post-item">
              <div className="post-image">
                <img src="/images/colorbox/post-image1.jpg" className="img-fluid"/>
              </div>

              <div className="post-content my-3">
                <div className="post-meta text-uppercase text-secondary">
                  Fashion 
                </div>

                <h5 className="text-uppercase">
                  How to look outstanding in pastel
                </h5>

                <p>
                  Dignissim lacus turpis ut suspendisse vel tellus.
                </p>
              </div>
            </article>
          </div>

          <div className="col-md-4">
            <article className="post-item">
              <img src="/images/colorbox/post-image2.jpg" className="img-fluid"/>
              <div className="post-content my-3">
                <div className="post-meta text-uppercase text-secondary">
                  Fashion 
                </div>

                <h5 className="text-uppercase">
                  Top 10 fashion trend for summer
                </h5>
              </div>
            </article>
          </div>

          <div className="col-md-4">
            <article className="post-item">
              <img src="/images/colorbox/post-image3.jpg" className="img-fluid"/>
              <div className="post-content my-3">
                <div className="post-meta text-uppercase text-secondary">
                  Fashion 
                </div>

                <h5 className="text-uppercase">
                  Crazy fashion with unique moment
                </h5>
              </div>
            </article>
          </div>

        </div>

      </div>
    </section>
  );
}