import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import obtenerConfig from '../config/configLoader';
import { buscarUsuarioPorEmail } from '../models/userModel';
import { estaTokenBloqueado } from '../models/tokenModel';

const config = obtenerConfig();

export interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
    };
}

export const verificarToken = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        res.status(401).json({ mensaje: 'Token de acceso no proporcionado' });
        return;
    }

    // Verificar si el token está en la blocklist
    try {
        if (await estaTokenBloqueado(token)) {
            res.status(401).json({ mensaje: 'Sesión cerrada o token revocado' });
            return;
        }
    } catch (error) {
        console.error('Error al verificar token en blocklist:', error);
    }

    // Verificar Token de Sistema
    if (token === config.system.token) {
        try {
            const botUser = await buscarUsuarioPorEmail('ia_bot@system.local');
            if (botUser) {
                req.user = { id: botUser.id, email: botUser.email };
                next();
                return;
            }
        } catch (error) {
            console.error('Error autenticando token de sistema:', error);
        }
    }

    try {
        const decoded = jwt.verify(token, config.jwt.accessTokenSecret) as { id: string; email: string };
        req.user = decoded;
        next();
    } catch (error) {
        res.status(403).json({ mensaje: 'Token inválido o expirado' });
    }
};
