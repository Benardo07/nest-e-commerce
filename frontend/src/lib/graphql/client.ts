import { ApolloClient, InMemoryCache, HttpLink, from } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { setContext } from '@apollo/client/link/context';
import { envConfig } from '../env';
import { authTokenAtom, clearAuthAtom } from '../../store/auth';
import { getDefaultStore } from 'jotai';

const store = getDefaultStore();

const httpLink = new HttpLink({
  uri: envConfig.VITE_GRAPHQL_URL,
  credentials: 'include',
});

const authLink = setContext((_, { headers }) => {
  const token = store.get(authTokenAtom);
  return {
    headers: {
      ...headers,
      Authorization: token ? `Bearer ${token}` : undefined,
    },
  };
});

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    for (const err of graphQLErrors) {
      if (err.extensions?.code === 'UNAUTHENTICATED') {
        store.set(clearAuthAtom);
      }
    }
  }
  if (networkError && 'statusCode' in networkError && networkError.statusCode === 401) {
    store.set(clearAuthAtom);
  }
});

export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink.concat(httpLink)]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
  },
});
