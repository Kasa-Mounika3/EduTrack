import { useState } from 'react';

const RegisterForm = ({ onSubmit, error }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    parentName: '',
    parentEmail: '',
    parentPhone: ''
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((currentData) => ({ ...currentData, [name]: value }));
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!formData.name.trim()) {
      nextErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      nextErrors.email = 'Email is required';
    }

    if (formData.password.length < 6) {
      nextErrors.password = 'Password must be at least 6 characters';
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
        <span>Name</span>
        <input name="name" value={formData.name} onChange={handleChange} />
        {fieldErrors.name && <small>{fieldErrors.name}</small>}
      </label>

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

      <label>
        <span>Role</span>
        <select name="role" value={formData.role} onChange={handleChange}>
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
          <option value="parent">Parent</option>
          <option value="admin">Admin</option>
        </select>
      </label>

      {formData.role === 'student' && (
        <>
          <label>
            <span>Parent Name</span>
            <input name="parentName" value={formData.parentName} onChange={handleChange} />
          </label>

          <label>
            <span>Parent Email</span>
            <input name="parentEmail" type="email" value={formData.parentEmail} onChange={handleChange} />
          </label>

          <label>
            <span>Parent Phone</span>
            <input name="parentPhone" value={formData.parentPhone} onChange={handleChange} />
          </label>
        </>
      )}

      <button className="primary-button" type="submit" disabled={loading}>
        {loading ? 'Creating account...' : 'Register'}
      </button>
    </form>
  );
};

export default RegisterForm;
