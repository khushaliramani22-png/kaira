"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link"; 

export default function AllUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase.from("profiles").select("*");
      if (error) console.error(error);
      else setUsers(data);
      setLoading(false);
    };
    fetchUsers();
  }, []);

  return (
    <div className="container-fluid">
      <h3 className="mb-4">All Registered Users</h3>
      <div className="card shadow-sm border-0">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light">
              <tr>
                <th>User Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined Date</th>
                <th>Status</th>
                <th>Action</th> 
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="text-center">Loading...</td></tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.full_name || "N/A"}</td>
                    <td>{user.email}</td>
                    <td><span className="badge bg-info">{user.role || "Customer"}</span></td>
                    <td>{new Date(user.created_at).toLocaleDateString()}</td>
                    <td><span className="text-success">● Active</span></td>
                    <td>
                   
                      <Link 
                        href={`/admin/users/${user.id}`} 
                        className="btn btn-sm btn-outline-primary"
                      >
                        View History
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}