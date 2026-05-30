import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from '@apollo/client';
import { API_BASE_URL } from '../services/api.js';

const graphqlUrl = API_BASE_URL.replace(/\/api\/?$/, '/graphql');

const httpLink = new HttpLink({
  uri: graphqlUrl
});

const authLink = new ApolloLink((operation, forward) => {
  const token = localStorage.getItem('sms_l3_token');

  operation.setContext(({ headers = {} }) => ({
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : ''
    }
  }));

  return forward(operation);
});

const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache()
});

export default apolloClient;
