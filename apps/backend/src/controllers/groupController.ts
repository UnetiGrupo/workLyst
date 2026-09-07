import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import {
    crearGrupo,
    obtenerGrupoPorId,
    obtenerGruposUsuario,
    actualizarGrupo,
    eliminarGrupoLogico,
    agregarMiembro,
    eliminarMiembro,
    obtenerMiembrosGrupo
} from '../models/groupModel';
import { buscarUsuarioPorId } from '../models/userModel';

// Helpers para mapeo
const mapearGrupo = (g: any) => ({
    id: g.id,
    nombre: g.name,
    descripcion: g.description,
    creador: g.owner_name, // Ya viene con el nombre por el join
    estado: g.status_name, // Ya viene con el nombre por el join
    creado_en: g.created_at,
    // actualiz_en: g.updated_at
});

const mapearMiembro = (m: any) => ({
    id: m.id,
    nombre: m.name,
    email: m.email,
    fecha_union: m.joined_at
});

export const crear = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { nombre, descripcion, miembros } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({ mensaje: 'No autorizado' });
            return;
        }

        if (!nombre) {
            res.status(400).json({ mensaje: 'El nombre del grupo es obligatorio' });
            return;
        }

        const nuevoGrupo = await crearGrupo({
            name: nombre,
            description: descripcion,
            owner_id: userId,
            members: miembros // Array de IDs opcional
        });

        // Recuperar para devolver completo con nombres (aunque status es fijo activo en crear)
        // Podemos armar respuesta rápido o consultar. Consultar es más seguro para joins.
        const grupoCompleto = await obtenerGrupoPorId(nuevoGrupo.id);

        res.status(201).json({
            mensaje: 'Grupo creado exitosamente',
            grupo: grupoCompleto ? mapearGrupo(grupoCompleto) : null
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al crear el grupo' });
    }
};

export const listarMisGrupos = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ mensaje: 'No autorizado' });
            return;
        }

        const grupos = await obtenerGruposUsuario(userId);
        res.json(grupos.map(mapearGrupo));
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al obtener grupos' });
    }
};

export const obtenerDetalle = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        const grupo = await obtenerGrupoPorId(id as string);
        if (!grupo) {
            res.status(404).json({ mensaje: 'Grupo no encontrado o no activo' });
            return;
        }

        // Verificar membresía
        const miembros = await obtenerMiembrosGrupo(id as string);
        const esMiembro = miembros.some((m: any) => m.id === userId);

        if (!esMiembro) {
            res.status(403).json({ mensaje: 'No tienes acceso a este grupo' });
            return;
        }

        res.json({
            ...mapearGrupo(grupo),
            miembros: miembros.map(mapearMiembro)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al obtener detalle del grupo' });
    }
};

export const actualizar = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { nombre, descripcion } = req.body;
        const userId = req.user?.id;

        const grupo = await obtenerGrupoPorId(id as string);
        if (!grupo) {
            res.status(404).json({ mensaje: 'Grupo no encontrado' });
            return;
        }

        if (grupo.owner_id !== userId) {
            res.status(403).json({ mensaje: 'Solo el creador puede editar el grupo' });
            return;
        }

        await actualizarGrupo(id as string, { name: nombre, description: descripcion });
        res.json({ mensaje: 'Grupo actualizado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al actualizar grupo' });
    }
};

export const eliminar = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        const grupo = await obtenerGrupoPorId(id as string);
        if (!grupo) {
            res.status(404).json({ mensaje: 'Grupo no encontrado' });
            return;
        }

        if (grupo.owner_id !== userId) {
            res.status(403).json({ mensaje: 'Solo el creador puede eliminar el grupo' });
            return;
        }

        await eliminarGrupoLogico(id as string);
        res.json({ mensaje: 'Grupo eliminado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al eliminar grupo' });
    }
};

export const agregarMiembroController = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { usuarios } = req.body; // Solo esperamos usuarios como array
        const userId = req.user?.id;

        if (!usuarios || !Array.isArray(usuarios) || usuarios.length === 0) {
            res.status(400).json({ mensaje: 'Lista de usuarios (usuarios) requerida' });
            return;
        }

        const grupo = await obtenerGrupoPorId(id as string);
        if (!grupo) {
            res.status(404).json({ mensaje: 'Grupo no encontrado' });
            return;
        }

        // Solo owner puede agregar? O cualquier miembro? 
        // Normalmente en grupos simples cualquier miembro o solo owner. Asumiremos Solo Owner por consistencia con proyectos.
        if (grupo.owner_id !== userId) {
            res.status(403).json({ mensaje: 'Solo el creador puede agregar miembros al grupo' });
            return;
        }

        // Lógica agregación masiva
        let agregados = 0;
        for (const uid of usuarios) {
            // Verificamos existencia o intentamos agregar. 
            // Para ser eficientes y reportar errores, podríamos verificar antes.
            // Por simplicidad en este paso, intentamos agregar.
            // Idealmente: `buscarUsuarioPorId` para cada uno.
            const usuarioExiste = await buscarUsuarioPorId(uid);
            if (usuarioExiste) {
                await agregarMiembro(id as string, uid);
                agregados++;
            }
        }

        res.json({ mensaje: `${agregados} miembros agregados al grupo` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al agregar miembro al grupo' });
    }
};

export const eliminarMiembroController = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id, userId: userToRemoveId } = req.params;
        const currentUserId = req.user?.id;

        const grupo = await obtenerGrupoPorId(id as string);
        if (!grupo) {
            res.status(404).json({ mensaje: 'Grupo no encontrado' });
            return;
        }

        // Solo owner puede eliminar
        if (grupo.owner_id !== currentUserId) {
            res.status(403).json({ mensaje: 'Solo el creador puede eliminar miembros del grupo' });
            return;
        }

        if (grupo.owner_id === userToRemoveId) {
            res.status(400).json({ mensaje: 'No se puede eliminar al creador del grupo' });
            return;
        }

        await eliminarMiembro(id as string, userToRemoveId as string);
        res.json({ mensaje: 'Miembro eliminado del grupo' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al eliminar miembro del grupo' });
    }
};
