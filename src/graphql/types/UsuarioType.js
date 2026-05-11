import { GraphQLInt, GraphQLObjectType, GraphQLString } from 'graphql';

const UsuarioType = new GraphQLObjectType({
  name: 'Usuario',
  fields: () => ({
    id: { type: GraphQLInt },
    username: { type: GraphQLString },
    nombre: { type: GraphQLString },
    email: { type: GraphQLString },
    foto_perfil: { type: GraphQLString },
    biografia: { type: GraphQLString },
    created_at: { type: GraphQLString },
  }),
});

export default UsuarioType;
