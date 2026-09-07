import { consulta } from '../config/db';

export const validarApiKey = async (apiKey: string): Promise<any | null> => {
    const sql = `SELECT * FROM api_keys WHERE api_key = $1 AND status = 'active'`;
    const result = await consulta(sql, [apiKey]);
    return result.length > 0 ? result[0] : null;
};
