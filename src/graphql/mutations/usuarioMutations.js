import { GraphQLInt, GraphQLString } from 'graphql';
import UsuarioType from '../types/UsuarioType.js';
import {
  registrarUsuario,
  iniciarSesion,
  actualizarUsuario,
} from '../../services/authService.js';
import AuthPayloadType from '../types/AuthPayloadType.js';

const usuarioMutations = {
  registrarUsuario: {
    type: UsuarioType,
    args: {
      username: { type: GraphQLString },
      email: { type: GraphQLString },
      password: { type: GraphQLString },
    },
    resolve: async (_parent, args) => { return await registrarUsuario(args);},
  },
  iniciarSesion: {
    type: AuthPayloadType,
    args: {
      email: { type: GraphQLString },
      password: { type: GraphQLString },
    },
    resolve: async (_parent, args) => { return await iniciarSesion(args);},
  },
  actualizarUsuario: {
    type: UsuarioType,
    args: {
      id: { type: GraphQLInt },
      username: { type: GraphQLString },
      email: { type: GraphQLString },
      biografia: { type: GraphQLString },
    },
    resolve: async (_parent, args) => { return await actualizarUsuario(args);},
  },
};

export default usuarioMutations;
