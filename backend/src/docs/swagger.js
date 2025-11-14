import swaggerJSDoc from 'swagger-jsdoc';

export const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Hospital Queue System API',
      version: '1.0.0',
      description: 'Documentación de la API del sistema de turnos hospitalarios',
    },
    servers: [
      { url: '/api' }
    ],
  },
  apis: ['./src/routes/*.js'],
});
