# GraphQL API Guide

REST remains available under `/api/*`. GraphQL is an additional API layer at `/graphql`.

## Required Packages

Backend:

```bash
cd server
npm install @apollo/server @as-integrations/express4 graphql
```

Frontend:

```bash
cd client
npm install @apollo/client graphql
```

## Environment Variables

Use the same `.env` values already required by the REST API:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/edutrack
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

## Folder Structure

```text
server/src/graphql/
  middleware/
    auth.js
  resolvers/
    index.js
  schema/
    apolloServer.js
  typeDefs/
    index.js
```

This project keeps source files under `server/src`, so the GraphQL folders live there beside the existing REST `routes`, `controllers`, and `models`.

## Authorization

For protected queries and mutations, send the JWT token in the header:

```json
{
  "Authorization": "Bearer YOUR_JWT_TOKEN"
}
```

## Login

```graphql
mutation Login {
  login(input: { email: "admin@example.com", password: "password123" }) {
    token
    user {
      _id
      name
      role
    }
  }
}
```

## Fetch Students

```graphql
query FetchStudents {
  getStudents(search: "john", page: 1, limit: 10) {
    _id
    studentName
    email
    marks
    grade
    course {
      courseName
      courseCode
    }
  }
}
```

## Add Course

```graphql
mutation AddCourse {
  addCourse(
    input: {
      courseName: "Full Stack Development"
      courseCode: "FSD101"
      instructor: "Academic Coordinator"
      description: "Student success fundamentals"
    }
  ) {
    _id
    courseName
    courseCode
    instructor
  }
}
```

## Add Student

```graphql
mutation AddStudent {
  addStudent(
    input: {
      studentName: "John Doe"
      email: "john@example.com"
      course: "COURSE_OBJECT_ID"
      age: 20
      attendance: 95
      marks: 88
    }
  ) {
    _id
    studentName
    course {
      courseName
    }
  }
}
```

## REST And GraphQL Together

- REST continues to run under `/api/auth`, `/api/students`, `/api/courses`, and the other existing route files.
- GraphQL runs under `/graphql` and uses the same Mongoose models, MongoDB database, and JWT secret.
- The React app still uses Axios for the existing pages.
- The GraphQL demo page uses Apollo Client and proves GraphQL is an alternative API layer, not a replacement.

## Testing Guide

1. Start the backend:

```bash
cd server
npm run dev
```

2. Open Apollo Sandbox:

```text
http://localhost:5000/graphql
```

3. Run the `login` mutation and copy the returned token.

4. Add this header in Apollo Sandbox:

```json
{
  "Authorization": "Bearer YOUR_TOKEN"
}
```

5. Run protected queries such as `me`, `getStudents`, or `getCourses`.

6. Start the frontend:

```bash
cd client
npm run dev
```

7. Log in normally through the REST-powered UI, then open `/graphql-demo` to see Apollo Client fetching students through GraphQL.

## Update Student

```graphql
mutation UpdateStudent {
  updateStudent(id: "STUDENT_OBJECT_ID", input: { marks: 92, attendance: 97 }) {
    _id
    studentName
    marks
    grade
  }
}
```
