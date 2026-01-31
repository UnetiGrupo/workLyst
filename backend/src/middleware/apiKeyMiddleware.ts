import { Request, Response, NextFunction } from 'express';
import { validarApiKey } from '../models/apiKeyModel';

export const verificarApiKey = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    console.log('DEBUG: Middleware API Key alcanzado');
    console.log('DEBUG: Headers recibidos:', JSON.stringify(req.headers));
    const rawApiKey = req.header('x-api-key');
    const apiKey = rawApiKey?.trim();

    if (!apiKey) {
        res.status(401).json({ mensaje: 'API Key (x-api-key) es obligatoria' });
        return;
    }

    try {
        const keyValida = await validarApiKey(apiKey);
        if (!keyValida) {
            res.status(403).json({ mensaje: 'API Key inválida o inactiva' });
            return;
        }

        // Si es válida, continuamos
        next();
    } catch (error) {
        console.error('Error al validar API Key:', error);
        res.status(500).json({ mensaje: 'Error interno al validar API Key' });
    }
};
