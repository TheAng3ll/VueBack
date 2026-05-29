import {
  GraphQLFloat,
  GraphQLInt,
  GraphQLList,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';

const RecetaType = new GraphQLObjectType({
  name: 'Receta',
  fields: () => ({
    id: { type: GraphQLInt },
    nombre: { type: GraphQLString },
    titulo: { type: GraphQLString },
    descripcion: { type: GraphQLString },
    consejos: { type: GraphQLString },
    instrucciones: { type: GraphQLString },
    ingredientes: { type: new GraphQLList(GraphQLString) },
    /** Texto para UI: descripcion del catalogo si existe, si no nombre (match sigue con `ingredientes`) */
    ingredientesMostrar: {
      type: new GraphQLList(GraphQLString),
      resolve: (parent) =>
        parent.ingredientes_mostrar ?? parent.ingredientesMostrar ?? [],
    },
    matchPorcentaje: { type: GraphQLFloat },
    tiempo_prep: { type: GraphQLInt },
    comensales: { type: GraphQLInt },
    porciones: { type: GraphQLInt },
    dificultad: { type: GraphQLString },
    imagen: { type: GraphQLString },
    usuario_id: { type: GraphQLInt },
    autor_id: { type: GraphQLInt },
    autor_username: { type: GraphQLString },
    created_at: { type: GraphQLString },
  }),
});

export default RecetaType;
