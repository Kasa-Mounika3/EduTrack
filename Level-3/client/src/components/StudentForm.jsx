import { useEffect, useState } from 'react';
import api from '../services/api.js';
import { resolveAssetUrl } from '../utils/assets.js';

const getCourseId = (course) => (typeof course === 'object' ? course?._id : course || '');

const StudentForm = ({ courses, initialValues = {}, onSubmit, submitLabel, frameless = false }) => {
  const [form, setForm] = useState({
    studentName: initialValues.studentName || initialValues.name || '',
    profilePhoto: '',
    studentId: initialValues.studentId || '',
    firstName: initialValues.firstName || '',
    lastName: initialValues.lastName || '',
    gender: initialValues.gender || '',
    dateOfBirth: initialValues.dateOfBirth ? new Date(initialValues.dateOfBirth).toISOString().slice(0, 10) : '',
    email: initialValues.email || '',
    course: getCourseId(initialValues.course),
    departmentId: getCourseId(initialValues.departmentId),
    sectionId: getCourseId(initialValues.sectionId),
    age: initialValues.age || '',
    phone: initialValues.phone || '',
    alternatePhone: initialValues.alternatePhone || '',
    address: initialValues.address || '',
    city: initialValues.city || '',
    state: initialValues.state || '',
    country: initialValues.country || '',
    department: initialValues.department || '',
    year: initialValues.year || '',
    semester: initialValues.semester || '',
    admissionDate: initialValues.admissionDate ? new Date(initialValues.admissionDate).toISOString().slice(0, 10) : '',
    parentName: initialValues.parentName || '',
    parentRelationship: initialValues.parentRelationship || '',
    parentPhone: initialValues.parentPhone || '',
    parentEmail: initialValues.parentEmail || ''
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [academic, setAcademic] = useState({ departments: [], sections: [] });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(resolveAssetUrl(initialValues.profilePhoto || ''));

  useEffect(() => {
    api.get('/academic')
      .then((response) => setAcademic(response.data.data || { departments: [], sections: [] }))
      .catch(() => setAcademic({ departments: [], sections: [] }));
  }, []);

  const updateField = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleDepartmentTextChange = (event) => {
    const val = event.target.value;
    const chosenDept = academic.departments.find(
      (d) => d.departmentName.toLowerCase().trim() === val.toLowerCase().trim()
    );
    setForm((current) => ({
      ...current,
      department: val,
      departmentId: chosenDept ? chosenDept._id : ''
    }));
  };

  const handleSectionTextChange = (event) => {
    const val = event.target.value;
    const chosenSection = academic.sections.find(
      (s) =>
        `${s.year} - Section ${s.sectionName}`.toLowerCase().trim() === val.toLowerCase().trim() ||
        s.sectionName.toLowerCase().trim() === val.toLowerCase().trim() ||
        s.year.toLowerCase().trim() === val.toLowerCase().trim()
    );
    const nextDeptId = chosenSection?.department?._id || chosenSection?.department || form.departmentId;
    const chosenDept = academic.departments.find((d) => String(d._id) === String(nextDeptId));

    setForm((current) => ({
      ...current,
      year: chosenSection ? chosenSection.year : val,
      sectionId: chosenSection ? chosenSection._id : '',
      departmentId: nextDeptId,
      department: chosenDept ? chosenDept.departmentName : current.department
    }));
  };

  const updatePhoto = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setForm((current) => ({ ...current, removeProfilePhoto: false }));
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview('');
    setForm((current) => ({ ...current, removeProfilePhoto: true }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.studentName.trim()) nextErrors.studentName = 'Name is required';
    if (!form.email.trim()) nextErrors.email = 'Email is required';
    if (!form.email.includes('@')) nextErrors.email = 'Enter a valid email';
    if (!form.course) nextErrors.course = 'Course is required';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const payload = new FormData();
      const values = {
        studentName: form.studentName.trim(),
        studentId: form.studentId.trim(),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        gender: form.gender,
        dateOfBirth: form.dateOfBirth || undefined,
        email: form.email.trim(),
        course: form.course,
        courseId: form.course,
        departmentId: form.departmentId || undefined,
        sectionId: form.sectionId || undefined,
        age: form.age ? Number(form.age) : undefined,
        phone: form.phone.trim(),
        alternatePhone: form.alternatePhone.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        country: form.country.trim(),
        department: form.department.trim(),
        year: form.year.trim(),
        semester: form.semester.trim(),
        admissionDate: form.admissionDate || undefined,
        parentName: form.parentName.trim(),
        parentRelationship: form.parentRelationship.trim(),
        parentPhone: form.parentPhone.trim(),
        parentEmail: form.parentEmail.trim(),
        removeProfilePhoto: form.removeProfilePhoto ? 'true' : undefined
      };
      Object.entries(values).forEach(([key, value]) => {
        if (value !== undefined && value !== '') payload.append(key, value);
      });
      if (photoFile) payload.append('profilePhoto', photoFile);
      await onSubmit(payload);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className={`${frameless ? 'grid gap-4' : 'panel grid gap-4'}`} onSubmit={handleSubmit} noValidate>
      <div className="grid gap-4 md:grid-cols-[160px_minmax(0,1fr)]">
        <div className="text-center">
          <div className="mx-auto grid h-24 w-24 place-items-center overflow-hidden rounded-3xl bg-blue-50 text-3xl font-black text-brand dark:bg-blue-950">
            {photoPreview ? <img className="h-full w-full object-cover" src={photoPreview} alt={form.studentName || 'Student'} /> : (form.studentName || 'S').charAt(0)}
          </div>
          <label className="btn-soft mt-3 cursor-pointer px-3">
            Choose Image
            <input className="hidden" type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" onChange={updatePhoto} />
          </label>
          {photoPreview && <button className="btn-soft mt-2 px-3" type="button" onClick={removePhoto}>Remove photo</button>}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="label">
            Student ID
            <input className="input" name="studentId" value={form.studentId} onChange={updateField} />
          </label>
        <label className="label">
          Name
          <input className="input" name="studentName" value={form.studentName} onChange={updateField} />
          {errors.studentName && <small className="text-red-600">{errors.studentName}</small>}
        </label>
        <label className="label">
          First Name
          <input className="input" name="firstName" value={form.firstName} onChange={updateField} />
        </label>
        <label className="label">
          Last Name
          <input className="input" name="lastName" value={form.lastName} onChange={updateField} />
        </label>
        <label className="label">
          Gender
          <select className="input" name="gender" value={form.gender} onChange={updateField}>
            <option value="">Select gender</option>
            <option value="Female">Female</option>
            <option value="Male">Male</option>
            <option value="Non-binary">Non-binary</option>
            <option value="Prefer not to say">Prefer not to say</option>
          </select>
        </label>
        <label className="label">
          Date of Birth
          <input className="input" name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={updateField} />
        </label>
        <label className="label">
          Email
          <input className="input" name="email" type="email" value={form.email} onChange={updateField} />
          {errors.email && <small className="text-red-600">{errors.email}</small>}
        </label>
        <label className="label">
          Course
          <select className="input" name="course" value={form.course} onChange={updateField}>
            <option value="">Select course</option>
            {courses.map((course) => (
              <option key={course._id} value={course._id}>
                {course.courseCode} - {course.courseName}
              </option>
            ))}
          </select>
          {errors.course && <small className="text-red-600">{errors.course}</small>}
        </label>
        <label className="label">
          Department
          <input
            className="input"
            name="department"
            value={form.department}
            onChange={handleDepartmentTextChange}
            list="department-suggestions"
            placeholder="Type department..."
          />
          <datalist id="department-suggestions">
            {academic.departments.map((dept) => (
              <option key={dept._id} value={dept.departmentName} />
            ))}
          </datalist>
        </label>
        <label className="label">
          Section / Year
          <input
            className="input"
            name="year"
            value={form.year}
            onChange={handleSectionTextChange}
            list="section-suggestions"
            placeholder="Type section (e.g. 3rd Year)..."
          />
          <datalist id="section-suggestions">
            {academic.sections.map((sec) => (
              <option key={sec._id} value={`${sec.year} - Section ${sec.sectionName}`} />
            ))}
          </datalist>
        </label>
        <label className="label">
          Age
          <input className="input" name="age" type="number" min="1" value={form.age} onChange={updateField} />
        </label>
        <label className="label">
          Phone Number
          <input className="input" name="phone" value={form.phone} onChange={updateField} />
        </label>
        <label className="label">
          Alternate Phone Number
          <input className="input" name="alternatePhone" value={form.alternatePhone} onChange={updateField} />
        </label>
        <label className="label md:col-span-2">
          Address
          <input className="input" name="address" value={form.address} onChange={updateField} />
        </label>
        <label className="label">
          City
          <input className="input" name="city" value={form.city} onChange={updateField} />
        </label>
        <label className="label">
          State
          <input className="input" name="state" value={form.state} onChange={updateField} />
        </label>
        <label className="label">
          Country
          <input className="input" name="country" value={form.country} onChange={updateField} />
        </label>

        <label className="label">
          Semester
          <input className="input" name="semester" value={form.semester} onChange={updateField} />
        </label>
        <label className="label">
          Admission Date
          <input className="input" name="admissionDate" type="date" value={form.admissionDate} onChange={updateField} />
        </label>
        <label className="label">
          Parent Name
          <input className="input" name="parentName" value={form.parentName} onChange={updateField} />
        </label>
        <label className="label">
          Parent Relationship
          <input className="input" name="parentRelationship" value={form.parentRelationship} onChange={updateField} />
        </label>
        <label className="label">
          Parent Phone Number
          <input className="input" name="parentPhone" value={form.parentPhone} onChange={updateField} />
        </label>
        <label className="label">
          Parent Email
          <input className="input" name="parentEmail" type="email" value={form.parentEmail} onChange={updateField} />
        </label>
        </div>
      </div>
      <button className="btn-primary w-fit" type="submit" disabled={saving}>
        {saving ? 'Saving...' : submitLabel}
      </button>
    </form>
  );
};

export default StudentForm;
