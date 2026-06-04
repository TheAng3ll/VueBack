import { GraphQLObjectType, GraphQLString } from 'graphql';
import UsuarioType from './UsuarioType.js';

export const AuthPayloadType = new GraphQLObjectType({
  name: 'AuthPayload',
  fields: {
    token: { type: GraphQLString },
    user: { type: UsuarioType },
  },
});

export default AuthPayloadType;