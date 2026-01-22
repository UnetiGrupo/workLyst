import { consulta, obtener } from '../config/db';

export interface Role {
    id: number;
    name: string;
}

// Obtener todos los roles
export const obtenerTodosLosRoles = async (): Promise<Role[]> => {
    const sql = `SELECT * FROM roles`;
    return await consulta(sql);
};

// Buscar rol por nombre
export const buscarRolPorNombre = async (name: string): Promise<Role | undefined> => {
    const sql = `SELECT * FROM roles WHERE name = ?`;
    return await obtener(sql, [name]) as any;
};
