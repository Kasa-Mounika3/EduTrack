import { Link, useLocation, useNavigate } from 'react-router-dom';
import LoginForm from '../components/LoginForm.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { getApiErrorMessage } from '../services/apiClient.js';
import logo from '../assets/logo.png';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, error, setError } = useAuth();

  const handleLogin = async (payload) => {
    try {
      await login(payload);
      const redirectTo = location.state?.from?.pathname || '/';
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px', borderBottom: '1px solid var(--line)', paddingBottom: '16px' }}>
          <img src={logo} alt="EduTrack Logo" style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'contain' }} />
          <div>
            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>EduTrack</h2>
            <small style={{ color: 'var(--muted)', display: 'block', fontSize: '0.8rem', marginTop: '2px' }}>Smart Student Management System</small>
          </div>
        </div>
        <p className="eyebrow">Welcome back</p>
        <h1 style={{ marginTop: '8px' }}>Login</h1>
        <p>Sign in to access your EduTrack account dashboard.</p>
        <LoginForm onSubmit={handleLogin} error={error} />
        <p className="auth-switch">
          New user? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </section>
  );
};

export default Login;
