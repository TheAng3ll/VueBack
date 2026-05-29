import {
  GraphQLInputObjectType,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';

export const IngredienteType = new GraphQLObjectType({
  name: 'Ingrediente',
  fields: {
    id: { type: GraphQLInt },
    nombre: { type: GraphQLString },
    descripcion: { type: GraphQLString },
  },
});

export const IngredienteRecetaInput = new GraphQLInputObjectType({
  name: 'IngredienteRecetaInput',
  fields: {
    nombre: { type: new GraphQLNonNull(GraphQLString) },
    descripcion: { type: new GraphQLNonNull(GraphQLString) },
  },
});
