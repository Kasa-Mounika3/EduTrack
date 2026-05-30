import { Link, useNavigate } from 'react-router-dom';
import RegisterForm from '../components/RegisterForm.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { getApiErrorMessage } from '../services/apiClient.js';
import logo from '../assets/logo.png';

const Register = () => {
  const navigate = useNavigate();
  const { register, error, setError } = useAuth();

  const handleRegister = async (payload) => {
    try {
      await register(payload);
      navigate('/', { replace: true });
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
        <p className="eyebrow">Create account</p>
        <h1 style={{ marginTop: '8px' }}>Register</h1>
        <p>Choose Admin for full management access or Student for profile-only access.</p>
        <RegisterForm onSubmit={handleRegister} error={error} />
        <p className="auth-switch">
          Already registered? <Link to="/login">Login</Link>
        </p>
      </div>
    </section>
  );
};

export default Register;
