import { GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLString } from 'graphql';
import RecetaType from '../types/RecetaType.js';
import {
  buscarRecetasPorIngredientes,
  listarRecetas,
  obtenerRecetaPorId,
} from '../../services/recetaService.js';

const recetaQueries = {
  listarRecetas: {
    type: new GraphQLList(RecetaType),
    args: {
      limite: { type: GraphQLInt },
    },
    resolve: async (_parent, { limite }) => listarRecetas(limite),
  },
  buscarRecetas: {
    type: new GraphQLList(RecetaType),
    args: {
      ingredientes: { type: new GraphQLList(GraphQLString) },
    },
    resolve: async (_parent, { ingredientes = [] }) => {
      return buscarRecetasPorIngredientes(ingredientes);
    },
  },
  receta: {
    type: RecetaType,
    args: {
      id: { type: new GraphQLNonNull(GraphQLInt) },
    },
    resolve: async (_parent, { id }) => obtenerRecetaPorId(id),
  },
};

export default recetaQueries;
