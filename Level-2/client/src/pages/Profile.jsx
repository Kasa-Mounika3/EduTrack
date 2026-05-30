import { useEffect, useState } from 'react';
import Loader from '../components/Loader.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { authService } from '../services/authService.js';
import { getApiErrorMessage } from '../services/apiClient.js';
import { resolveAssetUrl } from '../utils/assets.js';

const roleFields = {
  admin: ['employeeId', 'name', 'email', 'phone', 'position'],
  teacher: ['teacherId', 'teacherName', 'email', 'phone', 'department', 'subject', 'qualification', 'experience'],
  student: ['studentId', 'firstName', 'lastName', 'gender', 'dateOfBirth', 'email', 'phone', 'address', 'city', 'state', 'country', 'department', 'year', 'semester', 'admissionDate', 'parentName', 'parentRelationship', 'parentPhone', 'parentEmail'],
  parent: ['parentName', 'email', 'phone', 'relationship']
};

const labels = {
  employeeId: 'Employee ID',
  teacherId: 'Teacher ID',
  studentId: 'Student ID',
  name: 'Full Name',
  teacherName: 'Full Name',
  firstName: 'First Name',
  lastName: 'Last Name',
  dateOfBirth: 'Date of Birth',
  email: 'Email',
  phone: 'Phone Number',
  address: 'Address',
  city: 'City',
  state: 'State',
  country: 'Country',
  department: 'Department',
  subject: 'Subject',
  qualification: 'Qualification',
  experience: 'Experience',
  position: 'Position',
  year: 'Year',
  semester: 'Semester',
  admissionDate: 'Admission Date',
  parentName: 'Parent Name',
  parentRelationship: 'Relationship',
  parentPhone: 'Parent Phone Number',
  parentEmail: 'Parent Email',
  relationship: 'Relationship',
  gender: 'Gender'
};

const dateFields = new Set(['dateOfBirth', 'admissionDate']);

const toDateInput = (value) => (value ? new Date(value).toISOString().slice(0, 10) : '');

const Profile = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const [form, setForm] = useState({});
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await authService.getProfile();
        const merged = { ...profile.user, ...(profile.roleProfile || {}) };
        setForm({
          ...merged,
          dateOfBirth: toDateInput(merged.dateOfBirth),
          admissionDate: toDateInput(merged.admissionDate)
        });
        setPhotoPreview(resolveAssetUrl(merged.profilePhoto || ''));
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setForm((current) => ({ ...current, removeProfilePhoto: false }));
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview('');
    setForm((current) => ({ ...current, profilePhoto: '', removeProfilePhoto: true }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    try {
      const payload = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key !== 'profilePhoto' && value !== undefined && value !== null) payload.append(key, value);
      });
      if (photoFile) payload.append('profilePhoto', photoFile);
      await updateProfile(payload);
      setMessage('Profile updated successfully');
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  const handlePassword = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    try {
      await changePassword(passwordForm);
      setPasswordForm({ currentPassword: '', newPassword: '' });
      setMessage('Password changed successfully');
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  const displayName = form.name || form.teacherName || form.parentName || form.studentName || user.name;
  const fields = roleFields[user.role] || roleFields.student;

  return (
    <section className="page narrow-page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Account</p>
          <h1>My Profile</h1>
          <p>Authenticated profile management using the same EduTrack profile structure.</p>
        </div>
      </div>

      <div className="panel">
        {loading && <Loader text="Loading profile..." />}
        {message && <div className="notification">{message}</div>}
        {error && <div className="alert error">{error}</div>}

        {!loading && (
          <>
            <div className="details-card">
              <div className="avatar large-avatar" aria-hidden="true">
                {photoPreview ? <img src={photoPreview} alt={displayName} /> : displayName.charAt(0).toUpperCase()}
              </div>
              <h2>{displayName}</h2>
              <p>{user.role}</p>
              <label className="secondary-button">
                Choose Image
                <input hidden type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" onChange={handlePhotoChange} />
              </label>
              {photoPreview && <button className="text-link" type="button" onClick={removePhoto}>Remove photo</button>}
            </div>

            <form className="student-form spaced-panel" onSubmit={handleSubmit}>
              <div className="form-grid">
                {fields.map((field) => (
                  <label key={field}>
                    <span>{labels[field] || field}</span>
                    <input
                      name={field}
                      type={dateFields.has(field) ? 'date' : field.includes('email') ? 'email' : 'text'}
                      value={form[field] || ''}
                      onChange={handleChange}
                    />
                  </label>
                ))}
              </div>
              <button className="primary-button" type="submit">Save Profile Changes</button>
            </form>

            <form className="student-form spaced-panel" onSubmit={handlePassword}>
              <div className="panel-heading">
                <h2>Change Password</h2>
              </div>
              <div className="form-grid">
                <label>
                  <span>Current Password</span>
                  <input type="password" value={passwordForm.currentPassword} onChange={(event) => setPasswordForm({ ...passwordForm, currentPassword: event.target.value })} />
                </label>
                <label>
                  <span>New Password</span>
                  <input type="password" value={passwordForm.newPassword} onChange={(event) => setPasswordForm({ ...passwordForm, newPassword: event.target.value })} />
                </label>
              </div>
              <button className="secondary-button" type="submit">Update Password</button>
            </form>
          </>
        )}
      </div>
    </section>
  );
};

export default Profile;
