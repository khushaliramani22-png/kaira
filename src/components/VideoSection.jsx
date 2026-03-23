export default function VideoSection() {
  return (
    <section className="video py-5 overflow-hidden">
      <div className="container-fluid">

        <img
          src="/images/video-image.jpg"
          className="img-fluid"
        />

        <a
          className="youtube"
          href="https://www.youtube.com/embed/pjtsGzQjFM4"
        >
          ▶ Play Video
        </a>

      </div>
    </section>
  );
}