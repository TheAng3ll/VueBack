import { GraphQLString } from 'graphql';
import UsuarioType from '../types/UsuarioType.js';

const usuarioMutations = {
  registrarUsuario: {
    type: UsuarioType,
    args: {
      nombre: { type: GraphQLString },
      email: { type: GraphQLString },
      password: { type: GraphQLString },
    },
    resolve: async () => null,
  },
};

export default usuarioMutations;
