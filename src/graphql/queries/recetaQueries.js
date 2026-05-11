import { GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLString } from 'graphql';
import RecetaType from '../types/RecetaType.js';
import {
  buscarRecetasPorIngredientes,
  obtenerRecetaPorId,
} from '../../services/recetaService.js';

const recetaQueries = {
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
