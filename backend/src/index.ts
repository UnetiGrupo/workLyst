import express, { Request, Response } from 'express';
import cors from 'cors';
import obtenerConfig from './config/configLoader';

const config = obtenerConfig();

const app = express();

const puerto = process.env.PORT || config.server.port;

app.use(cors());
app.use(express.json());

app.get('/prueba', (req: Request, res: Response) => {
    res.send('¡Hola Mundo! Backend con TypeScript y SQLite funcionando');
});

// Rutas
import rutasAuth from './routes/authRoutes';
import rutasProyectos from './routes/projectRoutes';
import rutasRoles from './routes/roleRoutes';
import rutasUsuarios from './routes/userRoutes';
import rutasTareas from './routes/taskRoutes';
import rutasGrupos from './routes/groupRoutes';
import { inicializarTablas } from './config/database/init';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';

// Inicializar tablas
inicializarTablas().catch(console.error);

// Documentación Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rutas API
app.use('/api/auth', rutasAuth);
app.use('/api/projects', rutasProyectos);
app.use('/api/roles', rutasRoles);
app.use('/api/users', rutasUsuarios);
app.use('/api/tasks', rutasTareas);
app.use('/api/groups', rutasGrupos);

app.listen(puerto, () => {
    console.log(`Servidor escuchando en http://localhost:${puerto}`);
});

