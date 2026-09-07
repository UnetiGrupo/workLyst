import { consulta, ejecutar } from '../config/db';

export interface TaskStatus {
    id: number;
    name: string;
    key: string;
    color: string;
    is_system: boolean;
}

export const obtenerTodosLosEstatus = async (): Promise<TaskStatus[]> => {
    const sql = `SELECT * FROM task_statuses ORDER BY id ASC`;
    const result = await consulta(sql);
    return result as TaskStatus[];
};

export const crearEstatus = async (nombre: string, color: string): Promise<TaskStatus> => {
    // Generar key simple basada en el nombre (slugify básico)
    const key = nombre.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');

    const sql = `INSERT INTO task_statuses (name, key, color) VALUES ($1, $2, $3) RETURNING *`;
    const result = await consulta(sql, [nombre, key, color || '#808080']);
    return result[0];
};

export const actualizarEstatus = async (id: number, nombre?: string, color?: string): Promise<TaskStatus | null> => {
    // No permitir cambiar la KEY ni is_system para mantener integridad
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (nombre) {
        updates.push(`name = $${paramIndex++}`);
        values.push(nombre);
    }
    if (color) {
        updates.push(`color = $${paramIndex++}`);
        values.push(color);
    }

    if (updates.length === 0) return null;

    values.push(id);
    const sql = `UPDATE task_statuses SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    const result = await consulta(sql, values);
    return result.length > 0 ? result[0] : null;
};

export const eliminarEstatus = async (id: number): Promise<boolean> => {
    // Verificar si es de sistema
    const checkSql = `SELECT is_system FROM task_statuses WHERE id = $1`;
    const checkResult = await consulta(checkSql, [id]);

    if (checkResult.length === 0) return false; // No existe
    if (checkResult[0].is_system) {
        throw new Error('No se pueden eliminar estatus del sistema');
    }

    // Verificar si está en uso
    const usageSql = `SELECT COUNT(*) as count FROM tasks WHERE status_id = $1`;
    const usageResult = await consulta(usageSql, [id]);
    if (parseInt(usageResult[0].count) > 0) {
        throw new Error('No se puede eliminar un estatus que está siendo usado en tareas');
    }

    const deleteSql = `DELETE FROM task_statuses WHERE id = $1`;
    await ejecutar(deleteSql, [id]);
    return true;
};

export const obtenerEstatusPorKey = async (key: string): Promise<TaskStatus | null> => {
    const sql = `SELECT * FROM task_statuses WHERE key = $1`;
    const result = await consulta(sql, [key]);
    return result.length > 0 ? result[0] : null;
};

export const resolverStatusId = async (valor: string | number): Promise<number | null> => {
    if (typeof valor === 'number') return valor;
    if (!valor) return null;

    // Si es un número en string
    if (!isNaN(Number(valor))) return Number(valor);

    // Buscar por key o nombre
    const sql = `SELECT id FROM task_statuses WHERE key = $1 OR name = $1`;
    const result = await consulta(sql, [valor]);
    return result.length > 0 ? result[0].id : null;
};
