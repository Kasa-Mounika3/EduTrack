const typeDefs = `#graphql
  type User {
    _id: ID!
    name: String!
    email: String!
    role: String!
    createdAt: String
    updatedAt: String
  }

  type Course {
    _id: ID!
    courseName: String!
    courseCode: String!
    instructor: String!
    description: String
    displayName: String
    departments: [Department!]
    createdBy: User
    createdAt: String
    updatedAt: String
  }

  type Department {
    _id: ID!
    departmentName: String!
    departmentCode: String
  }

  type Section {
    _id: ID!
    sectionName: String!
    year: String!
    department: Department
  }

  type Student {
    _id: ID!
    studentName: String!
    name: String
    profilePhoto: String
    studentId: String
    firstName: String
    lastName: String
    gender: String
    dateOfBirth: String
    email: String!
    course: Course
    courseId: Course
    departmentId: Department
    sectionId: Section
    age: Int
    phone: String
    alternatePhone: String
    address: String
    city: String
    state: String
    country: String
    department: String
    year: String
    semester: String
    admissionDate: String
    parentName: String
    parentRelationship: String
    parentPhone: String
    parentEmail: String
    attendance: Int
    marks: Int
    courseProgress: Int
    remarks: String
    resultPublished: Boolean
    grade: String
    createdBy: User
    createdAt: String
    updatedAt: String
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  input RegisterInput {
    name: String!
    email: String!
    password: String!
    role: String
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input StudentInput {
    studentName: String!
    name: String
    profilePhoto: String
    studentId: String
    firstName: String
    lastName: String
    gender: String
    dateOfBirth: String
    email: String!
    course: ID!
    courseId: ID
    departmentId: ID
    sectionId: ID
    age: Int
    phone: String
    alternatePhone: String
    address: String
    city: String
    state: String
    country: String
    department: String
    year: String
    semester: String
    admissionDate: String
    parentName: String
    parentRelationship: String
    parentPhone: String
    parentEmail: String
    attendance: Int
    marks: Int
    courseProgress: Int
    remarks: String
    resultPublished: Boolean
  }

  input StudentUpdateInput {
    studentName: String
    name: String
    profilePhoto: String
    studentId: String
    firstName: String
    lastName: String
    gender: String
    dateOfBirth: String
    email: String
    course: ID
    courseId: ID
    departmentId: ID
    sectionId: ID
    age: Int
    phone: String
    alternatePhone: String
    address: String
    city: String
    state: String
    country: String
    department: String
    year: String
    semester: String
    admissionDate: String
    parentName: String
    parentRelationship: String
    parentPhone: String
    parentEmail: String
    attendance: Int
    marks: Int
    courseProgress: Int
    remarks: String
    resultPublished: Boolean
  }

  input CourseInput {
    courseName: String!
    courseCode: String!
    instructor: String!
    description: String
  }

  type Query {
    me: User!
    getStudents(search: String, course: ID, page: Int, limit: Int): [Student!]!
    getStudent(id: ID!): Student!
    getCourses(search: String, page: Int, limit: Int): [Course!]!
  }

  type Mutation {
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
    addStudent(input: StudentInput!): Student!
    updateStudent(id: ID!, input: StudentUpdateInput!): Student!
    updateAttendance(id: ID!, attendance: Int!): Student!
    updateGrades(id: ID!, marks: Int, courseProgress: Int, remarks: String, resultPublished: Boolean): Student!
    deleteStudent(id: ID!): Boolean!
    addCourse(input: CourseInput!): Course!
  }
`;

module.exports = typeDefs;
