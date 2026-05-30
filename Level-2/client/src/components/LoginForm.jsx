import { useState } from 'react';

const LoginForm = ({ onSubmit, error }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((currentData) => ({ ...currentData, [name]: value }));
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!formData.email.trim()) {
      nextErrors.email = 'Email is required';
    }

    if (!formData.password) {
      nextErrors.password = 'Password is required';
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await onSubmit(formData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      {error && <div className="alert error">{error}</div>}

      <label>
        <span>Email</span>
        <input name="email" type="email" value={formData.email} onChange={handleChange} />
        {fieldErrors.email && <small>{fieldErrors.email}</small>}
      </label>

      <label>
        <span>Password</span>
        <input name="password" type="password" value={formData.password} onChange={handleChange} />
        {fieldErrors.password && <small>{fieldErrors.password}</small>}
      </label>

      <button className="primary-button" type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
};

export default LoginForm;
