import { Router } from 'express';
import {
    crear,
    listarMisGrupos,
    obtenerDetalle,
    actualizar,
    eliminar,
    agregarMiembroController,
    eliminarMiembroController
} from '../controllers/groupController';
import { verificarToken } from '../middleware/authMiddleware';

const router = Router();

// Rutas CRUD Grupos

/**
 * @swagger
 * components:
 *   schemas:
 *     Grupo:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         nombre:
 *           type: string
 *         descripcion:
 *           type: string
 *         creador:
 *           type: string
 *         estado:
 *           type: string
 *         creado_en:
 *           type: string
 *           format: date-time
 */

// Crear grupo
/**
 * @swagger
 * /api/groups:
 *   post:
 *     summary: Crear un nuevo grupo
 *     tags: [Grupos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - usuarios
 *             properties:
 *               nombre:
 *                 type: string
 *               descripcion:
 *                 type: string
 *     responses:
 *       201:
 *         description: Grupo creado exitosamente
 */
router.post('/', verificarToken, crear);

// Listar grupos del usuario
/**
 * @swagger
 * /api/groups:
 *   get:
 *     summary: Listar grupos del usuario
 *     tags: [Grupos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de grupos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Grupo'
 */
router.get('/', verificarToken, listarMisGrupos);

// Obtener detalle grupo
/**
 * @swagger
 * /api/groups/{id}:
 *   get:
 *     summary: Obtener detalle del grupo
 *     tags: [Grupos]
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
 *         description: Detalle del grupo con miembros
 *       404:
 *         description: Grupo no encontrado
 */
router.get('/:id', verificarToken, obtenerDetalle);

// Actualizar grupo
/**
 * @swagger
 * /api/groups/{id}:
 *   put:
 *     summary: Actualizar grupo
 *     tags: [Grupos]
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
 *         description: Grupo actualizado
 */
router.put('/:id', verificarToken, actualizar);

// Eliminar grupo (lógico)
/**
 * @swagger
 * /api/groups/{id}:
 *   delete:
 *     summary: Eliminar grupo
 *     tags: [Grupos]
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
 *         description: Grupo eliminado
 */
router.delete('/:id', verificarToken, eliminar);

// Agregar miembro
/**
 * @swagger
 * /api/groups/{id}/members:
 *   post:
 *     summary: Agregar miembro al grupo
 *     tags: [Grupos]
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
 *             properties:
 *               usuarios:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Lista de IDs de usuarios a agregar (obligatorio)
 *     responses:
 *       200:
 *         description: Miembro agregado
 */
router.post('/:id/members', verificarToken, agregarMiembroController);

// Eliminar miembro
/**
 * @swagger
 * /api/groups/{id}/members/{userId}:
 *   delete:
 *     summary: Eliminar miembro del grupo
 *     tags: [Grupos]
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
 *         description: Miembro eliminado
 */
router.delete('/:id/members/:userId', verificarToken, eliminarMiembroController);

export default router;
