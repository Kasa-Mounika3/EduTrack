const API_BASE_URL = 'http://localhost:5000/api/students';

const state = {
  students: [],
  searchTerm: '',
  isEditing: false,
  profilePhotoData: ''
};

const fieldIds = [
  'profilePhoto',
  'studentCode',
  'firstName',
  'lastName',
  'gender',
  'dateOfBirth',
  'name',
  'email',
  'course',
  'age',
  'phone',
  'address',
  'city',
  'state',
  'country',
  'department',
  'year',
  'semester',
  'admissionDate',
  'parentName',
  'parentRelationship',
  'parentPhone',
  'parentEmail'
];

const elements = {
  apiStatus: document.querySelector('#apiStatus'),
  form: document.querySelector('#studentForm'),
  formTitle: document.querySelector('#formTitle'),
  studentId: document.querySelector('#studentId'),
  submitButton: document.querySelector('#submitButton'),
  cancelEditButton: document.querySelector('#cancelEditButton'),
  searchInput: document.querySelector('#searchInput'),
  refreshButton: document.querySelector('#refreshButton'),
  tableBody: document.querySelector('#studentsTableBody'),
  tableWrap: document.querySelector('#tableWrap'),
  loadingState: document.querySelector('#loadingState'),
  emptyState: document.querySelector('#emptyState'),
  messageBox: document.querySelector('#messageBox'),
  studentCount: document.querySelector('#studentCount'),
  profilePanel: document.querySelector('#profilePanel')
};

fieldIds.forEach((id) => {
  elements[id] = document.querySelector(`#${id}`);
});

const fieldErrors = {
  name: document.querySelector('#nameError'),
  email: document.querySelector('#emailError'),
  course: document.querySelector('#courseError'),
  age: document.querySelector('#ageError')
};

const request = async (url, options = {}) => {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.message || 'Something went wrong');
  }

  return result;
};

const setApiStatus = (isOnline) => {
  elements.apiStatus.classList.toggle('online', isOnline);
  elements.apiStatus.classList.toggle('offline', !isOnline);
  elements.apiStatus.querySelector('span:last-child').textContent = isOnline
    ? 'API Connected'
    : 'API Offline';
};

const setLoading = (isLoading) => {
  elements.loadingState.classList.toggle('hidden', !isLoading);
  elements.refreshButton.disabled = isLoading;

  if (isLoading) {
    elements.tableWrap.classList.add('hidden');
    elements.emptyState.classList.add('hidden');
  }
};

const showMessage = (message, type = 'success') => {
  elements.messageBox.textContent = message;
  elements.messageBox.classList.toggle('error', type === 'error');
  elements.messageBox.classList.remove('hidden');
  window.setTimeout(() => elements.messageBox.classList.add('hidden'), 3500);
};

const clearFieldErrors = () => {
  Object.values(fieldErrors).forEach((errorElement) => {
    errorElement.textContent = '';
  });
};

const getFormData = () => ({
  profilePhoto: state.profilePhotoData,
  studentId: elements.studentCode.value.trim(),
  firstName: elements.firstName.value.trim(),
  lastName: elements.lastName.value.trim(),
  gender: elements.gender.value,
  dateOfBirth: elements.dateOfBirth.value || undefined,
  name: elements.name.value.trim(),
  email: elements.email.value.trim(),
  course: elements.course.value.trim(),
  age: elements.age.value ? Number(elements.age.value) : undefined,
  phone: elements.phone.value.trim(),
  address: elements.address.value.trim(),
  city: elements.city.value.trim(),
  state: elements.state.value.trim(),
  country: elements.country.value.trim(),
  department: elements.department.value.trim(),
  year: elements.year.value.trim(),
  semester: elements.semester.value.trim(),
  admissionDate: elements.admissionDate.value || undefined,
  parentName: elements.parentName.value.trim(),
  parentRelationship: elements.parentRelationship.value.trim(),
  parentPhone: elements.parentPhone.value.trim(),
  parentEmail: elements.parentEmail.value.trim()
});

const validateForm = () => {
  clearFieldErrors();
  const student = getFormData();
  let isValid = true;

  if (!student.name) {
    fieldErrors.name.textContent = 'Name is required';
    isValid = false;
  }

  if (!student.email) {
    fieldErrors.email.textContent = 'Email is required';
    isValid = false;
  } else if (!student.email.includes('@')) {
    fieldErrors.email.textContent = 'Enter a valid email address';
    isValid = false;
  }

  if (!student.course) {
    fieldErrors.course.textContent = 'Course is required';
    isValid = false;
  }

  if (student.age && Number(student.age) < 1) {
    fieldErrors.age.textContent = 'Age must be greater than 0';
    isValid = false;
  }

  return isValid;
};

const resetForm = () => {
  state.isEditing = false;
  state.profilePhotoData = '';
  elements.form.reset();
  elements.studentId.value = '';
  elements.formTitle.textContent = 'Add Student';
  elements.submitButton.textContent = 'Save Student';
  elements.cancelEditButton.classList.add('hidden');
  clearFieldErrors();
};

const getFilteredStudents = () => {
  const term = state.searchTerm.toLowerCase();
  if (!term) return state.students;

  return state.students.filter((student) => (
    student.name.toLowerCase().includes(term) ||
    student.email.toLowerCase().includes(term) ||
    student.course.toLowerCase().includes(term) ||
    (student.studentId || '').toLowerCase().includes(term)
  ));
};

const escapeHtml = (value) => {
  const div = document.createElement('div');
  div.textContent = value || '';
  return div.innerHTML;
};

const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : 'Not added');

const renderProfile = (student) => {
  const initials = escapeHtml((student.name || 'S').charAt(0).toUpperCase());
  const photo = student.profilePhoto
    ? `<img src="${escapeHtml(student.profilePhoto)}" alt="${escapeHtml(student.name)}" />`
    : initials;
  const fields = [
    ['Student ID', student.studentId],
    ['First Name', student.firstName],
    ['Last Name', student.lastName],
    ['Gender', student.gender],
    ['Date of Birth', formatDate(student.dateOfBirth)],
    ['Email', student.email],
    ['Phone Number', student.phone],
    ['Address', student.address],
    ['City', student.city],
    ['State', student.state],
    ['Country', student.country],
    ['Course', student.course],
    ['Department', student.department],
    ['Year', student.year],
    ['Semester', student.semester],
    ['Admission Date', formatDate(student.admissionDate)],
    ['Parent Name', student.parentName],
    ['Relationship', student.parentRelationship],
    ['Parent Phone Number', student.parentPhone],
    ['Parent Email', student.parentEmail]
  ];

  elements.profilePanel.innerHTML = `
    <div class="profile-header">
      <div class="profile-photo">${photo}</div>
      <div>
        <p class="eyebrow">View Profile</p>
        <h2>${escapeHtml(student.name)}</h2>
        <p class="muted">${escapeHtml(student.email)}</p>
      </div>
    </div>
    <dl class="profile-grid">
      ${fields.map(([label, value]) => `<div><dt>${label}</dt><dd>${escapeHtml(value || 'Not added')}</dd></div>`).join('')}
    </dl>
  `;
  elements.profilePanel.classList.remove('hidden');
};

const renderStudents = () => {
  const filteredStudents = getFilteredStudents();
  elements.studentCount.textContent = `${filteredStudents.length} ${filteredStudents.length === 1 ? 'student' : 'students'}`;
  elements.emptyState.classList.toggle('hidden', filteredStudents.length > 0);
  elements.tableWrap.classList.toggle('hidden', filteredStudents.length === 0);

  elements.tableBody.innerHTML = filteredStudents.map((student) => `
    <tr data-action="view" data-id="${student._id}">
      <td>
        <div class="student-name">${escapeHtml(student.name)}</div>
        <div class="muted">${escapeHtml(student.studentId || student._id)}</div>
      </td>
      <td>${escapeHtml(student.email)}</td>
      <td>${escapeHtml(student.course)}</td>
      <td>${student.age || '-'}</td>
      <td>
        <div class="actions">
          <button class="secondary-button" type="button" data-action="view" data-id="${student._id}">View Profile</button>
          <button class="secondary-button" type="button" data-action="edit" data-id="${student._id}">Edit</button>
          <button class="danger-button" type="button" data-action="delete" data-id="${student._id}">Delete</button>
        </div>
      </td>
    </tr>
  `).join('');
};

const fetchStudents = async () => {
  setLoading(true);

  try {
    const result = await request(API_BASE_URL);
    state.students = result.data || [];
    setApiStatus(true);
    renderStudents();
  } catch (error) {
    setApiStatus(false);
    state.students = [];
    renderStudents();
    showMessage(error.message, 'error');
  } finally {
    setLoading(false);
  }
};

const createStudent = async (student) => {
  await request(API_BASE_URL, { method: 'POST', body: JSON.stringify(student) });
};

const updateStudent = async (id, student) => {
  await request(`${API_BASE_URL}/${id}`, { method: 'PUT', body: JSON.stringify(student) });
};

const deleteStudent = async (id) => {
  await request(`${API_BASE_URL}/${id}`, { method: 'DELETE' });
};

const handleFormSubmit = async (event) => {
  event.preventDefault();
  if (!validateForm()) return;

  const student = getFormData();
  const id = elements.studentId.value;
  elements.submitButton.disabled = true;
  elements.submitButton.textContent = state.isEditing ? 'Updating...' : 'Saving...';

  try {
    if (state.isEditing) {
      await updateStudent(id, student);
      showMessage('Student profile updated successfully');
    } else {
      await createStudent(student);
      showMessage('Student profile added successfully');
    }

    resetForm();
    await fetchStudents();
  } catch (error) {
    showMessage(error.message, 'error');
  } finally {
    elements.submitButton.disabled = false;
    elements.submitButton.textContent = state.isEditing ? 'Update Student' : 'Save Student';
  }
};

const toDateInput = (value) => (value ? new Date(value).toISOString().slice(0, 10) : '');

const fillFormForEdit = (student) => {
  state.isEditing = true;
  elements.studentId.value = student._id;
  state.profilePhotoData = student.profilePhoto || '';
  elements.studentCode.value = student.studentId || '';
  elements.firstName.value = student.firstName || '';
  elements.lastName.value = student.lastName || '';
  elements.gender.value = student.gender || '';
  elements.dateOfBirth.value = toDateInput(student.dateOfBirth);
  elements.name.value = student.name;
  elements.email.value = student.email;
  elements.course.value = student.course;
  elements.age.value = student.age || '';
  elements.phone.value = student.phone || '';
  elements.address.value = student.address || '';
  elements.city.value = student.city || '';
  elements.state.value = student.state || '';
  elements.country.value = student.country || '';
  elements.department.value = student.department || '';
  elements.year.value = student.year || '';
  elements.semester.value = student.semester || '';
  elements.admissionDate.value = toDateInput(student.admissionDate);
  elements.parentName.value = student.parentName || '';
  elements.parentRelationship.value = student.parentRelationship || '';
  elements.parentPhone.value = student.parentPhone || '';
  elements.parentEmail.value = student.parentEmail || '';
  elements.formTitle.textContent = 'Edit Student Profile';
  elements.submitButton.textContent = 'Update Student';
  elements.cancelEditButton.classList.remove('hidden');
  elements.name.focus();
};

const handleTableClick = async (event) => {
  const target = event.target.closest('[data-action]');
  if (!target) return;

  const { action, id } = target.dataset;
  const student = state.students.find((item) => item._id === id);

  if (action === 'view' && student) {
    renderProfile(student);
    return;
  }

  if (action === 'edit' && student) {
    fillFormForEdit(student);
    return;
  }

  if (action === 'delete' && student) {
    const confirmed = window.confirm(`Delete ${student.name}?`);
    if (!confirmed) return;

    try {
      await deleteStudent(id);
      showMessage('Student profile deleted successfully');
      elements.profilePanel.classList.add('hidden');
      await fetchStudents();
      resetForm();
    } catch (error) {
      showMessage(error.message, 'error');
    }
  }
};

const registerEvents = () => {
  elements.form.addEventListener('submit', handleFormSubmit);
  elements.cancelEditButton.addEventListener('click', resetForm);
  elements.refreshButton.addEventListener('click', fetchStudents);
  elements.tableBody.addEventListener('click', handleTableClick);
  elements.profilePhoto.addEventListener('change', (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      state.profilePhotoData = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      state.profilePhotoData = reader.result;
    };
    reader.readAsDataURL(file);
  });
  elements.searchInput.addEventListener('input', (event) => {
    state.searchTerm = event.target.value.trim();
    renderStudents();
  });
};

registerEvents();
fetchStudents();
