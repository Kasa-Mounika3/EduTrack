const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@as-integrations/express4');
const { ApolloServerPluginLandingPageLocalDefault } = require('@apollo/server/plugin/landingPage/default');
const { getUserFromRequest } = require('../middleware/auth');
const resolvers = require('../resolvers');
const typeDefs = require('../typeDefs');

const setupApolloServer = async (app) => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    introspection: process.env.NODE_ENV !== 'production',
    plugins:
      process.env.NODE_ENV === 'production'
        ? []
        : [ApolloServerPluginLandingPageLocalDefault({ embed: true })]
  });

  await server.start();

  app.use(
    '/graphql',
    expressMiddleware(server, {
      context: async ({ req }) => ({
        user: await getUserFromRequest(req),
        app: req.app
      })
    })
  );

  return server;
};

module.exports = setupApolloServer;
