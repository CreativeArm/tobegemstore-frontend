import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaUserPlus } from 'react-icons/fa6';
import { useAuth } from '../context/AuthContext';
import GoogleAuthSection from '../components/auth/GoogleAuthSection';
import toast from 'react-hot-toast';
import './AuthPages.css';

export default function RegisterPage() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirm: '', phone: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, googleSignIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register({ firstName: form.firstName, lastName: form.lastName, email: form.email, password: form.password, phone: form.phone });
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async (credential) => {
    setLoading(true);
    try {
      await googleSignIn(credential);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Google sign-in failed');
      setLoading(false);
      return;
    }
    setLoading(false);
  };

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
      </div>
      <div className="auth-card wide">
        <div className="auth-brand">
          <span className="auth-gem">◆</span>
          <h1>TobegemStore</h1>
        </div>
        <h2 className="auth-title">Create Account</h2>
        <p className="auth-subtitle">Join thousands of satisfied customers</p>

        <GoogleAuthSection
          mode="signup"
          loading={loading}
          onCredential={handleGoogleSignIn}
        />

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="input-group">
              <label className="input-label">First Name</label>
              <input className="input-field" placeholder="Amaka" value={form.firstName} onChange={set('firstName')} required />
            </div>
            <div className="input-group">
              <label className="input-label">Last Name</label>
              <input className="input-field" placeholder="Okonkwo" value={form.lastName} onChange={set('lastName')} required />
            </div>
          </div>
          <div className="input-group">
            <label className="input-label">Email Address</label>
            <input type="email" className="input-field" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
          </div>
          <div className="input-group">
            <label className="input-label">Phone Number</label>
            <input type="tel" className="input-field" placeholder="+234 800 000 0000" value={form.phone} onChange={set('phone')} />
          </div>
          <div className="form-row">
            <div className="input-group">
              <label className="input-label">Password</label>
              <div className="input-with-icon">
                <input type={showPass ? 'text' : 'password'} className="input-field" placeholder="Min. 6 characters" value={form.password} onChange={set('password')} required />
                <button type="button" className="input-icon-btn" onClick={() => setShowPass(p => !p)}>
                  {showPass ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                </button>
              </div>
            </div>
            <div className="input-group">
              <label className="input-label">Confirm Password</label>
              <input type="password" className="input-field" placeholder="Repeat password" value={form.confirm} onChange={set('confirm')} required />
            </div>
          </div>
          <button type="submit" className="btn btn-gold btn-full btn-lg" disabled={loading}>
            {loading ? 'Creating Account...' : <><FaUserPlus size={16} /> Create Account</>}
          </button>
        </form>

        <p className="auth-footer-text">
          Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
