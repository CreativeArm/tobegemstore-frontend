import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaChartPie,
  FaBox,
  FaBagShopping,
  FaUsers,
  FaRightFromBracket,
  FaBars,
  FaXmark,
  FaChevronRight,
} from "react-icons/fa6";
import { useAuth } from "../../context/AuthContext";
import "./Admin.css";

const navItems = [
  { to: "/admin", icon: <FaChartPie size={18} />, label: "Dashboard" },
  { to: "/admin/products", icon: <FaBox size={18} />, label: "Products" },
  { to: "/admin/orders", icon: <FaBagShopping size={18} />, label: "Orders" },
  { to: "/admin/users", icon: <FaUsers size={18} />, label: "Users" },
];

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div
      className={`admin-shell ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}
    >
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span className="admin-gem">◆</span>
          {sidebarOpen && (
            <span className="admin-brand-text">
              Tobegem<span>Admin</span>
            </span>
          )}
        </div>

        <nav className="admin-nav">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`admin-nav-item ${location.pathname === item.to ? "active" : ""}`}
            >
              {item.icon}
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          {sidebarOpen && (
            <div className="admin-user-info">
              <div className="admin-avatar">
                {user?.firstName?.[0]}
                {user?.lastName?.[0]}
              </div>
              <div>
                <p className="admin-user-name">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="admin-user-role">Administrator</p>
              </div>
            </div>
          )}
          <button
            className="admin-logout-btn"
            onClick={handleLogout}
            title="Logout"
          >
            <FaRightFromBracket size={16} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="admin-main">
        <header className="admin-topbar">
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen((p) => !p)}
          >
            {sidebarOpen ? <FaXmark size={20} /> : <FaBars size={20} />}
          </button>
          <div className="admin-breadcrumb">
            {navItems.find((n) => n.to === location.pathname)?.label || "Admin"}
          </div>
          <Link to="/" className="view-store-btn" target="_blank">
            View Store <FaChevronRight size={14} />
          </Link>
        </header>
        <div className="admin-content">{children}</div>
      </div>
    </div>
  );
}
