import { GraphQLObjectType, GraphQLSchema, GraphQLString } from 'graphql';
import recetaQueries from './queries/recetaQueries.js';
import usuarioMutations from './mutations/usuarioMutations.js';

const query = new GraphQLObjectType({
  name: 'Query',
  fields: {
    hello: {
      type: GraphQLString,
      resolve: () => 'Hello world!',
    },
    ...recetaQueries,
  },
});

const mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    ...usuarioMutations,
  },
});

const schema = new GraphQLSchema({
  query,
  mutation,
});

export default schema;
