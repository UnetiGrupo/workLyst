import { Request, Response } from 'express';
import {
    crearProyecto,
    obtenerProyectosUsuario,
    obtenerProyectoPorId,
    actualizarProyecto,
    eliminarProyecto,
    agregarMiembro,
    eliminarMiembro,
    obtenerMiembrosProyecto
} from '../models/projectModel';
import { contarTareasPorProyecto } from '../models/taskModel';
import { buscarUsuarioPorId } from '../models/userModel';
import { buscarRolPorNombre } from '../models/roleModel';
import { AuthRequest } from '../middleware/authMiddleware';

// Helper para mapear respuesta a español
const mapearProyecto = (p: any) => ({
    id: p.id,
    nombre: p.name,
    descripcion: p.description,
    creadorId: p.owner_name || p.owner_id,
    estado: p.status,
    creadoEn: p.created_at,
    actualizadoEn: p.updated_at,
    ...(p.role && { rol: p.role })
});

const mapearMiembro = (m: any) => ({
    id: m.id,
    nombre: m.name,
    email: m.email,
    rol: m.role,
    fechaUnion: m.joined_at
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
            res.status(400).json({ mensaje: 'El nombre del proyecto es obligatorio' });
            return;
        }

        // Obtener ID del rol "owner" dinámicamente
        const rolOwner = await buscarRolPorNombre('owner');
        if (!rolOwner) {
            res.status(500).json({ mensaje: 'Error del sistema: Rol owner no configurado' });
            return;
        }

        const proyecto = await crearProyecto({
            name: nombre,
            description: descripcion,
            owner_id: userId
        }, rolOwner.id);

        // Obtener ID del rol "member" dinámicamente para usar por defecto
        const rolMember = await buscarRolPorNombre('member');
        const rolMemberId = rolMember ? rolMember.id : 0;

        if (miembros && Array.isArray(miembros)) {
            for (const memberId of miembros) {
                const usuarioExiste = await buscarUsuarioPorId(memberId);
                if (usuarioExiste && memberId !== userId && rolMemberId > 0) {
                    await agregarMiembro(proyecto.id, memberId, rolMemberId);
                }
            }
        }

        res.status(201).json({
            mensaje: 'Proyecto creado exitosamente',
            proyecto: mapearProyecto(proyecto)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al crear el proyecto' });
    }
};

export const listar = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ mensaje: 'No autorizado' });
            return;
        }

        const proyectos = await obtenerProyectosUsuario(userId);
        res.json(proyectos.map(mapearProyecto));
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener proyectos' });
    }
};

export const obtenerUno = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        const proyecto = await obtenerProyectoPorId(id as string);
        if (!proyecto) {
            res.status(404).json({ mensaje: 'Proyecto no encontrado' });
            return;
        }

        const proyectosUsuario = await obtenerProyectosUsuario(userId!);
        const tieneAcceso = proyectosUsuario.some(p => p.id === id);

        if (!tieneAcceso) {
            res.status(403).json({ mensaje: 'No tienes permiso para ver este proyecto' });
            return;
        }

        const miembros = await obtenerMiembrosProyecto(id as string);
        const tareasCount = await contarTareasPorProyecto(id as string);

        res.json({
            ...mapearProyecto(proyecto),
            miembros: miembros.map(mapearMiembro),
            totalTareas: tareasCount.total,
            tareasCompletadas: tareasCount.completed
        });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener el proyecto' });
    }
};

export const actualizar = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { nombre, descripcion } = req.body;
        const userId = req.user?.id;

        const proyecto = await obtenerProyectoPorId(id as string);
        if (!proyecto) {
            res.status(404).json({ mensaje: 'Proyecto no encontrado' });
            return;
        }

        if (proyecto.owner_id !== userId) {
            res.status(403).json({ mensaje: 'Solo el creador puede editar el proyecto' });
            return;
        }

        await actualizarProyecto(id as string, { name: nombre, description: descripcion });
        res.json({ mensaje: 'Proyecto actualizado correctamente' });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al actualizar el proyecto' });
    }
};

export const finalizar = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        const proyecto = await obtenerProyectoPorId(id as string);
        if (!proyecto) {
            res.status(404).json({ mensaje: 'Proyecto no encontrado' });
            return;
        }

        if (proyecto.owner_id !== userId) {
            res.status(403).json({ mensaje: 'Solo el creador puede finalizar el proyecto' });
            return;
        }

        await actualizarProyecto(id as string, { status: 'finished' });
        res.json({ mensaje: 'Proyecto finalizado correctamente' });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al finalizar el proyecto' });
    }
};

export const eliminar = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        const proyecto = await obtenerProyectoPorId(id as string);
        if (!proyecto) {
            res.status(404).json({ mensaje: 'Proyecto no encontrado' });
            return;
        }

        if (proyecto.owner_id !== userId) {
            res.status(403).json({ mensaje: 'Solo el creador puede eliminar el proyecto' });
            return;
        }

        await eliminarProyecto(id as string);
        res.json({ mensaje: 'Proyecto eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al eliminar el proyecto' });
    }
};

export const agregarMiembroController = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { usuarioId, rolId } = req.body;
        const currentUserId = req.user?.id;

        if (!usuarioId) {
            res.status(400).json({ mensaje: 'ID de usuario requerido (usuarioId)' });
            return;
        }

        const proyecto = await obtenerProyectoPorId(id as string);
        if (!proyecto) {
            res.status(404).json({ mensaje: 'Proyecto no encontrado' });
            return;
        }

        if (proyecto.owner_id !== currentUserId) {
            res.status(403).json({ mensaje: 'Solo el creador puede agregar miembros' });
            return;
        }

        const usuarioExiste = await buscarUsuarioPorId(usuarioId);
        if (!usuarioExiste) {
            res.status(404).json({ mensaje: 'El usuario a agregar no existe' });
            return;
        }

        let rolFinal = 0;

        if (rolId) {
            rolFinal = Number(rolId);
        } else {
            // Obtener rol member por defecto
            const rolMember = await buscarRolPorNombre('member');
            if (rolMember) rolFinal = rolMember.id;
        }

        if (rolFinal === 0) {
            res.status(500).json({ mensaje: 'Error de configuración de roles' });
            return;
        }

        await agregarMiembro(id as string, usuarioId, rolFinal);
        res.json({ mensaje: 'Miembro agregado correctamente', rolId: rolFinal });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al agregar miembro' });
    }
};

export const eliminarMiembroController = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id, userId: userToRemoveId } = req.params;
        const currentUserId = req.user?.id;

        const proyecto = await obtenerProyectoPorId(id as string);
        if (!proyecto) {
            res.status(404).json({ mensaje: 'Proyecto no encontrado' });
            return;
        }

        if (proyecto.owner_id !== currentUserId) {
            res.status(403).json({ mensaje: 'Solo el creador puede eliminar miembros' });
            return;
        }

        if (proyecto.owner_id === userToRemoveId) {
            res.status(400).json({ mensaje: 'No se puede eliminar al creador del proyecto' });
            return;
        }

        await eliminarMiembro(id as string, userToRemoveId as string);
        res.json({ mensaje: 'Miembro eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al eliminar miembro' });
    }
};
