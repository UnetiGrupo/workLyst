import { Request, Response } from 'express';
import { crearTarea, obtenerTareasPorProyecto, actualizarTarea, eliminarTarea, obtenerTareaPorId } from '../models/taskModel';
import { resolverStatusId } from '../models/taskStatusModel';
import { obtenerMiembrosProyecto } from '../models/projectModel';
import { AuthRequest } from '../middleware/authMiddleware';

// Helper para verificar membresía
const verificarMembresia = async (projectId: string, userId: string): Promise<boolean> => {
    const miembros = await obtenerMiembrosProyecto(projectId);
    return miembros.some((m: any) => m.id === userId);
};

export const crear = async (req: AuthRequest, res: Response): Promise<void> => {
    const projectId = req.params.projectId as string;
    const { titulo, descripcion, asignado_a, fecha_limite } = req.body;
    const userId = req.user?.id;

    if (!titulo) {
        res.status(400).json({ mensaje: 'El título de la tarea es obligatorio' });
        return;
    }

    if (fecha_limite) {
        const fecha = new Date(fecha_limite);
        const hoy = new Date();
        if (fecha < hoy) {
            res.status(400).json({ mensaje: 'La fecha límite no puede ser anterior a la fecha actual' });
            return;
        }
    }

    try {
        if (!userId || !(await verificarMembresia(projectId, userId))) {
            res.status(403).json({ mensaje: 'No tienes permiso para crear tareas en este proyecto' });
            return;
        }

        // Validar que el usuario asignado sea miembro del proyecto
        if (asignado_a && !(await verificarMembresia(projectId, asignado_a))) {
            res.status(400).json({ mensaje: 'El usuario asignado no es miembro del proyecto' });
            return;
        }

        const nuevaTarea = await crearTarea({
            project_id: projectId,
            title: titulo,
            description: descripcion,
            assigned_to: asignado_a,
            due_date: fecha_limite
        });

        res.status(201).json({
            mensaje: 'Tarea creada exitosamente',
            tarea: {
                id: nuevaTarea.id,
                proyecto_id: nuevaTarea.project_id,
                titulo: nuevaTarea.title,
                descripcion: nuevaTarea.description,
                estado: 'Pendiente', // Default
                id_estado: nuevaTarea.status_id,
                asignado_a: nuevaTarea.assigned_to,
                fecha_limite: nuevaTarea.due_date,
                creado_en: nuevaTarea.created_at
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al crear la tarea' });
    }
};

export const listarPorProyecto = async (req: AuthRequest, res: Response): Promise<void> => {
    const projectId = req.params.projectId as string;
    const userId = req.user?.id;

    try {
        if (!userId || !(await verificarMembresia(projectId, userId))) {
            res.status(403).json({ mensaje: 'No tienes permiso para ver tareas de este proyecto' });
            return;
        }

        const tareas = await obtenerTareasPorProyecto(projectId);
        const tareasEspanol = tareas.map((t: any) => ({
            id: t.id,
            proyecto_id: t.project_id,
            titulo: t.title,
            descripcion: t.description,
            estado: t.status_name,
            id_estado: t.status_id,
            color_estado: t.status_color,
            asignado_a: t.assigned_to,
            asignado_a_nombre: t.assigned_to_name,
            fecha_limite: t.due_date,
            creado_en: t.created_at
        }));

        res.json(tareasEspanol);
    } catch (error: any) {
        console.error('Error en listarPorProyecto:', error);
        res.status(500).json({ mensaje: 'Error al obtener tareas', error: error.message });
    }
}

export const obtenerDetalle = async (req: AuthRequest, res: Response): Promise<void> => {
    const id = req.params.id as string;
    const userId = req.user?.id;

    try {
        const tarea = await obtenerTareaPorId(id);
        if (!tarea) {
            res.status(404).json({ mensaje: 'Tarea no encontrada' });
            return;
        }

        // Verificar acceso al proyecto de la tarea
        if (!userId || !(await verificarMembresia(tarea.project_id, userId))) {
            res.status(403).json({ mensaje: 'No tienes acceso a esta tarea' });
            return;
        }

        res.json({
            id: tarea.id,
            proyecto_id: tarea.project_id,
            titulo: tarea.title,
            descripcion: tarea.description,
            estado: tarea.status_name,
            id_estado: tarea.status_id,
            asignado_a: tarea.assigned_to,
            fecha_limite: tarea.due_date,
            creado_en: tarea.created_at
        });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener tarea' });
    }
};

export const actualizar = async (req: AuthRequest, res: Response): Promise<void> => {
    const id = req.params.id as string;
    const { titulo, descripcion, estado, asignado_a, fecha_limite } = req.body;
    const userId = req.user?.id;

    try {
        const tarea = await obtenerTareaPorId(id);
        if (!tarea) {
            res.status(404).json({ mensaje: 'Tarea no encontrada' });
            return;
        }

        if (!userId || !(await verificarMembresia(tarea.project_id, userId))) {
            res.status(403).json({ mensaje: 'No tienes permiso para modificar esta tarea' });
            return;
        }

        // Validar que el usuario asignado sea miembro del proyecto
        if (asignado_a && !(await verificarMembresia(tarea.project_id, asignado_a))) {
            res.status(400).json({ mensaje: 'El usuario asignado no es miembro del proyecto' });
            return;
        }

        const datosActualizados: any = {};
        if (titulo) datosActualizados.title = titulo;
        if (descripcion !== undefined) datosActualizados.description = descripcion;
        if (estado) {
            const statusId = await resolverStatusId(estado);
            if (statusId) {
                datosActualizados.status_id = statusId;
            } else {
                res.status(400).json({ mensaje: 'Estatus no válido' });
                return;
            }
        }
        if (asignado_a !== undefined) datosActualizados.assigned_to = asignado_a;
        if (fecha_limite !== undefined) datosActualizados.due_date = fecha_limite;

        const tareaActualizada = await actualizarTarea(id, datosActualizados);

        if (!tareaActualizada) {
            res.status(404).json({ mensaje: 'Error al recuperar tarea actualizada' });
            return;
        }

        res.json({
            mensaje: 'Tarea actualizada',
            tarea: {
                id: tareaActualizada.id,
                proyecto_id: tareaActualizada.project_id,
                titulo: tareaActualizada.title,
                descripcion: tareaActualizada.description,
                estado: tareaActualizada.status_name,
                id_estado: tareaActualizada.status_id,
                asignado_a: tareaActualizada.assigned_to,
                fecha_limite: tareaActualizada.due_date,
                creado_en: tareaActualizada.created_at
            }
        });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al actualizar tarea' });
    }
};

export const eliminar = async (req: AuthRequest, res: Response): Promise<void> => {
    const id = req.params.id as string;
    const userId = req.user?.id;

    try {
        const tarea = await obtenerTareaPorId(id);
        if (!tarea) {
            res.status(404).json({ mensaje: 'Tarea no encontrada' });
            return;
        }

        if (!userId || !(await verificarMembresia(tarea.project_id, userId))) {
            res.status(403).json({ mensaje: 'No tienes permiso para eliminar esta tarea' });
            return;
        }

        await eliminarTarea(id);
        res.json({ mensaje: 'Tarea eliminada exitosamente' });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al eliminar tarea' });
    }
};

export const asignar = async (req: AuthRequest, res: Response): Promise<void> => {
    const id = req.params.id as string;
    const { asignado_a } = req.body;
    const userId = req.user?.id;

    if (!asignado_a) {
        res.status(400).json({ mensaje: 'El ID del usuario a asignar es obligatorio' });
        return;
    }

    try {
        const tarea = await obtenerTareaPorId(id);
        if (!tarea) {
            res.status(404).json({ mensaje: 'Tarea no encontrada' });
            return;
        }

        if (!userId || !(await verificarMembresia(tarea.project_id, userId))) {
            res.status(403).json({ mensaje: 'No tienes permiso para asignar esta tarea' });
            return;
        }

        // Validar que el usuario asignado sea miembro del proyecto
        if (!(await verificarMembresia(tarea.project_id, asignado_a))) {
            res.status(400).json({ mensaje: 'El usuario asignado no es miembro del proyecto' });
            return;
        }

        const tareaActualizada = await actualizarTarea(id, { assigned_to: asignado_a });

        if (!tareaActualizada) {
            res.status(404).json({ mensaje: 'Error al recuperar tarea actualizada' });
            return;
        }

        res.json({
            mensaje: 'Tarea asignada exitosamente',
            tarea: {
                id: tareaActualizada.id,
                proyecto_id: tareaActualizada.project_id,
                titulo: tareaActualizada.title,
                descripcion: tareaActualizada.description,
                estado: tareaActualizada.status_name,
                id_estado: tareaActualizada.status_id,
                asignado_a: tareaActualizada.assigned_to,
                fecha_limite: tareaActualizada.due_date,
                creado_en: tareaActualizada.created_at
            }
        });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al asignar tarea' });
    }
};
