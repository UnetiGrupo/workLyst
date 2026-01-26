import { ejecutar, obtener, consulta } from '../config/db';
import { v4 as uuidv4 } from 'uuid';

export interface Task {
    id: string;
    project_id: string;
    assigned_to?: string; // ID del usuario
    title: string;
    description?: string;
    status: 'pending' | 'in_progress' | 'completed';
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
            status TEXT DEFAULT 'pending',
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
    return { id, ...tarea, status: 'pending', created_at: new Date().toISOString() };
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
    return await consulta(sql, [projectId]);
};

export const obtenerTareaPorId = async (id: string): Promise<Task | undefined> => {
    const sql = `SELECT * FROM tasks WHERE id = ?`;
    return await obtener(sql, [id]) as any;
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
