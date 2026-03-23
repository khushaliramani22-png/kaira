"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function OrderTracking() {
  const [orderId, setOrderId] = useState(""); // આમાં યુઝર સાદો નંબર (101, 102) નાખશે
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTrackOrder = async () => {
    if (!orderId) return alert("કૃપા કરીને Order ID નાખો");

    setLoading(true);
    setError("");
    setOrderData(null);

    // હવે આપણે order_number થી સર્ચ કરીશું
    const { data, error } = await supabase
      .from("orders")
      .select("order_number, status, customer_name, total_amount, created_at")
      .eq("order_number", orderId)
      .single();

    if (error) {
      setError(
        "No details found for this order number.");
    } else {
      setOrderData(data);
    }
    setLoading(false);
  };

  return (
    <div className="container py-5 text-center">
      <h1 className="fw-bold">Track Your Order</h1>
      <p className="text-muted">

        To know the status of your order, enter your order ID.
      </p>

      <div className="row justify-content-center mt-4">
        <div className="col-md-5">
          <div className="input-group mb-3">
            <input
              type="number"
              className="form-control"
              placeholder="Enter Order Number"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
            />
            <button
              className="btn btn-dark px-4"
              onClick={handleTrackOrder}
              disabled={loading}
            >
              {loading ? "Searching..." : "Track"}
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 text-danger font-weight-bold animate__animated animate__fadeIn">
          {error}
        </div>
      )}

      {/* Order Status Display Section */}
      {orderData && (
        <div className="row justify-content-center mt-5">
          <div className="col-md-6 text-start">
            <div className="card shadow border-0 p-4 rounded-4 shadow-sm bg-white">
              <h4 className="mb-4 text-center fw-bold border-bottom pb-3">Order Status</h4>

              <div className="d-flex justify-content-between mb-3">
                <span className="text-muted">Order ID:</span>
                <span className="fw-bold text-dark">#{orderData.order_number}</span>
              </div>

              <div className="d-flex justify-content-between mb-3">
                <span className="text-muted">Customer:</span>
                <span className="fw-bold">{orderData.customer_name}</span>
              </div>

              <div className="d-flex justify-content-between mb-3">
                <span className="text-muted">Total Amount:</span>
                <span className="fw-bold text-success">₹{orderData.total_amount}</span>
              </div>

              <div className="d-flex justify-content-between align-items-center mb-4">
                <span className="text-muted">Status:</span>
                <span className={`badge rounded-pill px-3 py-2 ${orderData.status === 'Delivered' ? 'bg-success' :
                  orderData.status === 'Canceled' ? 'bg-danger' : 'bg-primary'
                  }`}>
                  {orderData.status ? orderData.status.toUpperCase() : "PENDING"}
                </span>
              </div>

              <hr className="my-4" />

              <div className="text-center">
                <small className="text-muted d-block">
                  Ordered on: {new Date(orderData.created_at).toLocaleDateString('en-GB')}
                </small>
                <p className="mt-3 text-primary small mb-0">Thank you for your order!</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}