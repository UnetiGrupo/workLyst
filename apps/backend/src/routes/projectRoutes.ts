import { Router } from 'express';
import {
    crear,
    listar,
    obtenerUno,
    actualizar,
    finalizar,
    eliminar,
    agregarMiembroController,
    eliminarMiembroController
} from '../controllers/projectController';
import { crear as crearTarea, listarPorProyecto as listarTareas } from '../controllers/taskController';
import { verificarToken } from '../middleware/authMiddleware';

const router = Router();

// Rutas CRUD Proyectos

/**
 * @swagger
 * components:
 *   schemas:
 *     Miembro:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         nombre:
 *           type: string
 *         email:
 *           type: string
 *         rol:
 *           type: string
 *         fechaUnion:
 *           type: string
 *           format: date-time
 *     Proyecto:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         nombre:
 *           type: string
 *         descripcion:
 *           type: string
 *         creadorId:
 *           type: string
 *           description: Nombre del creador o ID
 *         estado:
 *           type: string
 *           enum: [active, finished]
 *         creadoEn:
 *           type: string
 *           format: date-time
 *         actualizadoEn:
 *           type: string
 *           format: date-time
 *         rol:
 *           type: string
 *           description: Rol del usuario en el proyecto (solo en listados de usuario)
 *         totalTareas:
 *           type: integer
 *           description: Cantidad total de tareas en el proyecto
 *         tareasCompletadas:
 *           type: integer
 *           description: Cantidad de tareas completadas en el proyecto
 */

/**
 * @swagger
 * /api/projects:
 *   post:
 *     summary: Crear un nuevo proyecto
 *     tags: [Projects]
 *     security:
 *       - apiKeyAuth: []
 *         bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *             properties:
 *               nombre:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               miembros:
 *                 type: array
 *                 items:
 *                   type: string
 *                   description: IDs de los usuarios a agregar
 *     responses:
 *       201:
 *         description: Proyecto creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 proyecto:
 *                   $ref: '#/components/schemas/Proyecto'
 *       400:
 *         description: Nombre de proyecto obligatorio
 *       401:
 *         description: No autorizado
 *   get:
 *     summary: Listar proyectos del usuario
 *     tags: [Projects]
 *     security:
 *       - apiKeyAuth: []
 *         bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de proyectos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Proyecto'
 *       401:
 *         description: No autorizado
 */
router.post('/', verificarToken, crear);
router.get('/', verificarToken, listar);

/**
 * @swagger
 * /api/projects/{id}:
 *   get:
 *     summary: Obtener proyecto por ID
 *     tags: [Projects]
 *     security:
 *       - apiKeyAuth: []
 *         bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detalles del proyecto con miembros
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Proyecto'
 *                 - type: object
 *                   properties:
 *                     miembros:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Miembro'
 *       404:
 *         description: Proyecto no encontrado
 *       403:
 *         description: No tienes permiso para ver este proyecto
 *   put:
 *     summary: Actualizar proyecto
 *     tags: [Projects]
 *     security:
 *       - apiKeyAuth: []
 *         bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               descripcion:
 *                 type: string
 *     responses:
 *       200:
 *         description: Proyecto actualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *       403:
 *         description: Solo el creador puede editar
 *       404:
 *         description: Proyecto no encontrado
 *   delete:
 *     summary: Eliminar proyecto
 *     tags: [Projects]
 *     security:
 *       - apiKeyAuth: []
 *         bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Proyecto eliminado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *       403:
 *         description: Solo el creador puede eliminar
 *       404:
 *         description: Proyecto no encontrado
 */
router.get('/:id', verificarToken, obtenerUno);
router.put('/:id', verificarToken, actualizar);

/**
 * @swagger
 * /api/projects/{id}/finish:
 *   patch:
 *     summary: Finalizar proyecto
 *     tags: [Projects]
 *     security:
 *       - apiKeyAuth: []
 *         bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Proyecto finalizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *       403:
 *         description: Solo el creador puede finalizar
 *       404:
 *         description: Proyecto no encontrado
 */
router.patch('/:id/finish', verificarToken, finalizar);
router.delete('/:id', verificarToken, eliminar);

/**
 * @swagger
 * /api/projects/{id}/members:
 *   post:
 *     summary: Agregar miembro al proyecto
 *     tags: [Projects]
 *     security:
 *       - apiKeyAuth: []
 *         bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - usuarioId
 *             properties:
 *               usuarioId:
 *                 type: string
 *                 description: ID del usuario a agregar
 *               rolId:
 *                 type: integer
 *                 description: ID del rol. Si no se envía usa el por defecto (member).
 *     responses:
 *       200:
 *         description: Miembro agregado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 rolId:
 *                   type: integer
 *       400:
 *         description: ID de usuario requerido o no se puede eliminar al creador
 *       403:
 *         description: Solo el creador puede agregar miembros
 *       404:
 *         description: Proyecto o usuario no encontrado
 */
router.post('/:id/members', verificarToken, agregarMiembroController);

/**
 * @swagger
 * /api/projects/{id}/members/{userId}:
 *   delete:
 *     summary: Eliminar miembro del proyecto
 *     tags: [Projects]
 *     security:
 *       - apiKeyAuth: []
 *         bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Miembro eliminado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *       403:
 *         description: Solo el creador puede eliminar miembros
 *       404:
 *         description: Proyecto no encontrado
 */
router.delete('/:id/members/:userId', verificarToken, eliminarMiembroController);


/**
 * @swagger
 * /api/projects/{projectId}/tasks:
 *   post:
 *     summary: Crear tarea en un proyecto
 *     tags: [Tareas]
 *     security:
 *       - apiKeyAuth: []
 *         bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - titulo
 *             properties:
 *               titulo:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               asignado_a:
 *                 type: string
 *                 description: ID del usuario asignado (opcional)
 *               fecha_limite:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Tarea creada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 tarea:
 *                   $ref: '#/components/schemas/Tarea'
 *       400:
 *         description: Título obligatorio o fecha inválida
 *       403:
 *         description: No tienes permiso para crear tareas
 *   get:
 *     summary: Listar tareas de un proyecto
 *     tags: [Tareas]
 *     security:
 *       - apiKeyAuth: []
 *         bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de tareas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Tarea'
 *       403:
 *         description: No tienes permiso para ver tareas
 */
router.post('/:projectId/tasks', verificarToken, crearTarea);
router.get('/:projectId/tasks', verificarToken, listarTareas);

export default router;
