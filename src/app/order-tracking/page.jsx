export default function OrderTracking() {
  return (
    <div className="container py-5 text-center">

      <h1>Track Your Order</h1>

      <p className="text-muted">
        Enter your Order ID to check the delivery status.
      </p>

      <div className="row justify-content-center mt-4">

        <div className="col-md-6">
          <input
            className="form-control mb-3"
            placeholder="Enter Order ID"
          />

          <button className="btn btn-dark">
            Track Order
          </button>
        </div>

      </div>

    </div>
  );
}