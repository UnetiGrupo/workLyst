import { ejecutar, obtener, consulta } from '../config/db';
import { v4 as uuidv4 } from 'uuid';

export interface Task {
    id: string;
    project_id: string;
    assigned_to?: string;
    title: string;
    description?: string;
    estado?: string;
    status_id: number;
    status_name?: string;
    status_color?: string;
    due_date?: string;
    created_at: string;
    updated_at: string;
}

export const inicializarTablaTasks = async () => {
    const sql = `
        CREATE TABLE IF NOT EXISTS tasks (
            id VARCHAR(36) PRIMARY KEY,
            project_id VARCHAR(36) NOT NULL,
            assigned_to VARCHAR(36),
            title VARCHAR(255) NOT NULL,
            description TEXT,
            status VARCHAR(20) DEFAULT 'pendiente',
            due_date TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
            FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
        )
    `;
    await ejecutar(sql);
};

export const crearTarea = async (tarea: { project_id: string; assigned_to?: string; title: string; description?: string; due_date?: string }) => {
    const id = uuidv4();

    // Obtener ID del estatus por defecto 'pending'
    const statusResult = await consulta(`SELECT id FROM task_statuses WHERE key = 'pending'`);
    const defaultStatusId = statusResult.length > 0 ? statusResult[0].id : null;

    if (!defaultStatusId) throw new Error('Error de configuración: Estatus "pending" no encontrado');

    const sql = `
        INSERT INTO tasks (id, project_id, assigned_to, title, description, due_date, status_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;
    await ejecutar(sql, [id, tarea.project_id, tarea.assigned_to || null, tarea.title, tarea.description || null, tarea.due_date || null, defaultStatusId]);
    return { id, ...tarea, status_id: defaultStatusId, created_at: new Date().toISOString() };
};

export const obtenerTareasPorProyecto = async (projectId: string): Promise<any[]> => {
    // Obtenemos también el nombre del usuario asignado y el detalle del estatus
    const sql = `
        SELECT t.*, u.name as assigned_to_name, s.name as status_name, s.color as status_color, s.key as status_key
        FROM tasks t
        LEFT JOIN users u ON t.assigned_to = u.id
        LEFT JOIN task_statuses s ON t.status_id = s.id
        WHERE t.project_id = $1
        ORDER BY t.created_at DESC
    `;
    const tareas = await consulta(sql, [projectId]);

    // Validar fechas vencidas en código
    const now = new Date();

    // Obtener ID de 'completed' y 'overdue' para comparaciones
    const sysStatuses = await consulta(`SELECT id, key FROM task_statuses WHERE key IN ('completed', 'overdue')`);
    const completedId = sysStatuses.find((s: any) => s.key === 'completed')?.id;
    const overdueId = sysStatuses.find((s: any) => s.key === 'overdue')?.id;

    if (overdueId && completedId) {
        tareas.forEach(t => {
            if (t.due_date && t.status_id !== completedId && t.status_id !== overdueId) {
                const dueDate = new Date(t.due_date);
                if (dueDate < now) {
                    t.status_id = overdueId;
                    t.status_name = 'Vencida'; // Update local view
                    // Actualizar en BD asíncronamente
                    actualizarTarea(t.id, { status_id: overdueId }).catch(err => console.error(`Error auto-updating task ${t.id} to vencida:`, err));
                }
            }
        });
    }

    return tareas;
};

export const obtenerTareaPorId = async (id: string): Promise<Task | undefined> => {
    const sql = `
        SELECT t.*, s.name as status_name, s.color as status_color, s.key as status_key
        FROM tasks t
        LEFT JOIN task_statuses s ON t.status_id = s.id
        WHERE t.id = $1
    `;
    const tarea = await obtener(sql, [id]) as any;

    if (tarea && tarea.due_date) {
        // Obtener IDs dinámicos
        const sysStatuses = await consulta(`SELECT id, key FROM task_statuses WHERE key IN ('completed', 'overdue')`);
        const completedId = sysStatuses.find((s: any) => s.key === 'completed')?.id;
        const overdueId = sysStatuses.find((s: any) => s.key === 'overdue')?.id;

        if (completedId && overdueId && tarea.status_id !== completedId && tarea.status_id !== overdueId) {
            const now = new Date();
            const dueDate = new Date(tarea.due_date);
            if (dueDate < now) {
                tarea.status_id = overdueId;
                tarea.status_name = 'Vencida';
                // Actualizar en BD asíncronamente
                actualizarTarea(tarea.id, { status_id: overdueId }).catch(err => console.error(`Error auto-updating task ${tarea.id} to vencida:`, err));
            }
        }
    }

    return tarea;
};

export const actualizarTarea = async (id: string, datos: Partial<Task>) => {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (datos.title) {
        updates.push(`title = $${paramIndex++}`);
        values.push(datos.title);
    }

    if (datos.estado) {
        updates.push(`status = $${paramIndex++}`);
        values.push(datos.estado)
    }

    if (datos.description !== undefined) {
        updates.push(`description = $${paramIndex++}`);
        values.push(datos.description);
    }
    if (datos.status_id) {
        updates.push(`status_id = $${paramIndex++}`);
        values.push(datos.status_id);
    }
    if (datos.assigned_to !== undefined) {
        updates.push(`assigned_to = $${paramIndex++}`);
        values.push(datos.assigned_to);
    }
    if (datos.due_date !== undefined) {
        updates.push(`due_date = $${paramIndex++}`);
        values.push(datos.due_date);
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');

    if (updates.length > 1) {
        const sql = `UPDATE tasks SET ${updates.filter(u => !u.includes('updated_at')).join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramIndex}`;
        values.push(id);
        await ejecutar(sql, values);
    }

    return await obtenerTareaPorId(id);
};

export const eliminarTarea = async (id: string) => {
    const sql = `DELETE FROM tasks WHERE id = $1`;
    await ejecutar(sql, [id]);
};

export const contarTareasPorProyecto = async (projectId: string): Promise<{ total: number; completed: number }> => {
    // Obtener ID del estado 'completed'
    const statusResult = await consulta(`SELECT id FROM task_statuses WHERE key = 'completed'`);
    const completedId = statusResult.length > 0 ? statusResult[0].id : null;

    const sqlTotal = `SELECT COUNT(*) as total FROM tasks WHERE project_id = $1`;
    const totalResult = await consulta(sqlTotal, [projectId]);
    const total = parseInt(totalResult[0]?.total || '0', 10);

    let completed = 0;
    if (completedId) {
        const sqlCompleted = `SELECT COUNT(*) as completed FROM tasks WHERE project_id = $1 AND status_id = $2`;
        const completedResult = await consulta(sqlCompleted, [projectId, completedId]);
        completed = parseInt(completedResult[0]?.completed || '0', 10);
    }

    return { total, completed };
};
