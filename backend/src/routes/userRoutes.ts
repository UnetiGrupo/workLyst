import { Router } from 'express';
import { obtenerUsuarios, obtenerUsuario, actualizarUsuarioControlador } from '../controllers/userController';
import { verificarToken } from '../middleware/authMiddleware';

const router = Router();

router.use(verificarToken);

/**
 * @swagger
 * components:
 *   schemas:
 *     Usuario:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         usuario:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         created_at:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Obtener lista de usuarios o buscar usuarios
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: nombre
 *         schema:
 *           type: string
 *         description: Nombre del usuario (coincidencia parcial)
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *         description: Email del usuario (coincidencia exacta)
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Usuario'
 */
router.get('/', obtenerUsuarios);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Obtener detalle de un usuario
 *     tags: [Usuarios]
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
 *         description: Detalle del usuario
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Usuario'
 *       404:
 *         description: Usuario no encontrado
 */
router.get('/:id', obtenerUsuario);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Actualizar información de usuario
 *     tags: [Usuarios]
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
 *               usuario:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Usuario actualizado
 *       403:
 *         description: No autorizado (solo el dueño puede editar)
 */
router.put('/:id', actualizarUsuarioControlador);

export default router;
