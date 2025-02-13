import { createClient } from 'graphql-ws';

const subscriptionClient = createClient({
  url: import.meta.env.VITE_GRAPHQL_ENDPOINT,
});

export default subscriptionClient;