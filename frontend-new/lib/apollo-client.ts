import { ApolloClient, InMemoryCache, createHttpLink, NormalizedCacheObject } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { createUploadLink } from 'apollo-upload-client';
import Cookies from 'js-cookie';

// Use createUploadLink instead of createHttpLink for file upload support
const uploadLink = createUploadLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || 'http://localhost:8000/graphql',
  credentials: 'include',
  headers: {
    'Apollo-Require-Preflight': 'true',
  },
});

const authLink = setContext(async (_, { headers }) => {
  // Get CSRF token
  let csrfToken = Cookies.get('XSRF-TOKEN');
  
  if (!csrfToken && typeof window !== 'undefined') {
    // Fetch CSRF cookie if not present
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sanctum/csrf-cookie`, {
      credentials: 'include',
    });
    csrfToken = Cookies.get('XSRF-TOKEN');
  }
  
  const token = Cookies.get('access_token') || localStorage.getItem('access_token');
  
  return {
    headers: {
      ...headers,
      'X-XSRF-TOKEN': csrfToken ? decodeURIComponent(csrfToken) : undefined,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

export const client: ApolloClient<NormalizedCacheObject> = new ApolloClient({
  link: authLink.concat(uploadLink),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'network-only',
    },
  },
});