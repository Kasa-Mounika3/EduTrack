import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getApiError } from '../services/api.js';
import { useAuth } from '../hooks/useAuth.js';
import logo from '../assets/logo.png';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(form);
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
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
        <p className="eyebrow">Welcome back</p>
        <h1 style={{ marginTop: '8px' }}>Login</h1>
        <p>Use your JWT account to access protected EduTrack routes.</p>
        {error && <div className="alert error">{error}</div>}
        <div className="auth-form">
          <label>
            <span>Email</span>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </label>
          <label>
            <span>Password</span>
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </label>
          <button className="primary-button" disabled={loading}>{loading ? 'Signing in...' : 'Login'}</button>
        </div>
        <p className="auth-switch">
          New user? <Link to="/register">Create an account</Link>
        </p>
      </form>
    </section>
  );
};

export default Login;
