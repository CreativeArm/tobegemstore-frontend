import React, { useEffect, useState } from "react";
import { FaXmark, FaEye } from "react-icons/fa6";
import api from "../../utils/api";
import AdminLayout from "./AdminLayout";
import toast from "react-hot-toast";

const fmt = (n) => `₦${Number(n).toLocaleString()}`;

const STATUS_OPTIONS = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancelled",
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

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [updateForm, setUpdateForm] = useState({
    status: "",
    description: "",
    location: "",
    trackingNumber: "",
  });
  const [updating, setUpdating] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (statusFilter) params.status = statusFilter;
      const { data } = await api.get("/orders", { params });
      setOrders(data.orders || []);
      setTotal(data.total || 0);
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [page, statusFilter]);

  const openOrder = (order) => {
    setSelected(order);
    setUpdateForm({
      status: order.status,
      description: "",
      location: "",
      trackingNumber: order.trackingNumber || "",
    });
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!updateForm.description) {
      toast.error("Please add a status description");
      return;
    }
    setUpdating(true);
    try {
      await api.put(`/orders/${selected._id}/status`, updateForm);
      toast.success("Order status updated!");
      setSelected(null);
      load();
    } catch {
      toast.error("Update failed");
    } finally {
      setUpdating(false);
    }
  };

  const confirmPayment = async (orderId) => {
    try {
      await api.put(`/orders/${orderId}/confirm-payment`);
      toast.success("Payment confirmed!");
      load();
    } catch {
      toast.error("Failed to confirm payment");
    }
  };

  return (
    <AdminLayout>
      <div className="admin-page">
        <div className="admin-page-header">
          <div>
            <h1 className="admin-page-title">Orders</h1>
            <p className="admin-page-sub">{total} orders total</p>
          </div>
        </div>

        {/* Filters */}
        <div className="admin-filters">
          <select
            className="input-field filter-select"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s.replace("_", " ").toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: 40 }}>
                    <div className="spinner" style={{ margin: "0 auto" }} />
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id}>
                    <td>
                      <span className="order-num-cell">
                        #{order.orderNumber}
                      </span>
                    </td>
                    <td>
                      <p style={{ fontSize: 13, color: "var(--text-primary)" }}>
                        {order.user?.firstName} {order.user?.lastName}
                      </p>
                      <p style={{ fontSize: 11, color: "var(--text-muted)" }}>
                        {order.shippingAddress?.city}
                      </p>
                    </td>
                    <td style={{ fontSize: 13 }}>
                      {order.items?.length} item(s)
                    </td>
                    <td>
                      <span className="price-cell">
                        {fmt(order.pricing?.total)}
                      </span>
                    </td>
                    <td>
                      <span className={`payment-pill ${order.paymentStatus}`}>
                        {order.paymentStatus}
                      </span>
                      {order.paymentStatus === "pending" &&
                        order.paymentMethod === "bank_transfer" && (
                          <button
                            className="confirm-pay-btn"
                            onClick={() => confirmPayment(order._id)}
                          >
                            Confirm
                          </button>
                        )}
                    </td>
                    <td>
                      <span
                        className="status-pill"
                        style={{ "--sc": statusColors[order.status] || "#aaa" }}
                      >
                        {order.status?.replace("_", " ")}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <button
                        className="tbl-btn edit"
                        onClick={() => openOrder(order)}
                        title="Manage"
                      >
                        <FaEye size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {Math.ceil(total / 15) > 1 && (
          <div className="pagination" style={{ marginTop: 24 }}>
            {[...Array(Math.ceil(total / 15))].map((_, i) => (
              <button
                key={i}
                className={`page-btn ${page === i + 1 ? "active" : ""}`}
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <div
            className="admin-modal wide"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <h2>Order #{selected.orderNumber}</h2>
              <button className="icon-btn" onClick={() => setSelected(null)}>
                <FaXmark size={20} />
              </button>
            </div>
            <div className="admin-modal-body order-detail-modal">
              {/* Items */}
              <div className="order-modal-section">
                <h3>Items</h3>
                {selected.items.map((item, i) => (
                  <div key={i} className="order-modal-item">
                    <img src={item.image} alt={item.name} />
                    <div>
                      <p>{item.name}</p>
                      <span>
                        Qty: {item.quantity} · {fmt(item.price)}
                      </span>
                    </div>
                    <strong>{fmt(item.price * item.quantity)}</strong>
                  </div>
                ))}
              </div>

              {/* Shipping */}
              <div className="order-modal-section">
                <h3>Shipping Address</h3>
                <p>
                  {selected.shippingAddress.firstName}{" "}
                  {selected.shippingAddress.lastName}
                </p>
                <p>
                  {selected.shippingAddress.street},{" "}
                  {selected.shippingAddress.city}
                </p>
                <p>
                  {selected.shippingAddress.state},{" "}
                  {selected.shippingAddress.country}
                </p>
                <p>{selected.shippingAddress.phone}</p>
              </div>

              {/* Payment */}
              <div className="order-modal-section">
                <h3>Payment</h3>
                <p>
                  Method:{" "}
                  <strong>{selected.paymentMethod?.replace("_", " ")}</strong>
                </p>
                <p>
                  Status:{" "}
                  <strong
                    style={{
                      color:
                        selected.paymentStatus === "paid"
                          ? "var(--success)"
                          : "var(--warning)",
                    }}
                  >
                    {selected.paymentStatus}
                  </strong>
                </p>
                <p>
                  Total:{" "}
                  <strong style={{ color: "var(--gold)" }}>
                    {fmt(selected.pricing.total)}
                  </strong>
                </p>
              </div>

              {/* Update Status */}
              <div className="order-modal-section full">
                <h3>Update Order Status</h3>
                <form
                  onSubmit={handleUpdateStatus}
                  className="status-update-form"
                >
                  <select
                    className="input-field"
                    value={updateForm.status}
                    onChange={(e) =>
                      setUpdateForm((f) => ({ ...f, status: e.target.value }))
                    }
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s.replace("_", " ").toUpperCase()}
                      </option>
                    ))}
                  </select>
                  <input
                    className="input-field"
                    placeholder="Status description *"
                    value={updateForm.description}
                    onChange={(e) =>
                      setUpdateForm((f) => ({
                        ...f,
                        description: e.target.value,
                      }))
                    }
                    required
                  />
                  <input
                    className="input-field"
                    placeholder="Location (optional)"
                    value={updateForm.location}
                    onChange={(e) =>
                      setUpdateForm((f) => ({ ...f, location: e.target.value }))
                    }
                  />
                  <input
                    className="input-field"
                    placeholder="Tracking number (optional)"
                    value={updateForm.trackingNumber}
                    onChange={(e) =>
                      setUpdateForm((f) => ({
                        ...f,
                        trackingNumber: e.target.value,
                      }))
                    }
                  />
                  <button
                    type="submit"
                    className="btn btn-gold"
                    disabled={updating}
                  >
                    {updating ? "Updating..." : "Update Status"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
