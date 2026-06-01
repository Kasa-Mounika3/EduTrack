import { useEffect, useRef, useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import Modal from '../components/Modal.jsx';
import Loader from '../components/Loader.jsx';
import EmptyState from '../components/EmptyState.jsx';
import api, { getApiError } from '../services/api.js';
import { academicService } from '../services/academicService.js';
import { resolveAssetUrl } from '../utils/assets.js';

/* ─── blank form shapes ────────────────────────────────────────────── */
const blankForm = () => ({
  name: '',
  email: '',
  password: '',
  teacherId: '',
  phone: '',
  department: '',
  departmentId: '',
  qualification: '',
  experience: '',
  assignedSections: [],
  assignedSubjects: [],
  profilePhoto: '',
  removeProfilePhoto: false,
});

/* ─── helpers ──────────────────────────────────────────────────────── */
const getId = (v) => (typeof v === 'object' && v !== null ? v._id : v) || '';

/* ─── TeacherForm modal (shared by Add and Edit) ───────────────────── */
const TeacherForm = ({
  title,
  initial,
  departments,
  sections,
  subjects,
  saving,
  error,
  onClose,
  onSave,
}) => {
  const [form, setForm] = useState(initial);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(
    resolveAssetUrl(initial.profilePhoto || '')
  );
  const fileRef = useRef();

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const toggleMulti = (key, id) =>
    setForm((f) => {
      const list = f[key] || [];
      return {
        ...f,
        [key]: list.includes(id) ? list.filter((x) => x !== id) : [...list, id],
      };
    });

  const handleDept = (e) => {
    const id = e.target.value;
    const dept = departments.find((d) => d._id === id);
    setForm((f) => ({
      ...f,
      departmentId: id,
      department: dept ? dept.departmentName : '',
    }));
  };

  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    set('removeProfilePhoto', false);
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview('');
    fileRef.current && (fileRef.current.value = '');
    setForm((f) => ({ ...f, profilePhoto: '', removeProfilePhoto: true }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData();
    const fields = {
      name: form.name.trim(),
      email: form.email.trim(),
      teacherId: form.teacherId.trim(),
      phone: form.phone.trim(),
      department: form.department.trim(),
      departmentId: form.departmentId || undefined,
      qualification: form.qualification.trim(),
      experience: form.experience.trim(),
      removeProfilePhoto: form.removeProfilePhoto ? 'true' : undefined,
    };
    if (form.password) fields.password = form.password;
    Object.entries(fields).forEach(([k, v]) => {
      if (v !== undefined && v !== '') fd.append(k, v);
    });
    (form.assignedSections || []).forEach((id) => fd.append('assignedSections', id));
    (form.assignedSubjects || []).forEach((id) => fd.append('assignedSubjects', id));
    if (photoFile) fd.append('profilePhoto', photoFile);
    onSave(fd);
  };

  return (
    <Modal open title={title} onClose={onClose}>
      <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
        {error && (
          <div className="rounded-xl bg-red-50 p-3 font-bold text-red-700 dark:bg-red-950 dark:text-red-200">
            {error}
          </div>
        )}

        {/* Photo */}
        <div className="flex items-center gap-4">
          <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-2xl bg-blue-50 text-3xl font-black text-brand dark:bg-blue-950">
            {photoPreview ? (
              <img className="h-full w-full object-cover" src={photoPreview} alt={form.name || 'Teacher'} />
            ) : (
              (form.name || 'T').charAt(0).toUpperCase()
            )}
          </div>
          <div className="flex flex-col gap-2">
            <label className="btn-soft cursor-pointer px-3">
              Choose Photo
              <input
                ref={fileRef}
                className="hidden"
                type="file"
                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                onChange={handlePhoto}
              />
            </label>
            {photoPreview && (
              <button className="btn-soft px-3" type="button" onClick={removePhoto}>
                Remove photo
              </button>
            )}
          </div>
        </div>

        {/* Core fields – 2-col grid */}
        <div className="grid gap-4 md:grid-cols-2">
          <label className="label">
            Name <span className="text-red-500">*</span>
            <input
              required
              className="input"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="Full name"
            />
          </label>

          <label className="label">
            Email <span className="text-red-500">*</span>
            <input
              required
              type="email"
              className="input"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              placeholder="teacher@school.edu"
            />
          </label>

          {/* Password only shown on create (empty initial) */}
          {!initial._id && (
            <label className="label">
              Password <span className="text-red-500">*</span>
              <input
                required
                type="password"
                className="input"
                value={form.password}
                onChange={(e) => set('password', e.target.value)}
                placeholder="Initial login password"
              />
            </label>
          )}

          <label className="label">
            Employee ID
            <input
              className="input"
              value={form.teacherId}
              onChange={(e) => set('teacherId', e.target.value)}
              placeholder="e.g. EMP-001"
            />
          </label>

          <label className="label">
            Phone Number
            <input
              className="input"
              value={form.phone}
              onChange={(e) => set('phone', e.target.value)}
              placeholder="+91 00000 00000"
            />
          </label>

          <label className="label">
            Department
            <select
              className="input"
              value={form.departmentId}
              onChange={handleDept}
            >
              {departments.length === 0 ? (
                <option value="">Create a department first</option>
              ) : (
                <>
                  <option value="">Select department</option>
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.departmentName} ({d.departmentCode})
                    </option>
                  ))}
                </>
              )}
            </select>
          </label>

          <label className="label">
            Qualification
            <input
              className="input"
              value={form.qualification}
              onChange={(e) => set('qualification', e.target.value)}
              placeholder="e.g. M.Sc., B.Ed."
            />
          </label>

          <label className="label">
            Experience
            <input
              className="input"
              value={form.experience}
              onChange={(e) => set('experience', e.target.value)}
              placeholder="e.g. 5 years"
            />
          </label>
        </div>

        {/* Assigned Sections – multi-select checkboxes */}
        <fieldset className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
          <legend className="px-1 text-sm font-semibold">Assigned Sections</legend>
          {sections.length === 0 ? (
            <p className="text-sm text-slate-500">Create a section first</p>
          ) : (
            <div className="grid gap-2 md:grid-cols-3">
              {sections.map((sec) => (
                <label key={sec._id} className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={(form.assignedSections || []).includes(sec._id)}
                    onChange={() => toggleMulti('assignedSections', sec._id)}
                  />
                  {sec.year} – Section {sec.sectionName}
                </label>
              ))}
            </div>
          )}
        </fieldset>

        {/* Assigned Subjects – multi-select checkboxes */}
        <fieldset className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
          <legend className="px-1 text-sm font-semibold">Assigned Subjects</legend>
          {subjects.length === 0 ? (
            <p className="text-sm text-slate-500">Create a subject first</p>
          ) : (
            <div className="grid gap-2 md:grid-cols-3">
              {subjects.map((sub) => (
                <label key={sub._id} className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={(form.assignedSubjects || []).includes(sub._id)}
                    onChange={() => toggleMulti('assignedSubjects', sub._id)}
                  />
                  {sub.subjectName} ({sub.subjectCode})
                </label>
              ))}
            </div>
          )}
        </fieldset>

        <div className="flex justify-end gap-3">
          <button className="btn-soft" type="button" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button className="btn-primary" type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save Teacher'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

/* ─── Main Teachers page ───────────────────────────────────────────── */
const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [modalError, setModalError] = useState('');
  const [saving, setSaving] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null); // teacher object or null

  /* ── data loaders ─────────────────────────────────── */
  const loadTeachers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/teachers', { params: { limit: 100 } });
      setTeachers(res.data.data || []);
    } catch (err) {
      setPageError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const loadAcademic = async () => {
    try {
      const data = await academicService.list();
      setDepartments(data.departments || []);
      setSections(data.sections || []);
      setSubjects(data.subjects || []);
    } catch {
      /* silently ignore – dropdowns will show empty hints */
    }
  };

  useEffect(() => {
    loadTeachers();
    loadAcademic();

    const handler = (e) => {
      if (e.detail?.type?.includes('teacher')) loadTeachers();
    };
    window.addEventListener('edutrack:dashboard-update', handler);
    return () => window.removeEventListener('edutrack:dashboard-update', handler);
  }, []);

  /* ── open edit modal – normalise ObjectId arrays ──── */
  const openEdit = (teacher) => {
    setModalError('');
    setEditTarget({
      ...teacher,
      departmentId: getId(teacher.departmentId) || '',
      department: teacher.departmentId?.departmentName || teacher.department || '',
      assignedSections: (teacher.assignedSections || []).map(getId).filter(Boolean),
      assignedSubjects: (teacher.assignedSubjects || []).map(getId).filter(Boolean),
    });
  };

  /* ── Add handler ──────────────────────────────────── */
  const handleAdd = async (formData) => {
    setSaving(true);
    setModalError('');
    try {
      await api.post('/teachers', formData);
      setAddOpen(false);
      await loadTeachers();
    } catch (err) {
      setModalError(getApiError(err));
    } finally {
      setSaving(false);
    }
  };

  /* ── Edit/save handler ────────────────────────────── */
  const handleEdit = async (formData) => {
    setSaving(true);
    setModalError('');
    try {
      await api.put(`/teachers/${editTarget._id}`, formData);
      setEditTarget(null);
      await loadTeachers();
    } catch (err) {
      setModalError(getApiError(err));
    } finally {
      setSaving(false);
    }
  };

  /* ── Delete ───────────────────────────────────────── */
  const handleDelete = async (teacher) => {
    if (!window.confirm(`Delete ${teacher.name || teacher.teacherName}?`)) return;
    try {
      await api.delete(`/teachers/${teacher._id}`);
      setTeachers((prev) => prev.filter((t) => t._id !== teacher._id));
    } catch (err) {
      setPageError(getApiError(err));
    }
  };

  return (
    <section className="page">
      <PageHeader
        eyebrow="Teachers"
        title="Teacher Directory"
        description="Manage faculty profiles, departments, subjects, and assigned sections."
        action={
          <button className="btn-primary" type="button" onClick={() => { setModalError(''); setAddOpen(true); }}>
            Add Teacher
          </button>
        }
      />

      {pageError && (
        <div className="rounded-xl bg-red-50 p-3 font-bold text-red-700 dark:bg-red-950 dark:text-red-200">
          {pageError}
        </div>
      )}

      {loading ? (
        <Loader text="Loading teachers..." />
      ) : teachers.length === 0 ? (
        <EmptyState
          title="No teachers found"
          message="Add a teacher to get started."
          action={
            <button className="btn-primary" type="button" onClick={() => setAddOpen(true)}>
              Add Teacher
            </button>
          }
        />
      ) : (
        <div className="card-grid">
          {teachers.map((teacher) => {
            const displayName = teacher.name || teacher.teacherName || 'Teacher';
            const photo = resolveAssetUrl(teacher.profilePhoto || '');
            return (
              <article className="student-card" key={teacher._id}>
                <div className="avatar" aria-hidden="true">
                  {photo ? <img src={photo} alt={displayName} /> : displayName.charAt(0).toUpperCase()}
                </div>
                <h3>{displayName}</h3>
                <p>{teacher.email}</p>
                <dl>
                  <div>
                    <dt>Employee ID</dt>
                    <dd>{teacher.teacherId || 'Not assigned'}</dd>
                  </div>
                  <div>
                    <dt>Department</dt>
                    <dd>{teacher.departmentId?.departmentName || teacher.department || 'Not assigned'}</dd>
                  </div>
                  <div>
                    <dt>Qualification</dt>
                    <dd>{teacher.qualification || '—'}</dd>
                  </div>
                  <div>
                    <dt>Experience</dt>
                    <dd>{teacher.experience || '—'}</dd>
                  </div>
                  <div>
                    <dt>Assigned Sections</dt>
                    <dd>
                      {teacher.assignedSections?.map((s) =>
                        `${s.year || ''} ${s.sectionName || ''}`.trim()
                      ).join(', ') || 'None'}
                    </dd>
                  </div>
                  <div>
                    <dt>Assigned Subjects</dt>
                    <dd>
                      {teacher.assignedSubjects?.map((s) =>
                        s.subjectName || s.subjectCode
                      ).join(', ') || teacher.subjects?.join(', ') || 'None'}
                    </dd>
                  </div>
                </dl>
                <div className="detail-actions">
                  <button
                    className="ghost-link"
                    type="button"
                    onClick={() => openEdit(teacher)}
                  >
                    Edit
                  </button>
                  <button
                    className="ghost-link text-red-600"
                    type="button"
                    onClick={() => handleDelete(teacher)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* ── Add Teacher modal ── */}
      {addOpen && (
        <TeacherForm
          title="Add Teacher"
          initial={blankForm()}
          departments={departments}
          sections={sections}
          subjects={subjects}
          saving={saving}
          error={modalError}
          onClose={() => setAddOpen(false)}
          onSave={handleAdd}
        />
      )}

      {/* ── Edit Teacher modal ── */}
      {editTarget && (
        <TeacherForm
          title="Edit Teacher"
          initial={editTarget}
          departments={departments}
          sections={sections}
          subjects={subjects}
          saving={saving}
          error={modalError}
          onClose={() => setEditTarget(null)}
          onSave={handleEdit}
        />
      )}
    </section>
  );
};

export default Teachers;
