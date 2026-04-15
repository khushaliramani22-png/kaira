"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";

export default function CouponsListPage() {
  const supabase = createClient();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    const { data, error } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
    if (!error) setCoupons(data);
    setLoading(false);
  };

  const deleteCoupon = async (id) => {
    if (confirm("Are you sure?")) {
      const { error } = await supabase.from("coupons").delete().eq("id", id);
      if (!error) fetchCoupons();
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="h4 fw-bold">Manage Coupons</h2>
        <Link href="/admin/coupons/add" className="btn btn-dark btn-sm px-4">
          + Add New Coupon
        </Link>
      </div>

      <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
        <table className="table mb-0">
          <thead className="table-light text-uppercase small">
            <tr>
              <th className="px-4 py-3">Code</th>
              <th>Type</th>
              <th>Value</th>
              <th>Expiry</th>
              <th className="text-end px-4">Action</th>
            </tr>
          </thead>
          <tbody className="small">
            {coupons.map((coupon) => (
              <tr key={coupon.id} className="align-middle">
                <td className="px-4 fw-bold text-primary">{coupon.code}</td>
                <td>{coupon.discount_type}</td>
                <td>{coupon.discount_type === 'fixed' ? `₹${coupon.discount_value}` : `${coupon.discount_value}%`}</td>
                <td>{new Date(coupon.expiry_date).toLocaleDateString()}</td>
                <td className="text-end px-4">
                  <button onClick={() => deleteCoupon(coupon.id)} className="btn btn-outline-danger btn-sm">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {coupons.length === 0 && !loading && <p className="text-center p-5 text-muted">No coupons found.</p>}
      </div>
    </div>
  );
}