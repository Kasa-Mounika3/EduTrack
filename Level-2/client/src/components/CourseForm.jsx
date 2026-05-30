import { useState } from 'react';

const initialForm = {
  courseName: '',
  courseCode: '',
  description: '',
  instructor: ''
};

const CourseForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((currentData) => ({ ...currentData, [name]: value }));
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!formData.courseName.trim()) {
      nextErrors.courseName = 'Course name is required';
    }

    if (!formData.courseCode.trim()) {
      nextErrors.courseCode = 'Course code is required';
    }

    if (!formData.instructor.trim()) {
      nextErrors.instructor = 'Instructor is required';
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
      await onSubmit({
        courseName: formData.courseName.trim(),
        courseCode: formData.courseCode.trim(),
        description: formData.description.trim(),
        instructor: formData.instructor.trim()
      });
      setFormData(initialForm);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="student-form" onSubmit={handleSubmit} noValidate>
      <div className="form-grid">
        <label>
          <span>Course Name</span>
          <input name="courseName" value={formData.courseName} onChange={handleChange} />
          {errors.courseName && <small>{errors.courseName}</small>}
        </label>

        <label>
          <span>Course Code</span>
          <input name="courseCode" value={formData.courseCode} onChange={handleChange} />
          {errors.courseCode && <small>{errors.courseCode}</small>}
        </label>

        <label>
          <span>Instructor</span>
          <input name="instructor" value={formData.instructor} onChange={handleChange} />
          {errors.instructor && <small>{errors.instructor}</small>}
        </label>

        <label>
          <span>Description</span>
          <input name="description" value={formData.description} onChange={handleChange} />
        </label>
      </div>

      <button className="primary-button" type="submit" disabled={submitting}>
        {submitting ? 'Saving...' : 'Create Course'}
      </button>
    </form>
  );
};

export default CourseForm;
