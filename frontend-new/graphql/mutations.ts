import { gql } from '@apollo/client';

export const REGISTER = gql`
  mutation Register($input: RegisterInput!) {
    Register(input: $input) {
      access_token
      user {
        id
        name
        email
      }
    }
  }
`;

export const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    Login(input: $input) {
      access_token
      user {
        id
        name
        email
      }
    }
  }
`;

export const LOGOUT = gql`
  mutation Logout {
    Logout
  }
`;

export const CREATE_POST = gql`
  mutation CreatePost($input: CreatePostInput!) {
    CreatePost(input: $input) {
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

export const UPDATE_POST = gql`
  mutation UpdatePost($input: UpdatePostInput!) {
    UpdatePost(input: $input) {
      id
      title
      content
      image
      user_id
      updated_at
    }
  }
`;

export const DELETE_POST = gql`
  mutation DeletePost($input: DeletePostInput!) {
    DeletePost(input: $input)
  }
`;