import { gql } from '@apollo/client';

export const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      user {
        _id
        name
        email
        role
      }
    }
  }
`;

export const ADD_STUDENT_MUTATION = gql`
  mutation AddStudent($input: StudentInput!) {
    addStudent(input: $input) {
      _id
      studentName
      email
      marks
      grade
      course {
        _id
        courseName
        courseCode
      }
    }
  }
`;

export const UPDATE_STUDENT_MUTATION = gql`
  mutation UpdateStudent($id: ID!, $input: StudentUpdateInput!) {
    updateStudent(id: $id, input: $input) {
      _id
      studentName
      email
      attendance
      marks
      grade
    }
  }
`;

export const UPDATE_ATTENDANCE_MUTATION = gql`
  mutation UpdateAttendance($id: ID!, $attendance: Int!) {
    updateAttendance(id: $id, attendance: $attendance) {
      _id
      attendance
    }
  }
`;

export const UPDATE_GRADES_MUTATION = gql`
  mutation UpdateGrades($id: ID!, $marks: Int, $courseProgress: Int, $remarks: String, $resultPublished: Boolean) {
    updateGrades(id: $id, marks: $marks, courseProgress: $courseProgress, remarks: $remarks, resultPublished: $resultPublished) {
      _id
      marks
      courseProgress
      remarks
      resultPublished
      grade
    }
  }
`;

export const ADD_COURSE_MUTATION = gql`
  mutation AddCourse($input: CourseInput!) {
    addCourse(input: $input) {
      _id
      courseName
      courseCode
      instructor
      displayName
    }
  }
`;
