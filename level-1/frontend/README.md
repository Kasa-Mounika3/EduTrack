# EduTrack Frontend

This is a beginner-friendly HTML, CSS, and Vanilla JavaScript frontend for the EduTrack REST API backend.

## Project Structure

```txt
frontend/
├── index.html
├── style.css
├── script.js
├── README.md
└── assets/
```

## Features

- Add a student
- View all students
- Edit a student
- Delete a student
- Search students by name, email, or course
- Loading, empty, success, and error states
- Responsive dashboard layout
- Fetch API with async/await

## API Connection Logic

The frontend connects to the backend from `script.js`:

```js
const API_BASE_URL = 'http://localhost:5000/api/students';
```

The main helper function uses the Fetch API:

```js
const request = async (url, options = {}) => {
  const response = await fetch(url, options);
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Something went wrong');
  }

  return result;
};
```

## How Frontend Communicates With Backend

The browser sends HTTP requests to the Express API:

| Frontend Action | HTTP Method | Backend Endpoint |
| --- | --- | --- |
| Load students | GET | `/api/students` |
| Add student | POST | `/api/students` |
| Edit student | PUT | `/api/students/:id` |
| Delete student | DELETE | `/api/students/:id` |

The backend returns JSON. The frontend reads that JSON and dynamically updates the table without reloading the page.

## Setup Instructions

1. Start the backend first:

```bash
cd C:\Users\kasas\OneDrive\Desktop\SMS\level-1\backend
npm run dev
```

2. Open another terminal for the frontend:

```bash
cd C:\Users\kasas\OneDrive\Desktop\SMS\level-1\frontend
```

3. Start a simple static server:

```bash
python -m http.server 5500
```

4. Open this URL in the browser:

```txt
http://localhost:5500
```

## How To Run Locally

Make sure both apps are running:

- Backend: `http://localhost:5000`
- Frontend: `http://localhost:5500`

Then use the dashboard to add, search, edit, and delete students.

## Important Note

If your backend runs on another port, update this line in `script.js`:

```js
const API_BASE_URL = 'http://localhost:5000/api/students';
```
