import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  FaEnvelope,
  FaArrowLeft,
  FaEye,
  FaEyeSlash,
  FaKey,
  FaLock,
} from 'react-icons/fa6';
import { authAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './AuthPages.css';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.forgotPassword(email);
      setSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg"><div className="auth-orb auth-orb-1" /><div className="auth-orb auth-orb-2" /></div>
      <div className="auth-card">
        <div className="auth-brand"><span className="auth-gem">◆</span><h1>TobegemStore</h1></div>
        {sent ? (
          <div className="auth-success">
            <div className="success-icon"><FaEnvelope size={32} /></div>
            <h2 className="auth-title">Check Your Email</h2>
            <p className="auth-subtitle">We've sent a password reset link to <strong>{email}</strong>. Check your inbox and follow the instructions.</p>
            <Link to="/login" className="btn btn-gold btn-full" style={{ marginTop: 24 }}>Back to Sign In</Link>
          </div>
        ) : (
          <>
            <h2 className="auth-title">Forgot Password?</h2>
            <p className="auth-subtitle">Enter your email and we'll send you a reset link</p>
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="input-group">
                <label className="input-label">Email Address</label>
                <input type="email" className="input-field" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <button type="submit" className="btn btn-gold btn-full btn-lg" disabled={loading}>
                {loading ? 'Sending...' : <><FaEnvelope size={16} /> Send Reset Link</>}
              </button>
            </form>
            <p className="auth-footer-text">
              <Link to="/login" className="auth-link"><FaArrowLeft size={14} /> Back to Sign In</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await authAPI.resetPassword(token, form.password);
      toast.success('Password reset successfully!');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed. Link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg"><div className="auth-orb auth-orb-1" /><div className="auth-orb auth-orb-2" /></div>
      <div className="auth-card">
        <div className="auth-brand"><span className="auth-gem">◆</span><h1>TobegemStore</h1></div>
        <h2 className="auth-title">Reset Password</h2>
        <p className="auth-subtitle">Choose a strong new password</p>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label className="input-label">New Password</label>
            <div className="input-with-icon">
              <input type={showPass ? 'text' : 'password'} className="input-field" placeholder="Min. 6 characters" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
              <button type="button" className="input-icon-btn" onClick={() => setShowPass(p => !p)}>
                {showPass ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
              </button>
            </div>
          </div>
          <div className="input-group">
            <label className="input-label">Confirm New Password</label>
            <input type="password" className="input-field" placeholder="Repeat password" value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))} required />
          </div>
          <button type="submit" className="btn btn-gold btn-full btn-lg" disabled={loading}>
            {loading ? 'Resetting...' : <><FaKey size={16} /> Reset Password</>}
          </button>
        </form>
      </div>
    </div>
  );
}

export function ChangePassword() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [showPass, setShowPass] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const toggleShow = (k) => setShowPass(p => ({ ...p, [k]: !p[k] }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirm) { toast.error('Passwords do not match'); return; }
    if (form.newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await authAPI.changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
      toast.success('Password changed! Please sign in again.');
      logout();
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg"><div className="auth-orb auth-orb-1" /><div className="auth-orb auth-orb-2" /></div>
      <div className="auth-card">
        <div className="auth-brand"><span className="auth-gem">◆</span><h1>TobegemStore</h1></div>
        <h2 className="auth-title">Change Password</h2>
        <p className="auth-subtitle">Keep your account secure</p>
        <form onSubmit={handleSubmit} className="auth-form">
          {['currentPassword', 'newPassword', 'confirm'].map((k, i) => (
            <div key={k} className="input-group">
              <label className="input-label">{['Current Password', 'New Password', 'Confirm New Password'][i]}</label>
              <div className="input-with-icon">
                <input type={showPass[k] ? 'text' : 'password'} className="input-field" placeholder="••••••••" value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} required />
                <button type="button" className="input-icon-btn" onClick={() => toggleShow(k)}>
                  {showPass[k] ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                </button>
              </div>
            </div>
          ))}
          <button type="submit" className="btn btn-gold btn-full btn-lg" disabled={loading}>
            {loading ? 'Updating...' : <><FaLock size={16} /> Update Password</>}
          </button>
        </form>
        <p className="auth-footer-text">
          <Link to="/profile" className="auth-link"><FaArrowLeft size={14} /> Back to Profile</Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;
