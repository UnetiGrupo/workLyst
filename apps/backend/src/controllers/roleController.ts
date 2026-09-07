import { Request, Response } from 'express';
import { obtenerTodosLosRoles } from '../models/roleModel';

export const listarRoles = async (_req: Request, res: Response): Promise<void> => {
    try {
        const roles = await obtenerTodosLosRoles();
        res.json(roles);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener roles' });
    }
};
