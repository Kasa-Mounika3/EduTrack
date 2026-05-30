import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getApiError } from '../services/api.js';
import { useAuth } from '../hooks/useAuth.js';
import logo from '../assets/logo.png';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    parentName: '',
    parentEmail: '',
    parentPhone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      await register(form);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px', borderBottom: '1px solid var(--line)', paddingBottom: '16px' }}>
          <img src={logo} alt="EduTrack Logo" style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'contain' }} />
          <div>
            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>EduTrack</h2>
            <small style={{ color: 'var(--muted)', display: 'block', fontSize: '0.8rem', marginTop: '2px' }}>Smart Student Management System</small>
          </div>
        </div>
        <p className="eyebrow">Create account</p>
        <h1 style={{ marginTop: '8px' }}>Register</h1>
        <p>Choose Admin for full management access or Student for profile-only access.</p>
        {error && <div className="alert error">{error}</div>}
        <div className="auth-form">
          <label><span>Name</span><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
          <label><span>Email</span><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
          <label><span>Password</span><input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
          <label><span>Access Type</span><select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}><option value="student">Student</option><option value="teacher">Teacher</option><option value="parent">Parent</option><option value="admin">School Admin</option></select></label>
          {form.role === 'student' && (
            <>
              <label><span>Parent Name</span><input value={form.parentName} onChange={(e) => setForm({ ...form, parentName: e.target.value })} /></label>
              <label><span>Parent Email</span><input type="email" value={form.parentEmail} onChange={(e) => setForm({ ...form, parentEmail: e.target.value })} /></label>
              <label><span>Parent Phone</span><input value={form.parentPhone} onChange={(e) => setForm({ ...form, parentPhone: e.target.value })} /></label>
            </>
          )}
          <button className="primary-button" disabled={loading}>{loading ? 'Creating account...' : 'Register'}</button>
        </div>
        <p className="auth-switch">
          Already registered? <Link to="/login">Login</Link>
        </p>
      </form>
    </section>
  );
};

export default Register;
