// ============ LoginPage.jsx ============
import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaRightToBracket } from 'react-icons/fa6';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './AuthPages.css';

export function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const postLoginPath = () => {
    const raw = searchParams.get('redirect');
    if (raw == null || raw === '' || raw === '/') return '/';
    return raw.startsWith('/') ? raw : `/${raw}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
      setLoading(false);
      return;
    }
    setLoading(false);
    navigate(postLoginPath(), { replace: true });
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
      </div>
      <div className="auth-card">
        <div className="auth-brand">
          <span className="auth-gem">◆</span>
          <h1>TobegemStore</h1>
        </div>
        <h2 className="auth-title">Welcome Back</h2>
        <p className="auth-subtitle">Sign in to continue your luxury journey</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label className="input-label">Email Address</label>
            <input type="email" className="input-field" placeholder="you@example.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
          </div>
          <div className="input-group">
            <label className="input-label">Password</label>
            <div className="input-with-icon">
              <input type={showPass ? 'text' : 'password'} className="input-field" placeholder="••••••••" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
              <button type="button" className="input-icon-btn" onClick={() => setShowPass(p => !p)}>
                {showPass ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
              </button>
            </div>
          </div>
          <div style={{ textAlign: 'right', marginTop: -8, marginBottom: 16 }}>
            <Link to="/forgot-password" className="auth-link">Forgot password?</Link>
          </div>
          <button type="submit" className="btn btn-gold btn-full btn-lg" disabled={loading}>
            {loading ? 'Signing in...' : <><FaRightToBracket size={16} /> Sign In</>}
          </button>
        </form>

        <p className="auth-footer-text">
          Don't have an account? <Link to="/register" className="auth-link">Create one</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
