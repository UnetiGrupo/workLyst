import { ejecutar, obtener, consulta } from '../config/db';
import { v4 as uuidv4 } from 'uuid';

export interface Task {
    id: string;
    project_id: string;
    assigned_to?: string; // ID del usuario
    title: string;
    description?: string;
    status: 'pendiente' | 'en_progreso' | 'completada' | 'vencida';
    due_date?: string;
    created_at: string;
    updated_at: string;
}

export const inicializarTablaTasks = async () => {
    const sql = `
        CREATE TABLE IF NOT EXISTS tasks (
            id TEXT PRIMARY KEY,
            project_id TEXT NOT NULL,
            assigned_to TEXT,
            title TEXT NOT NULL,
            description TEXT,
            status TEXT DEFAULT 'pendiente',
            due_date DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
            FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
        )
    `;
    await ejecutar(sql);
};

export const crearTarea = async (tarea: { project_id: string; assigned_to?: string; title: string; description?: string; due_date?: string }) => {
    const id = uuidv4();
    const sql = `
        INSERT INTO tasks (id, project_id, assigned_to, title, description, due_date)
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    await ejecutar(sql, [id, tarea.project_id, tarea.assigned_to || null, tarea.title, tarea.description || null, tarea.due_date || null]);
    return { id, ...tarea, status: 'pendiente', created_at: new Date().toISOString() };
};

export const obtenerTareasPorProyecto = async (projectId: string): Promise<any[]> => {
    // Obtenemos también el nombre del usuario asignado para facilitar el frontend
    const sql = `
        SELECT t.*, u.name as assigned_to_name
        FROM tasks t
        LEFT JOIN users u ON t.assigned_to = u.id
        WHERE t.project_id = ?
        ORDER BY t.created_at DESC
    `;
    const tareas = await consulta(sql, [projectId]);

    // Validar fechas vencidas en código
    const now = new Date();
    tareas.forEach(t => {
        if (t.due_date && t.status !== 'completada' && t.status !== 'vencida') {
            const dueDate = new Date(t.due_date);
            if (dueDate < now) {
                t.status = 'vencida';
                // Actualizar en BD asíncronamente
                actualizarTarea(t.id, { status: 'vencida' }).catch(err => console.error(`Error auto-updating task ${t.id} to vencida:`, err));
            }
        }
    });

    return tareas;
};

export const obtenerTareaPorId = async (id: string): Promise<Task | undefined> => {
    const sql = `SELECT * FROM tasks WHERE id = ?`;
    const tarea = await obtener(sql, [id]) as any;

    if (tarea && tarea.due_date && tarea.status !== 'completada' && tarea.status !== 'vencida') {
        const now = new Date();
        const dueDate = new Date(tarea.due_date);
        if (dueDate < now) {
            tarea.status = 'vencida';
            // Actualizar en BD asíncronamente
            actualizarTarea(tarea.id, { status: 'vencida' }).catch(err => console.error(`Error auto-updating task ${tarea.id} to vencida:`, err));
        }
    }

    return tarea;
};

export const actualizarTarea = async (id: string, datos: Partial<Task>) => {
    const updates: string[] = [];
    const values: any[] = [];

    if (datos.title) {
        updates.push('title = ?');
        values.push(datos.title);
    }
    if (datos.description !== undefined) {
        updates.push('description = ?');
        values.push(datos.description);
    }
    if (datos.status) {
        updates.push('status = ?');
        values.push(datos.status);
    }
    if (datos.assigned_to !== undefined) {
        updates.push('assigned_to = ?');
        values.push(datos.assigned_to);
    }
    if (datos.due_date !== undefined) {
        updates.push('due_date = ?');
        values.push(datos.due_date);
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');

    if (updates.length > 1) {
        const sql = `UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`;
        values.push(id);
        await ejecutar(sql, values);
    }

    return await obtenerTareaPorId(id);
};

export const eliminarTarea = async (id: string) => {
    const sql = `DELETE FROM tasks WHERE id = ?`;
    await ejecutar(sql, [id]);
};
