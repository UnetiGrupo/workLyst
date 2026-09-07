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
 *                 description: IDs de los usuarios a agregar inicialmente
 *     responses:
 *       201:
 *         description: Grupo creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 grupo:
 *                   $ref: '#/components/schemas/Grupo'
 *       400:
 *         description: Nombre del grupo obligatorio
 *       401:
 *         description: No autorizado
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
 *       - apiKeyAuth: []
 *         bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de grupos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Grupo'
 *       401:
 *         description: No autorizado
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
 *         description: Detalle del grupo con miembros
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Grupo'
 *                 - type: object
 *                   properties:
 *                     miembros:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           nombre:
 *                             type: string
 *                           email:
 *                             type: string
 *                           fecha_union:
 *                             type: string
 *                             format: date-time
 *       404:
 *         description: Grupo no encontrado o no activo
 *       403:
 *         description: No tienes acceso a este grupo
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
 *         description: Grupo actualizado
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
 *         description: Grupo no encontrado
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
 *         description: Grupo eliminado
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
 *         description: Grupo no encontrado
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
 *               - usuarios
 *             properties:
 *               usuarios:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Lista de IDs de usuarios a agregar (obligatorio)
 *     responses:
 *       200:
 *         description: Miembros agregados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *       400:
 *         description: Lista de usuarios requerida
 *       403:
 *         description: Solo el creador puede agregar miembros
 *       404:
 *         description: Grupo no encontrado
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
 *         description: Miembro eliminado del grupo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *       400:
 *         description: No se puede eliminar al creador
 *       403:
 *         description: Solo el creador puede eliminar miembros
 *       404:
 *         description: Grupo no encontrado
 */
router.delete('/:id/members/:userId', verificarToken, eliminarMiembroController);

export default router;
