import { Request, Response } from 'express';
import { obtenerTodosLosUsuarios, buscarUsuarioPorId, actualizarUsuario, buscarUsuarios } from '../models/userModel';
import { AuthRequest } from '../middleware/authMiddleware';

export const obtenerUsuarios = async (req: Request, res: Response): Promise<void> => {
    try {
        const nombre = req.query.nombre as string | undefined;
        const email = req.query.email as string | undefined;

        if (nombre || email) {
            const usuarios = await buscarUsuarios({ nombre, email });
            res.json(usuarios);
        } else {
            const usuarios = await obtenerTodosLosUsuarios();
            res.json(usuarios);
        }
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener usuarios' });
    }
};

export const obtenerUsuario = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    try {
        const usuario = await buscarUsuarioPorId(id);
        if (!usuario) {
            res.status(404).json({ mensaje: 'Usuario no encontrado' });
            return;
        }
        res.json(usuario);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener usuario' });
    }
};

export const actualizarUsuarioControlador = async (req: AuthRequest, res: Response): Promise<void> => {
    const id = req.params.id as string;
    const { usuario, email } = req.body;

    // Verificar si el usuario autenticado es el dueño de la cuenta
    if (req.user?.id !== id) {
        res.status(403).json({ mensaje: 'No tienes permiso para actualizar este usuario' });
        return;
    }

    if (!usuario && !email) {
        res.status(400).json({ mensaje: 'No hay datos para actualizar' });
        return;
    }

    try {
        // Verificar si el usuario existe antes de actualizar
        const usuarioExistente = await buscarUsuarioPorId(id);
        if (!usuarioExistente) {
            res.status(404).json({ mensaje: 'Usuario no encontrado' });
            return;
        }

        await actualizarUsuario(id, { usuario, email });

        const usuarioActualizado = await buscarUsuarioPorId(id);
        res.json({
            mensaje: 'Usuario actualizado exitosamente',
            usuario: usuarioActualizado
        });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al actualizar usuario' });
    }
};
