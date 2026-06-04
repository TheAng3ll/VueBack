import { GraphQLInt } from 'graphql';
import UsuarioType from '../types/UsuarioType.js';
import { obtenerUsuarioInfo } from '../../services/authService.js';

const usuarioQueries = {
  obtenerUsuarioInfo: {
    type: UsuarioType,
    args: { id: { type: GraphQLInt } },
    resolve: async (_parent, { id }) => { return await obtenerUsuarioInfo(id);},
  },
};

export default usuarioQueries;