import { useEffect, useState } from 'react';
import apiClient from '../services/apiClient.js';
import { resolveAssetUrl } from '../utils/assets.js';

const emptyForm = {
  studentName: '',
  profilePhoto: '',
  studentId: '',
  firstName: '',
  lastName: '',
  gender: '',
  dateOfBirth: '',
  email: '',
  course: '',
  departmentId: '',
  sectionId: '',
  age: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  country: '',
  department: '',
  year: '',
  semester: '',
  admissionDate: '',
  parentName: '',
  parentRelationship: '',
  parentPhone: '',
  parentEmail: '',
  password: ''
};

const getCourseId = (course) => {
  if (!course) {
    return '';
  }

  return typeof course === 'object' ? course._id : course;
};

const StudentForm = ({
  courses = [],
  initialValues = emptyForm,
  submitLabel = 'Save Student',
  onSubmit
}) => {
  const [formData, setFormData] = useState({
    ...emptyForm,
    ...initialValues,
    studentName: initialValues.studentName || initialValues.name || '',
    dateOfBirth: initialValues.dateOfBirth ? new Date(initialValues.dateOfBirth).toISOString().slice(0, 10) : '',
    admissionDate: initialValues.admissionDate ? new Date(initialValues.admissionDate).toISOString().slice(0, 10) : '',
    course: getCourseId(initialValues.course),
    departmentId: getCourseId(initialValues.departmentId),
    sectionId: getCourseId(initialValues.sectionId),
    age: initialValues.age || '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [academic, setAcademic] = useState({ departments: [], sections: [] });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(resolveAssetUrl(initialValues.profilePhoto || ''));

  useEffect(() => {
    apiClient.get('/academic')
      .then((response) => setAcademic(response.data.data || { departments: [], sections: [] }))
      .catch(() => setAcademic({ departments: [], sections: [] }));
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((currentData) => ({ ...currentData, [name]: value }));
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setFormData((currentData) => ({ ...currentData, removeProfilePhoto: false }));
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview('');
    setFormData((currentData) => ({ ...currentData, removeProfilePhoto: true }));
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!formData.studentName.trim()) {
      nextErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      nextErrors.email = 'Email is required';
    } else if (!formData.email.includes('@')) {
      nextErrors.email = 'Enter a valid email address';
    }

    if (!formData.course) {
      nextErrors.course = 'Course is required';
    }

    if (formData.age && Number(formData.age) < 1) {
      nextErrors.age = 'Age must be greater than 0';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const payload = new FormData();
      const values = {
        studentName: formData.studentName.trim(),
        studentId: formData.studentId.trim(),
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth || undefined,
        email: formData.email.trim(),
        course: formData.course,
        courseId: formData.course,
        departmentId: formData.departmentId || undefined,
        sectionId: formData.sectionId || undefined,
        age: formData.age ? Number(formData.age) : undefined,
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        country: formData.country.trim(),
        department: formData.department.trim(),
        year: formData.year.trim(),
        semester: formData.semester.trim(),
        admissionDate: formData.admissionDate || undefined,
        parentName: formData.parentName.trim(),
        parentRelationship: formData.parentRelationship.trim(),
        parentPhone: formData.parentPhone.trim(),
        parentEmail: formData.parentEmail.trim(),
        password: formData.password || undefined,
        removeProfilePhoto: formData.removeProfilePhoto ? 'true' : undefined
      };
      Object.entries(values).forEach(([key, value]) => {
        if (value !== undefined && value !== '') payload.append(key, value);
      });
      if (photoFile) payload.append('profilePhoto', photoFile);
      await onSubmit(payload);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="student-form" onSubmit={handleSubmit} noValidate>
      <div className="form-grid">
        <div>
          <span>Profile Photo</span>
          <div className="details-card">
            <div className="avatar large-avatar" aria-hidden="true">
              {photoPreview ? <img src={photoPreview} alt={formData.studentName || 'Student'} /> : (formData.studentName || 'S').charAt(0)}
            </div>
            <label className="secondary-button">
              Choose Image
              <input hidden type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" onChange={handlePhotoChange} />
            </label>
            {photoPreview && <button className="text-link" type="button" onClick={removePhoto}>Remove photo</button>}
          </div>
        </div>

        <label>
          <span>Student ID</span>
          <input name="studentId" value={formData.studentId} onChange={handleChange} placeholder="EDU-1001" />
        </label>

        <label>
          <span>Name</span>
          <input
            name="studentName"
            value={formData.studentName}
            onChange={handleChange}
            placeholder="Enter full name"
          />
          {errors.name && <small>{errors.name}</small>}
        </label>

        <label>
          <span>First Name</span>
          <input name="firstName" value={formData.firstName} onChange={handleChange} />
        </label>

        <label>
          <span>Last Name</span>
          <input name="lastName" value={formData.lastName} onChange={handleChange} />
        </label>

        <label>
          <span>Gender</span>
          <input name="gender" value={formData.gender} onChange={handleChange} />
        </label>

        <label>
          <span>Date of Birth</span>
          <input name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleChange} />
        </label>

        <label>
          <span>Email</span>
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="student@example.com"
          />
          {errors.email && <small>{errors.email}</small>}
        </label>

        <label>
          <span>Course</span>
          <select
            name="course"
            value={formData.course}
            onChange={handleChange}
          >
            <option value="">Select a course</option>
            {courses.map((course) => (
              <option key={course._id} value={course._id}>
                {course.courseCode} - {course.courseName}
              </option>
            ))}
          </select>
          {errors.course && <small>{errors.course}</small>}
        </label>

        <label>
          <span>Department</span>
          <select name="departmentId" value={formData.departmentId} onChange={handleChange}>
            <option value="">Select a department</option>
            {academic.departments.map((department) => (
              <option key={department._id} value={department._id}>{department.departmentName}</option>
            ))}
          </select>
        </label>

        <label>
          <span>Section</span>
          <select name="sectionId" value={formData.sectionId} onChange={handleChange}>
            <option value="">Select a section</option>
            {academic.sections
              .filter((section) => !formData.departmentId || section.department?._id === formData.departmentId || section.department === formData.departmentId)
              .map((section) => (
                <option key={section._id} value={section._id}>{section.year} - Section {section.sectionName}</option>
              ))}
          </select>
        </label>

        <label>
          <span>Age</span>
          <input
            name="age"
            type="number"
            min="1"
            value={formData.age}
            onChange={handleChange}
            placeholder="21"
          />
          {errors.age && <small>{errors.age}</small>}
        </label>

        <label>
          <span>Phone Number</span>
          <input name="phone" value={formData.phone} onChange={handleChange} />
        </label>

        <label>
          <span>Address</span>
          <input name="address" value={formData.address} onChange={handleChange} />
        </label>

        <label>
          <span>City</span>
          <input name="city" value={formData.city} onChange={handleChange} />
        </label>

        <label>
          <span>State</span>
          <input name="state" value={formData.state} onChange={handleChange} />
        </label>

        <label>
          <span>Country</span>
          <input name="country" value={formData.country} onChange={handleChange} />
        </label>

        <label>
          <span>Department</span>
          <input name="department" value={formData.department} onChange={handleChange} />
        </label>

        <label>
          <span>Year</span>
          <input name="year" value={formData.year} onChange={handleChange} />
        </label>

        <label>
          <span>Semester</span>
          <input name="semester" value={formData.semester} onChange={handleChange} />
        </label>

        <label>
          <span>Admission Date</span>
          <input name="admissionDate" type="date" value={formData.admissionDate} onChange={handleChange} />
        </label>

        <label>
          <span>Parent Name</span>
          <input name="parentName" value={formData.parentName} onChange={handleChange} />
        </label>

        <label>
          <span>Parent Relationship</span>
          <input name="parentRelationship" value={formData.parentRelationship} onChange={handleChange} />
        </label>

        <label>
          <span>Parent Phone Number</span>
          <input name="parentPhone" value={formData.parentPhone} onChange={handleChange} />
        </label>

        <label>
          <span>Parent Email</span>
          <input name="parentEmail" type="email" value={formData.parentEmail} onChange={handleChange} />
        </label>

        <label>
          <span>Login Password</span>
          <input
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Leave blank to auto-generate"
          />
        </label>
      </div>

      <button className="primary-button" type="submit" disabled={submitting}>
        {submitting ? 'Saving...' : submitLabel}
      </button>
    </form>
  );
};

export default StudentForm;
