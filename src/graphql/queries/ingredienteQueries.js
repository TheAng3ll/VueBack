import { GraphQLList, GraphQLString } from 'graphql';
import { IngredienteType } from '../types/IngredienteType.js';
import { buscarIngredientesCatalogo } from '../../services/ingredienteService.js';

const ingredienteQueries = {
  buscarIngredientes: {
    type: new GraphQLList(IngredienteType),
    args: {
      termino: { type: GraphQLString },
    },
    resolve: async (_parent, { termino = '' }) => buscarIngredientesCatalogo(termino),
  },
};

export default ingredienteQueries;
