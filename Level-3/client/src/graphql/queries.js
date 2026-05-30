import { gql } from '@apollo/client';

export const ME_QUERY = gql`
  query Me {
    me {
      _id
      name
      email
      role
    }
  }
`;

export const GET_STUDENTS_QUERY = gql`
  query GetStudents($search: String, $page: Int, $limit: Int) {
    getStudents(search: $search, page: $page, limit: $limit) {
      _id
      studentName
      profilePhoto
      studentId
      email
      phone
      department
      year
      semester
      age
      attendance
      marks
      courseProgress
      remarks
      resultPublished
      grade
      course {
        _id
        courseName
        courseCode
      }
    }
  }
`;

export const GET_COURSES_QUERY = gql`
  query GetCourses($search: String, $page: Int, $limit: Int) {
    getCourses(search: $search, page: $page, limit: $limit) {
      _id
      courseName
      courseCode
      instructor
      description
      displayName
    }
  }
`;
