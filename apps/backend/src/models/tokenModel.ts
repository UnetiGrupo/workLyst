import { consulta } from '../config/db';

export const bloquearToken = async (token: string, expiresAt: Date): Promise<void> => {
    const sql = `INSERT INTO token_blocklist (token, expires_at) VALUES ($1, $2) ON CONFLICT (token) DO NOTHING`;
    await consulta(sql, [token, expiresAt]);
};

export const estaTokenBloqueado = async (token: string): Promise<boolean> => {
    const sql = `SELECT id FROM token_blocklist WHERE token = $1`;
    const result = await consulta(sql, [token]);
    return result.length > 0;
};
