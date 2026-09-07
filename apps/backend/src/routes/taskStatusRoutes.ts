import { Router } from 'express';
import { listarEstatus, crearNuevoEstatus, modificarEstatus, borrarEstatus } from '../controllers/taskStatusController';
import { verificarToken } from '../middleware/authMiddleware';

const router = Router();

router.use(verificarToken);

/**
 * @swagger
 * components:
 *   schemas:
 *     EstatusTarea:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         key:
 *           type: string
 *         color:
 *           type: string
 *         is_system:
 *           type: boolean
 */

/**
 * @swagger
 * /api/task-statuses:
 *   get:
 *     summary: Obtener todos los estatus de tareas disponibles
 *     tags: [Estatus Tareas]
 *     security:
 *       - apiKeyAuth: []
 *         bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de estatus
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/EstatusTarea'
 */
router.get('/', listarEstatus);

/**
 * @swagger
 * /api/task-statuses:
 *   post:
 *     summary: Crear nuevo estatus de tarea
 *     tags: [Estatus Tareas]
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
 *               color:
 *                 type: string
 *                 example: "#ff0000"
 *     responses:
 *       201:
 *         description: Estatus creado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 estatus:
 *                   $ref: '#/components/schemas/EstatusTarea'
 *       400:
 *         description: Nombre duplicado o faltante
 */
router.post('/', crearNuevoEstatus);

/**
 * @swagger
 * /api/task-statuses/{id}:
 *   put:
 *     summary: Actualizar estatus existente
 *     tags: [Estatus Tareas]
 *     security:
 *       - apiKeyAuth: []
 *         bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               color:
 *                 type: string
 *     responses:
 *       200:
 *         description: Estatus actualizado
 *       403:
 *         description: No se pueden modificar estatus de sistema (algunas propiedades protegidas)
 *       404:
 *         description: Estatus no encontrado
 */
router.put('/:id', modificarEstatus);

/**
 * @swagger
 * /api/task-statuses/{id}:
 *   delete:
 *     summary: Eliminar un estatus
 *     tags: [Estatus Tareas]
 *     security:
 *       - apiKeyAuth: []
 *         bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Estatus eliminado
 *       400:
 *         description: El estatus está en uso
 *       403:
 *         description: No se pueden eliminar estatus de sistema
 *       404:
 *         description: Estatus no encontrado
 */
router.delete('/:id', borrarEstatus);

export default router;
