import { Router } from 'express';
import { obtenerDetalle, actualizar, eliminar, asignar } from '../controllers/taskController';
import { verificarToken } from '../middleware/authMiddleware';

const router = Router();

router.use(verificarToken);

/**
 * @swagger
 * components:
 *   schemas:
 *     Tarea:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         proyecto_id:
 *           type: string
 *           format: uuid
 *         asignado_a:
 *           type: string
 *           format: uuid
 *         titulo:
 *           type: string
 *         descripcion:
 *           type: string
 *         estado:
 *           type: string
 *           enum: [pendiente, en_progreso, completada, vencida]
 *         fecha_limite:
 *           type: string
 *           format: date-time
 *         creado_en:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/tasks/{id}:
 *   get:
 *     summary: Obtener detalle de una tarea
 *     tags: [Tareas]
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
 *         description: Detalle de la tarea
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tarea'
 *       404:
 *         description: Tarea no encontrada
 *       403:
 *         description: Acceso denegado
 */
router.get('/:id', obtenerDetalle);

/**
 * @swagger
 * /api/tasks/{id}:
 *   put:
 *     summary: Actualizar tarea
 *     tags: [Tareas]
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
 *             properties:
 *               titulo:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               estado:
 *                 type: string
 *                 enum: [pendiente, en_progreso, completada, vencida]
 *               asignado_a:
 *                 type: string
 *                 format: uuid
 *               fecha_limite:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Tarea actualizada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 tarea:
 *                   $ref: '#/components/schemas/Tarea'
 *       404:
 *         description: Tarea no encontrada
 *       400:
 *         description: Datos inválidos
 */
router.put('/:id', actualizar);

/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: Eliminar tarea
 *     tags: [Tareas]
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
 *         description: Tarea eliminada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *       404:
 *         description: Tarea no encontrada
 */
router.delete('/:id', eliminar);


/**
 * @swagger
 * /api/tasks/{id}/assign:
 *   patch:
 *     summary: Asignar tarea a un usuario
 *     tags: [Tareas]
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
 *               - asignado_a
 *             properties:
 *               asignado_a:
 *                 type: string
 *                 description: ID del usuario a asignar
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Tarea asignada correctamente
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
 *         description: Usuario no es miembro del proyecto o falta asignado_a
 *       404:
 *         description: Tarea no encontrada
 */
router.patch('/:id/assign', asignar);

export default router;
