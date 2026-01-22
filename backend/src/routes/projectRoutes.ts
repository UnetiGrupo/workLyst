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
import { verificarToken } from '../middleware/authMiddleware';

const router = Router();

// Rutas CRUD Proyectos

/**
 * @swagger
 * components:
 *   schemas:
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
 *         estado:
 *           type: string
 *           enum: [active, finished]
 *         creadoEn:
 *           type: string
 *           format: date-time
 *         actualizadoEn:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/projects:
 *   post:
 *     summary: Crear un nuevo proyecto
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
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
 *   get:
 *     summary: Listar proyectos del usuario
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de proyectos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Proyecto'
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
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detalles del proyecto con miembros
 *       404:
 *         description: Proyecto no encontrado
 *   put:
 *     summary: Actualizar proyecto
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
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
 *   delete:
 *     summary: Eliminar proyecto
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Proyecto eliminado
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
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Proyecto finalizado
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
 *       - bearerAuth: []
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
 */
router.post('/:id/members', verificarToken, agregarMiembroController);

/**
 * @swagger
 * /api/projects/{id}/members/{userId}:
 *   delete:
 *     summary: Eliminar miembro del proyecto
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
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
 */
router.delete('/:id/members/:userId', verificarToken, eliminarMiembroController);

export default router;
