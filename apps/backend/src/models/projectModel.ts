import { ejecutar, obtener, consulta } from '../config/db';
import { v4 as uuidv4 } from 'uuid';

export interface Project {
    id: string;
    name: string;
    description?: string;
    owner_id: string;
    status: 'active' | 'finished';
    created_at: string;
}

export interface ProjectMember {
    project_id: string;
    user_id: string;
    role: string; // El nombre del rol devuelto por la query
    joined_at: string;
}

// Crear Proyecto
export const crearProyecto = async (proyecto: { name: string; description?: string; owner_id: string }, ownerRoleId: number) => {
    const id = uuidv4();
    const sql = `
        INSERT INTO projects (id, name, description, owner_id)
        VALUES ($1, $2, $3, $4)
    `;
    await ejecutar(sql, [id, proyecto.name, proyecto.description, proyecto.owner_id]);

    // Agregar al owner como miembro automáticamente
    await agregarMiembro(id, proyecto.owner_id, ownerRoleId);

    return { id, ...proyecto, status: 'active' };
};

// Obtener Proyecto por ID
export const obtenerProyectoPorId = async (id: string): Promise<Project | undefined> => {
    const sql = `
        SELECT p.*, u.name as owner_name
        FROM projects p
        JOIN users u ON p.owner_id = u.id
        WHERE p.id = $1
    `;
    return await obtener(sql, [id]) as any;
};

// Obtener Proyectos de un Usuario (incluye donde es owner y donde es miembro)
export const obtenerProyectosUsuario = async (userId: string): Promise<any[]> => {
    const sql = `
        SELECT p.*, r.name as role, u.name as owner_name
        FROM projects p
        JOIN project_members pm ON p.id = pm.project_id
        JOIN roles r ON pm.role_id = r.id
        JOIN users u ON p.owner_id = u.id
        WHERE pm.user_id = $1
        ORDER BY p.updated_at DESC
    `;
    return await consulta(sql, [userId]);
};

// Actualizar Proyecto
export const actualizarProyecto = async (id: string, datos: Partial<Project>) => {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (datos.name) {
        updates.push(`name = $${paramIndex++}`);
        values.push(datos.name);
    }
    if (datos.description !== undefined) {
        updates.push(`description = $${paramIndex++}`);
        values.push(datos.description);
    }
    if (datos.status) {
        updates.push(`status = $${paramIndex++}`);
        values.push(datos.status);
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');

    if (updates.length > 1) {
        const sql = `UPDATE projects SET ${updates.filter(u => !u.includes('updated_at')).join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramIndex}`;
        values.push(id);
        await ejecutar(sql, values);
    }
};

// Eliminar Proyecto
export const eliminarProyecto = async (id: string) => {
    const sql = `DELETE FROM projects WHERE id = $1`;
    await ejecutar(sql, [id]);
};

// Agregar Miembro
export const agregarMiembro = async (projectId: string, userId: string, roleId: number) => {
    // Verificar si ya existe
    const checkSql = `SELECT * FROM project_members WHERE project_id = $1 AND user_id = $2`;
    const existing = await obtener(checkSql, [projectId, userId]);
    if (existing) return;

    const sql = `
        INSERT INTO project_members (project_id, user_id, role_id)
        VALUES ($1, $2, $3)
    `;
    await ejecutar(sql, [projectId, userId, roleId]);
};

// Eliminar Miembro
export const eliminarMiembro = async (projectId: string, userId: string) => {
    const sql = `DELETE FROM project_members WHERE project_id = $1 AND user_id = $2`;
    await ejecutar(sql, [projectId, userId]);
};

// Obtener Miembros de un Proyecto
export const obtenerMiembrosProyecto = async (projectId: string) => {
    const sql = `
        SELECT u.id, u.name, u.email, r.name as role, pm.joined_at
        FROM project_members pm
        JOIN users u ON pm.user_id = u.id
        JOIN roles r ON pm.role_id = r.id
        WHERE pm.project_id = $1
    `;
    return await consulta(sql, [projectId]);
};
