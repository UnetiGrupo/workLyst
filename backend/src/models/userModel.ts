import { ejecutar, obtener, consulta } from '../config/db';
import { v4 as uuidv4 } from 'uuid';

export interface Usuario {
    id: string;
    usuario: string;
    email: string;
    password?: string;
    created_at?: string;
}

export const inicializarTablaUsuarios = async () => {
    const sql = `
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `;
    await ejecutar(sql);
};

export const inicializarTablaRefreshTokens = async () => {
    const sql = `
        CREATE TABLE IF NOT EXISTS refresh_tokens (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            token TEXT UNIQUE NOT NULL,
            expires_at DATETIME NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `;
    await ejecutar(sql);
};

export const guardarRefreshToken = async (idUsuario: string, token: string, expiraEn: Date) => {
    const id = uuidv4();
    const sql = `
        INSERT INTO refresh_tokens (id, user_id, token, expires_at)
        VALUES (?, ?, ?, ?)
    `;
    await ejecutar(sql, [id, idUsuario, token, expiraEn.toISOString()]);
    return { id, idUsuario, token, expiraEn };
};

export const buscarRefreshToken = async (token: string) => {
    const sql = `
        SELECT * FROM refresh_tokens 
        WHERE token = ? AND expires_at > datetime('now')
    `;
    return await obtener(sql, [token]);
};

export const eliminarRefreshToken = async (token: string) => {
    const sql = `DELETE FROM refresh_tokens WHERE token = ?`;
    await ejecutar(sql, [token]);
};

export const eliminarRefreshTokensUsuario = async (idUsuario: string) => {
    const sql = `DELETE FROM refresh_tokens WHERE user_id = ?`;
    await ejecutar(sql, [idUsuario]);
};

export const crearUsuario = async (usuario: Omit<Usuario, 'id' | 'created_at'>) => {
    const id = uuidv4();
    const sql = `
        INSERT INTO users (id, name, email, password)
        VALUES (?, ?, ?, ?)
    `;
    await ejecutar(sql, [id, usuario.usuario, usuario.email, usuario.password]);
    return { id, nombre: usuario.usuario, email: usuario.email };
};

export const buscarUsuarioPorEmail = async (email: string): Promise<Usuario | undefined> => {
    const sql = `SELECT * FROM users WHERE email = ?`;
    const resultado = await obtener(sql, [email]) as any;
    if (!resultado) return undefined;

    return {
        id: resultado.id,
        usuario: resultado.name,
        email: resultado.email,
        password: resultado.password,
        created_at: resultado.created_at
    };
};

export const buscarUsuarioPorId = async (id: string): Promise<Usuario | undefined> => {
    const sql = `SELECT * FROM users WHERE id = ?`;
    const resultado = await obtener(sql, [id]) as any;
    if (!resultado) return undefined;

    return {
        id: resultado.id,
        usuario: resultado.name,
        email: resultado.email,
        created_at: resultado.created_at
    };
};

export const obtenerTodosLosUsuarios = async (): Promise<Usuario[]> => {
    const sql = `SELECT id, name, email, created_at FROM users`;
    const resultados = await consulta(sql) as any[];
    return resultados.map(r => ({
        id: r.id,
        usuario: r.name,
        email: r.email,
        created_at: r.created_at
    }));
};

export const buscarUsuarios = async (filtros: { nombre?: string, email?: string }): Promise<Usuario[]> => {
    const condiciones: string[] = [];
    const params: any[] = [];

    if (filtros.email) {
        condiciones.push(`email = ?`);
        params.push(filtros.email);
    }

    if (filtros.nombre) {
        const palabras = filtros.nombre.trim().split(/\s+/);
        if (palabras.length > 0) {
            palabras.forEach(p => {
                condiciones.push(`name LIKE ?`);
                params.push(`%${p}%`);
            });
        }
    }

    if (condiciones.length === 0) return [];

    const sql = `SELECT id, name, email, created_at FROM users WHERE ${condiciones.join(' AND ')}`;
    const resultados = await consulta(sql, params) as any[];

    return resultados.map(r => ({
        id: r.id,
        usuario: r.name,
        email: r.email,
        created_at: r.created_at
    }));
};

export const actualizarUsuario = async (id: string, datos: Partial<Omit<Usuario, 'id' | 'password' | 'created_at'>>) => {
    const campos: string[] = [];
    const valores: any[] = [];

    if (datos.usuario) {
        campos.push('name = ?');
        valores.push(datos.usuario);
    }
    if (datos.email) {
        campos.push('email = ?');
        valores.push(datos.email);
    }

    if (campos.length === 0) return;

    valores.push(id);
    const sql = `UPDATE users SET ${campos.join(', ')} WHERE id = ?`;
    await ejecutar(sql, valores);
};
