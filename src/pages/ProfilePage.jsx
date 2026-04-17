import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaPen, FaLocationDot, FaPlus, FaTrashCan, FaLock } from 'react-icons/fa6';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../utils/api';
import toast from 'react-hot-toast';
import './ProfilePage.css';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ firstName: user?.firstName || '', lastName: user?.lastName || '', phone: user?.phone || '' });
  const [loading, setLoading] = useState(false);
  const [addingAddr, setAddingAddr] = useState(false);
  const [addrForm, setAddrForm] = useState({ street: '', city: '', state: '', country: 'Nigeria', zipCode: '' });

  const handleProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await userAPI.updateProfile(form);
      updateUser(data.user);
      toast.success('Profile updated!');
      setEditing(false);
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      await userAPI.addAddress(addrForm);
      toast.success('Address added!');
      setAddingAddr(false);
      setAddrForm({ street: '', city: '', state: '', country: 'Nigeria', zipCode: '' });
    } catch {
      toast.error('Failed to add address');
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      await userAPI.deleteAddress(id);
      toast.success('Address removed');
    } catch {
      toast.error('Failed to remove address');
    }
  };

  return (
    <div className="profile-page">
      <div className="container">
        <div className="page-header-row">
          <div>
            <div className="section-label">Account</div>
            <h1 className="profile-title">My Profile</h1>
          </div>
          <Link to="/change-password" className="btn btn-outline btn-sm">
            <FaLock size={14} /> Change Password
          </Link>
        </div>

        <div className="profile-grid">
          {/* Profile Info */}
          <div className="profile-card">
            <div className="profile-avatar-section">
              <div className="profile-avatar">
                {user?.avatar
                  ? <img src={user.avatar} alt="avatar" />
                  : <span>{user?.firstName?.[0]}{user?.lastName?.[0]}</span>
                }
              </div>
              <div>
                <h2 className="profile-name">{user?.firstName} {user?.lastName}</h2>
                <p className="profile-email">{user?.email}</p>
                {user?.role === 'admin' && <span className="admin-badge">Admin</span>}
              </div>
            </div>

            {editing ? (
              <form onSubmit={handleProfile} className="profile-form">
                <div className="form-row-2">
                  <div className="input-group">
                    <label className="input-label">First Name</label>
                    <input className="input-field" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} required />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Last Name</label>
                    <input className="input-field" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} required />
                  </div>
                </div>
                <div className="input-group">
                  <label className="input-label">Phone Number</label>
                  <input className="input-field" type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-gold" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</button>
                  <button type="button" className="btn btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
                </div>
              </form>
            ) : (
              <div className="profile-info">
                <div className="info-item"><span>Phone</span><strong>{user?.phone || 'Not provided'}</strong></div>
                <div className="info-item"><span>Member since</span><strong>{new Date(user?.createdAt).toLocaleDateString('en-NG', { year: 'numeric', month: 'long' })}</strong></div>
                <div className="info-item"><span>Role</span><strong style={{ textTransform: 'capitalize' }}>{user?.role}</strong></div>
                <button className="btn btn-outline btn-sm" onClick={() => setEditing(true)} style={{ marginTop: 8, alignSelf: 'flex-start' }}>
                  <FaPen size={14} /> Edit Profile
                </button>
              </div>
            )}
          </div>

          {/* Addresses */}
          <div className="profile-card">
            <div className="card-header-row">
              <h3 className="card-section-title"><FaLocationDot size={16} /> Addresses</h3>
              <button className="btn btn-outline btn-sm" onClick={() => setAddingAddr(p => !p)}>
                <FaPlus size={14} /> Add Address
              </button>
            </div>

            {addingAddr && (
              <form onSubmit={handleAddAddress} className="addr-form">
                <div className="input-group">
                  <label className="input-label">Street</label>
                  <input className="input-field" value={addrForm.street} onChange={e => setAddrForm(f => ({ ...f, street: e.target.value }))} required />
                </div>
                <div className="form-row-2">
                  <div className="input-group">
                    <label className="input-label">City</label>
                    <input className="input-field" value={addrForm.city} onChange={e => setAddrForm(f => ({ ...f, city: e.target.value }))} required />
                  </div>
                  <div className="input-group">
                    <label className="input-label">State</label>
                    <input className="input-field" value={addrForm.state} onChange={e => setAddrForm(f => ({ ...f, state: e.target.value }))} required />
                  </div>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-gold btn-sm">Save Address</button>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setAddingAddr(false)}>Cancel</button>
                </div>
              </form>
            )}

            <div className="addresses-list">
              {(!user?.addresses || user.addresses.length === 0) && !addingAddr && (
                <p className="no-data">No saved addresses yet.</p>
              )}
              {user?.addresses?.map(addr => (
                <div key={addr._id} className="address-card">
                  <div>
                    <p>{addr.street}</p>
                    <p>{addr.city}, {addr.state}</p>
                    <p>{addr.country}</p>
                  </div>
                  <button className="icon-btn danger-icon" onClick={() => handleDeleteAddress(addr._id)}>
                    <FaTrashCan size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="profile-card quick-links">
            <h3 className="card-section-title">Quick Links</h3>
            <div className="quick-link-grid">
              {[
                { to: '/orders', icon: '📦', label: 'My Orders' },
                { to: '/wishlist', icon: '♡', label: 'Wishlist' },
                { to: '/change-password', icon: '🔒', label: 'Change Password' },
              ].map(link => (
                <Link key={link.to} to={link.to} className="quick-link-btn">
                  <span className="ql-icon">{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
