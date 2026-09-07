import swaggerJSDoc from 'swagger-jsdoc';
import obtenerConfig from './configLoader';

const config = obtenerConfig();
const port = config.server.port;

const servers = [
    {
        url: `http://localhost:${port}`,
        description: 'Servidor de Desarrollo',
    },
];

// Si estamos en Render, agregar la URL externa
if (process.env.RENDER_EXTERNAL_URL) {
    servers.unshift({
        url: process.env.RENDER_EXTERNAL_URL,
        description: 'Servidor de Producción (Render)',
    });
}

const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'Worklist Backend API',
        version: '1.0.0',
        description: 'Documentación de la API Backend de Worklist',
        contact: {
            name: 'Equipo de Desarrollo Worklist',
        },
    },
    servers,
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            },
            apiKeyAuth: {
                type: 'apiKey',
                in: 'header',
                name: 'x-api-key',
                description: 'API Key para validar la aplicación cliente'
            },
        },
    },
    security: [
        {
            apiKeyAuth: []
        }
    ],
};

const options = {
    swaggerDefinition,
    apis: [
        './src/routes/*.ts',
        './dist/routes/*.js',
        './routes/*.js'
    ],
};

export const swaggerSpec = swaggerJSDoc(options);
