import { ejecutar, obtener, consulta } from '../config/db';
import { v4 as uuidv4 } from 'uuid';

export interface Group {
    id: string;
    name: string;
    description?: string;
    owner_id: string;
    status_id: number;
    created_at: string;
    updated_at: string;
    // Campos adicionales para joins
    owner_name?: string;
    status_name?: string;
}

export interface GroupMember {
    group_id: string;
    user_id: string; // ID del usuario
    joined_at: string;
    // Campos adicionales
    user_name?: string;
    user_email?: string;
}

// Helper para obtener ID de estatus
const obtenerIdEstatus = async (nombre: string): Promise<number | undefined> => {
    const sql = `SELECT id FROM group_statuses WHERE name = ?`;
    const res = await obtener(sql, [nombre]) as any;
    return res ? res.id : undefined;
};

export const crearGrupo = async (grupo: { name: string; description?: string; owner_id: string; members?: string[] }) => {
    const id = uuidv4();
    const statusId = await obtenerIdEstatus('activo');

    if (!statusId) throw new Error('Estatus activo no configurado');

    const sql = `
        INSERT INTO groups (id, name, description, owner_id, status_id)
        VALUES (?, ?, ?, ?, ?)
    `;
    await ejecutar(sql, [id, grupo.name, grupo.description, grupo.owner_id, statusId]);

    // Agregar owner como miembro
    await agregarMiembro(id, grupo.owner_id);

    // Agregar miembros iniciales si existen
    if (grupo.members && grupo.members.length > 0) {
        for (const memberId of grupo.members) {
            // Evitar duplicar owner o errores si el ID no es válido (podríamos validar antes)
            if (memberId !== grupo.owner_id) {
                // Check simple de existencia de usuario para no romper FK? 
                // La función agregarMiembro verifica existencia en 'group_members', pero no si el usuario existe en 'users'.
                // Si el usuario no existe, SQLite lanzará error de FK. Lo capturamos o dejamos que falle?
                // Mejor intentar agregar y capturar error silencioso para no detener el proceso completo, o dejar que falle para atomicidad?
                // Por simplicidad del requerimiento "agregar", intentaremos.
                try {
                    await agregarMiembro(id, memberId);
                } catch (error) {
                    console.error(`Error agregando miembro inicial ${memberId}:`, error);
                }
            }
        }
    }

    // Retornamos objeto construido
    return {
        id,
        ...grupo,
        status_id: statusId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };
};

export const obtenerGrupoPorId = async (id: string): Promise<Group | undefined> => {
    // Solo devolvemos si está activo (o manejado en controlador, pero join con status nos da el nombre)
    const sql = `
        SELECT g.*, u.name as owner_name, s.name as status_name
        FROM groups g
        JOIN users u ON g.owner_id = u.id
        JOIN group_statuses s ON g.status_id = s.id
        WHERE g.id = ? AND s.name = 'activo'
    `;
    return await obtener(sql, [id]) as any;
};

export const obtenerGruposUsuario = async (userId: string): Promise<any[]> => {
    // Grupos donde el usuario es miembro (incluye owner porque también es miembro)
    // Solo grupos activos
    const sql = `
        SELECT g.*, u.name as owner_name, s.name as status_name
        FROM groups g
        JOIN group_members gm ON g.id = gm.project_id
        JOIN users u ON g.owner_id = u.id
        JOIN group_statuses s ON g.status_id = s.id
        WHERE gm.user_id = ? AND s.name = 'activo'
        ORDER BY g.updated_at DESC
    `;
    // CORRECCION: en group_members la columna es group_id no project_id, copié mal query mental
    const sqlCorrecto = `
        SELECT g.*, u.name as owner_name, s.name as status_name
        FROM groups g
        JOIN group_members gm ON g.id = gm.group_id
        JOIN users u ON g.owner_id = u.id
        JOIN group_statuses s ON g.status_id = s.id
        WHERE gm.user_id = ? AND s.name = 'activo'
        ORDER BY g.updated_at DESC
    `;
    return await consulta(sqlCorrecto, [userId]);
};

export const actualizarGrupo = async (id: string, datos: { name?: string; description?: string }) => {
    const updates: string[] = [];
    const values: any[] = [];

    if (datos.name) {
        updates.push('name = ?');
        values.push(datos.name);
    }
    if (datos.description !== undefined) {
        updates.push('description = ?');
        values.push(datos.description);
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');

    if (updates.length > 1) {
        const sql = `UPDATE groups SET ${updates.join(', ')} WHERE id = ?`;
        values.push(id);
        await ejecutar(sql, values);
    }
};

export const eliminarGrupoLogico = async (id: string) => {
    const statusId = await obtenerIdEstatus('eliminado');
    if (!statusId) throw new Error('Estatus eliminado no configurado');

    const sql = `UPDATE groups SET status_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    await ejecutar(sql, [statusId, id]);
};

// Miembros
export const agregarMiembro = async (groupId: string, userId: string) => {
    // Verificar existencia
    const checkSql = `SELECT * FROM group_members WHERE group_id = ? AND user_id = ?`;
    const existing = await obtener(checkSql, [groupId, userId]);
    if (existing) return;

    const sql = `INSERT INTO group_members (group_id, user_id) VALUES (?, ?)`;
    await ejecutar(sql, [groupId, userId]);
};

export const eliminarMiembro = async (groupId: string, userId: string) => {
    const sql = `DELETE FROM group_members WHERE group_id = ? AND user_id = ?`;
    await ejecutar(sql, [groupId, userId]);
};

export const obtenerMiembrosGrupo = async (groupId: string) => {
    const sql = `
        SELECT u.id, u.name, u.email, gm.joined_at
        FROM group_members gm
        JOIN users u ON gm.user_id = u.id
        WHERE gm.group_id = ?
    `;
    return await consulta(sql, [groupId]);
};
