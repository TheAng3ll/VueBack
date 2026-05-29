import {
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLString,
} from 'graphql';
import RecetaType from '../types/RecetaType.js';
import { IngredienteRecetaInput } from '../types/IngredienteType.js';
import { crearReceta } from '../../services/recetaService.js';

const recetaMutations = {
  publicarReceta: {
    type: RecetaType,
    args: {
      titulo: { type: new GraphQLNonNull(GraphQLString) },
      instrucciones: { type: new GraphQLNonNull(GraphQLString) },
      autorId: { type: new GraphQLNonNull(GraphQLInt) },
      nombre: { type: GraphQLString },
      descripcion: { type: GraphQLString },
      consejos: { type: GraphQLString },
      tiempoPrep: { type: GraphQLInt },
      comensales: { type: GraphQLInt },
      porciones: { type: GraphQLInt },
      dificultad: { type: GraphQLString },
      ingredientes: {
        type: new GraphQLNonNull(
          new GraphQLList(new GraphQLNonNull(IngredienteRecetaInput))
        ),
      },
      imagenUrl: { type: GraphQLString },
    },
    resolve: async (_parent, args) => crearReceta(args),
  },
};

export default recetaMutations;
