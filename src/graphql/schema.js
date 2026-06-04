import { GraphQLObjectType, GraphQLSchema, GraphQLString } from 'graphql';
import recetaQueries from './queries/recetaQueries.js';
import ingredienteQueries from './queries/ingredienteQueries.js';
import recetaMutations from './mutations/recetaMutations.js';
import usuarioMutations from './mutations/usuarioMutations.js';
import usuarioQueries from './queries/usuarioQueries.js';

const query = new GraphQLObjectType({
  name: 'Query',
  fields: {
    hello: {
      type: GraphQLString,
      resolve: () => 'Hello world!',
    },
    ...recetaQueries,
    ...ingredienteQueries,
    ...usuarioQueries,
  },
});

const mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    ...usuarioMutations,
    ...recetaMutations,
  },
});

const schema = new GraphQLSchema({
  query,
  mutation,
});

export default schema;
