import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaBagShopping,
  FaBox,
  FaUsers,
  FaChartLine,
  FaClock,
  FaCircleCheck,
  FaTruck,
} from "react-icons/fa6";
import api from "../../utils/api";
import AdminLayout from "./AdminLayout";

const fmt = (n) => `₦${Number(n || 0).toLocaleString()}`;

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, productsRes, usersRes] = await Promise.all([
          api.get("/orders/admin/stats"),
          api.get("/products?limit=1"),
          api.get("/users/all"),
        ]);
        const apiStats = statsRes.data?.stats || {};
        const orders = statsRes.data?.recentOrders || [];
        setRecentOrders(orders);
        setStats({
          totalOrders: apiStats.totalOrders || 0,
          totalProducts: productsRes.data.total || 0,
          totalUsers: usersRes.data.total || 0,
          totalRevenue: apiStats.totalRevenue || 0,
          pending: apiStats.pending || 0,
          processing: apiStats.processing || 0,
          shipped: apiStats.shipped || 0,
          delivered: apiStats.delivered || 0,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const statCards = [
    {
      label: "Total Revenue",
      value: fmt(stats?.totalRevenue),
      icon: <FaChartLine size={22} />,
      color: "#c9a84c",
    },
    {
      label: "Total Orders",
      value: stats?.totalOrders,
      icon: <FaBagShopping size={22} />,
      color: "#9d62c2",
    },
    {
      label: "Products",
      value: stats?.totalProducts,
      icon: <FaBox size={22} />,
      color: "#60a5fa",
    },
    {
      label: "Customers",
      value: stats?.totalUsers,
      icon: <FaUsers size={22} />,
      color: "#4ade80",
    },
  ];

  const orderStatusCards = [
    {
      label: "Pending",
      value: stats?.pending,
      icon: <FaClock size={18} />,
      color: "#fbbf24",
    },
    {
      label: "Processing",
      value: stats?.processing,
      icon: <FaBox size={18} />,
      color: "#a78bfa",
    },
    {
      label: "Shipped",
      value: stats?.shipped,
      icon: <FaTruck size={18} />,
      color: "#60a5fa",
    },
    {
      label: "Delivered",
      value: stats?.delivered,
      icon: <FaCircleCheck size={18} />,
      color: "#4ade80",
    },
  ];

  const statusColors = {
    pending: "#fbbf24",
    confirmed: "#60a5fa",
    processing: "#a78bfa",
    shipped: "#34d399",
    out_for_delivery: "#f97316",
    delivered: "#4ade80",
    cancelled: "#f87171",
  };

  return (
    <AdminLayout>
      <div className="admin-page">
        <h1 className="admin-page-title">Dashboard</h1>
        <p className="admin-page-sub">Welcome back! Here's what's happening.</p>

        {loading ? (
          <div className="admin-loading">
            <div className="spinner" />
          </div>
        ) : (
          <>
            {/* Stat Cards */}
            <div className="stat-cards">
              {statCards.map((s, i) => (
                <div key={i} className="stat-card">
                  <div
                    className="stat-card-icon"
                    style={{ background: `${s.color}22`, color: s.color }}
                  >
                    {s.icon}
                  </div>
                  <div>
                    <p className="stat-card-label">{s.label}</p>
                    <p className="stat-card-value">{s.value ?? "—"}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Status */}
            <div className="admin-section">
              <h2 className="admin-section-title">Order Status Overview</h2>
              <div className="status-cards">
                {orderStatusCards.map((s, i) => (
                  <div
                    key={i}
                    className="status-card"
                    style={{ "--status-color": s.color }}
                  >
                    {s.icon}
                    <strong>{s.value ?? 0}</strong>
                    <span>{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Orders */}
            <div className="admin-section">
              <div className="admin-section-header">
                <h2 className="admin-section-title">Recent Orders</h2>
                <Link to="/admin/orders" className="btn btn-outline btn-sm">
                  View All
                </Link>
              </div>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order #</th>
                      <th>Customer</th>
                      <th>Amount</th>
                      <th>Payment</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.length > 0 ? (
                      recentOrders.map((order) => (
                        <tr key={order._id}>
                          <td>
                            <span className="order-num-cell">
                              #{order.orderNumber}
                            </span>
                          </td>
                          <td>
                            {order.user?.firstName} {order.user?.lastName}
                          </td>
                          <td>
                            <span className="price-cell">
                              {fmt(order.pricing?.total)}
                            </span>
                          </td>
                          <td>
                            <span
                              className={`payment-pill ${order.paymentStatus}`}
                            >
                              {order.paymentStatus}
                            </span>
                          </td>
                          <td>
                            <span
                              className="status-pill"
                              style={{
                                "--sc": statusColors[order.status] || "#aaa",
                              }}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td>
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} style={{ textAlign: "center", padding: 24 }}>
                          No orders yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
