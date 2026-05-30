import { useEffect, useMemo, useState } from 'react';
import Loader from '../components/Loader.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { getApiError } from '../services/api.js';
import { resolveAssetUrl } from '../utils/assets.js';

const roleFields = {
  admin: ['employeeId', 'name', 'email', 'phone', 'position'],
  teacher: ['teacherId', 'name', 'email', 'phone', 'department', 'subjects', 'qualification', 'experience'],
  student: ['studentId', 'firstName', 'lastName', 'gender', 'dateOfBirth', 'email', 'phone', 'alternatePhone', 'address', 'city', 'state', 'country', 'department', 'year', 'semester', 'admissionDate', 'parentName', 'parentRelationship', 'parentPhone', 'parentEmail'],
  parent: ['name', 'email', 'phone', 'relationship']
};

const labels = {
  employeeId: 'Employee ID',
  teacherId: 'Teacher ID',
  studentId: 'Student ID',
  name: 'Full Name',
  firstName: 'First Name',
  lastName: 'Last Name',
  gender: 'Gender',
  dateOfBirth: 'Date of Birth',
  email: 'Email',
  phone: 'Phone Number',
  alternatePhone: 'Alternate Phone Number',
  address: 'Address',
  city: 'City',
  state: 'State',
  country: 'Country',
  department: 'Department',
  subjects: 'Subject',
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
  relationship: 'Relationship'
};

const dateFields = new Set(['dateOfBirth', 'admissionDate']);
const toDateInput = (value) => (value ? new Date(value).toISOString().slice(0, 10) : '');

const Profile = () => {
  const { user, refreshProfile, updateProfile, changePassword } = useAuth();
  const [profile, setProfile] = useState(null);
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
        const data = await refreshProfile();
        setProfile(data);
        const merged = { ...data.user, ...(data.roleProfile || {}) };
        setForm({
          ...merged,
          dateOfBirth: toDateInput(merged.dateOfBirth),
          admissionDate: toDateInput(merged.admissionDate),
          subjects: Array.isArray(merged.subjects) ? merged.subjects.join(', ') : merged.subjects || ''
        });
        setPhotoPreview(resolveAssetUrl(merged.profilePhoto || data.user?.profilePhoto || ''));
      } catch (err) {
        setError(getApiError(err));
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [refreshProfile]);

  const fields = roleFields[user.role] || roleFields.student;
  const completion = profile?.completion ?? 0;
  const roleProfile = profile?.roleProfile;
  const displayName = form.name || form.studentName || `${form.firstName || ''} ${form.lastName || ''}`.trim() || user.name;
  const photo = photoPreview || resolveAssetUrl(user.profilePhoto || '');

  const linkedStudents = useMemo(() => {
    if (user.role === 'parent') return roleProfile?.children || [];
    if (user.role === 'student') return roleProfile ? [roleProfile] : [];
    return [];
  }, [roleProfile, user.role]);

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

  const handleSave = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    try {
      const payload = new FormData();
      const values = {
        ...form,
        subjects: typeof form.subjects === 'string'
          ? form.subjects.split(',').map((item) => item.trim()).filter(Boolean)
          : form.subjects
      };
      Object.entries(values).forEach(([key, value]) => {
        if (key === 'profilePhoto') return;
        if (Array.isArray(value)) {
          value.forEach((item) => payload.append(key, item));
        } else if (value !== undefined && value !== null) {
          payload.append(key, value);
        }
      });
      if (photoFile) payload.append('profilePhoto', photoFile);
      const data = await updateProfile(payload);
      setProfile((current) => ({ ...(current || {}), ...data }));
      setMessage('Profile updated successfully');
    } catch (err) {
      setError(getApiError(err));
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
      setError(getApiError(err));
    }
  };

  return (
    <section className="page narrow-page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Account</p>
          <h1>My Profile</h1>
          <p>Authenticated profile management with Level-3 analytics added to the Level-2 layout.</p>
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
                {photo ? <img src={photo} alt={displayName} /> : displayName.charAt(0).toUpperCase()}
              </div>
              <h2>{displayName}</h2>
              <p className="muted-text">{user.role === 'admin' ? 'School Admin' : user.role}</p>
              <label className="secondary-button">
                Choose Image
                <input hidden type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" onChange={handlePhotoChange} />
              </label>
              {photo && <button className="text-link" type="button" onClick={removePhoto}>Remove photo</button>}
              <dl>
                <div>
                  <dt>Email</dt>
                  <dd>{form.email || user.email}</dd>
                </div>
                <div>
                  <dt>Role</dt>
                  <dd>{user.role}</dd>
                </div>
                <div>
                  <dt>Profile Completion</dt>
                  <dd>{completion}%</dd>
                </div>
              </dl>
            </div>

            <form className="student-form spaced-panel" onSubmit={handleSave}>
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

            <article className="spaced-panel">
              <div className="panel-heading">
                <h2>Academic Analytics</h2>
              </div>
              <div className="stats-grid">
                <div className="stat-card">
                  <span>Attendance</span>
                  <strong>{linkedStudents[0]?.attendance ?? 0}%</strong>
                </div>
                <div className="stat-card">
                  <span>Score</span>
                  <strong>{linkedStudents[0]?.marks ?? 0}</strong>
                </div>
                <div className="stat-card">
                  <span>Completion</span>
                  <strong>{completion}%</strong>
                </div>
              </div>
            </article>

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
              <button className="ghost-button" type="submit">Update Password</button>
            </form>

            <article>
              <div className="panel-heading">
                <h2>Activity Timeline</h2>
              </div>
              <div className="student-card-list">
                {(profile?.activity || []).map((item) => (
                  <div className="student-card" key={`${item.label}-${item.timestamp}`}>
                    <h3>{item.label}</h3>
                    <p>{item.timestamp ? new Date(item.timestamp).toLocaleString() : 'Recently'}</p>
                  </div>
                ))}
              </div>
            </article>
          </>
        )}
      </div>
    </section>
  );
};

export default Profile;
