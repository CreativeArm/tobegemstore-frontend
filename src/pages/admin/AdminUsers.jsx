import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import AdminLayout from "./AdminLayout";
import toast from "react-hot-toast";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/users/all")
      .then((r) => {
        setUsers(r.data.users || []);
        setTotal(r.data.total || 0);
      })
      .catch(() => toast.error("Failed to load users"))
      .finally(() => setLoading(false));
  }, []);

  const toggleActive = async (userId, current) => {
    try {
      await api.put(`/users/${userId}/toggle-active`);
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, isActive: !current } : u)),
      );
      toast.success(current ? "User deactivated" : "User activated");
    } catch {
      toast.error("Failed");
    }
  };

  return (
    <AdminLayout>
      <div className="admin-page">
        <div className="admin-page-header">
          <div>
            <h1 className="admin-page-title">Users</h1>
            <p className="admin-page-sub">{total} registered users</p>
          </div>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: 40 }}>
                    <div className="spinner" style={{ margin: "0 auto" }} />
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <div className="user-cell">
                        <div className="user-cell-avatar">
                          {u.firstName?.[0]}
                          {u.lastName?.[0]}
                        </div>
                        <span>
                          {u.firstName} {u.lastName}
                        </span>
                      </div>
                    </td>
                    <td
                      style={{ fontSize: 13, color: "var(--text-secondary)" }}
                    >
                      {u.email}
                    </td>
                    <td style={{ fontSize: 13, color: "var(--text-muted)" }}>
                      {u.phone || "—"}
                    </td>
                    <td>
                      <span className={`role-pill ${u.role}`}>{u.role}</span>
                    </td>
                    <td style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <span
                        className={`active-pill ${u.isActive ? "active" : "inactive"}`}
                      >
                        {u.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <button
                        className={`tbl-btn ${u.isActive ? "del" : "edit"}`}
                        onClick={() => toggleActive(u._id, u.isActive)}
                        title={u.isActive ? "Deactivate" : "Activate"}
                      >
                        {u.isActive ? "🚫" : "✅"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
