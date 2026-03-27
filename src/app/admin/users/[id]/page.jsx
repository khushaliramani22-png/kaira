"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";
import { User, Mail, Phone, MapPin, Package, Calendar, ArrowLeft } from "lucide-react";

export default function UserHistory() {
  const { id } = useParams();
  const router = useRouter();
  
  const [userData, setUserData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
const [userContact, setUserContact] = useState({ phone: "", address: "" });
  useEffect(() => {
  const fetchUserAndOrders = async () => {
    setLoading(true);
    try {
      // 1. યુઝર ડેટા
      const { data: user } = await supabase.from("users").select("*").eq("id", id).single();
      setUserData(user);

      // 2. ઓર્ડર્સ ડેટા (અહીં ખાસ ફિલ્ટર ચેક કરો)
      const { data: userOrders, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", id) // ચેક કરો કે ઓર્ડર ટેબલમાં 'user_id' કોલમ જ છે ને?
        .order("created_at", { ascending: false });

      if (orderError) throw orderError;
      
      console.log("User Orders Found:", userOrders); // આ લાઈન console માં ચેક કરો

      setOrders(userOrders || []);

      // 3. એડ્રેસ સેટ કરવાનું લોજિક
      if (userOrders && userOrders.length > 0) {
        const latest = userOrders[0];
        console.log("Latest Order for Address:", latest); // આ પણ ચેક કરો
        
        setUserContact({
          phone: latest.phone || "No Phone",
          address: `${latest.address || ""}, ${latest.city || ""} - ${latest.pincode || ""}`
        });
      }
    } catch (err) {
      console.error("Error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  if (id) fetchUserAndOrders();
}, [id]);

  if (loading) return <div className="p-5 text-center font-bold">Loading User History...</div>;
  if (!userData) return <div className="p-5 text-center text-danger">User not found!</div>;

  return (
    <div className="container-fluid py-4">
      {/* Back Button */}
      <button onClick={() => router.back()} className="btn btn-sm btn-outline-secondary mb-4 d-flex align-items-center gap-2">
        <ArrowLeft size={16} /> Back to Users
      </button>

      <div className="row">
        {/* Left Side: User Profile Summary */}
        <div className="col-md-4 mb-4">
          <div className="card border-0 shadow-sm p-4">
            <div className="text-center mb-3">
              <div className="bg-light rounded-circle d-inline-flex p-3 mb-2">
                <User size={40} className="text-primary" />
              </div>
              {/* full_name ને બદલે name વાપર્યું */}
              <h4 className="mb-0">{userData.name || "Guest User"}</h4>
              <span className="badge bg-soft-primary text-primary mt-1">Customer</span>
            </div>
            
            <hr />
            
            <div className="user-details mt-3">
              <div className="d-flex align-items-center gap-3 mb-3">
                <Mail size={18} className="text-muted" />
                <div>
                  <small className="text-muted d-block">Email Address</small>
                  <span className="fw-bold">{userData.email}</span>
                </div>
              </div>
              <div className="d-flex align-items-center gap-3 mb-3">
                <Phone size={18} className="text-muted" />
                <div>
                  <small className="text-muted d-block">Phone Number</small>
                  <span>{userContact.phone}</span>
                </div>
              </div>
              <div className="d-flex align-items-center gap-3 mb-3">
                <MapPin size={18} className="text-muted" />
                <div>
                  <small className="text-muted d-block">Address</small>
                  <span className="small">{userContact.address}</span>
                </div>
              </div>
              <div className="d-flex align-items-center gap-3">
                <Calendar size={18} className="text-muted" />
                <div>
                  <small className="text-muted d-block">Member Since</small>
                  <span>{new Date(userData.created_at).toLocaleDateString("en-IN")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Order History Table */}
        <div className="col-md-8">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
              <h5 className="mb-0 d-flex align-items-center gap-2">
                <Package size={20} /> Order History
              </h5>
              <span className="badge bg-dark">{orders.length} Orders</span>
            </div>
            
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="bg-light text-uppercase small fw-bold">
                  <tr>
                    <th>Order ID</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-5 text-muted">
                        No orders found for this user.
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr key={order.id}>
                        <td className="fw-bold text-primary">
                          {order.order_number ? `#${order.order_number}` : `#${order.id.slice(0, 8)}`}
                        </td>
                        <td>{new Date(order.created_at).toLocaleDateString("en-IN")}</td>
                        <td className="fw-bold">₹{order.total_amount}</td>
                        <td>
                          <span className={`badge ${
                            order.status.toLowerCase() === 'delivered' ? 'bg-success' : 
                            order.status.toLowerCase() === 'pending' ? 'bg-warning text-dark' : 
                            order.status.toLowerCase() === 'cancelled' ? 'bg-danger' : 'bg-secondary'
                          } text-uppercase`}>
                            {order.status}
                          </span>
                        </td>
                        <td>
                          <button className="btn btn-sm btn-light border fw-bold" onClick={() => router.push(`/admin/orders/${order.order_number || order.id}`)}>
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}