import { gql } from '@apollo/client';

export const GET_ME = gql`
  query GetMe {
    me {
      id
      name
      email
      created_at
      updated_at
    }
  }
`;

export const GET_USERS = gql`
  query GetUsers($page: Int!) {
    users(page: $page) {
      data {
        id
        name
        email
        created_at
        updated_at
      }
      paginatorInfo {
        currentPage
        lastPage
        total
      }
    }
  }
`;

export const GET_USER_POSTS = gql`
  query GetUserPosts($first: Int!, $page: Int) {
    UserPosts(first: $first, page: $page) {
      data {
        id
        title
        content
        image
        user_id
        created_at
        updated_at
      }
      paginatorInfo {
        currentPage
        lastPage
        total
      }
    }
  }
`;

export const GET_POSTS = gql`
  query GetPosts($first: Int!, $page: Int) {
    posts(first: $first, page: $page) {
      data {
        id
        title
        content
        image
        user_id
        created_at
        updated_at
      }
      paginatorInfo {
        currentPage
        lastPage
        total
      }
    }
  }
`;

// FIXED: Correct query structure with input object
export const GET_POST_BY_ID = gql`
  query GetPostById($id: ID!) {
    GetPostById(id: $id) {
      id
      title
      content
      image
      user_id
      created_at
      updated_at
    }
  }
`;
export const GET_POST_BY_GEST_USER = gql`
  query GetPostsGestUser($id: ID!) {
    GetPostsGestUser(id: $id) {
      id
      title
      content
      image
      user_id
      created_at
      updated_at
    }
  }
`;