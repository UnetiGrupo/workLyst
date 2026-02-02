import { Request, Response } from 'express';
import {
    obtenerTodosLosEstatus,
    crearEstatus,
    actualizarEstatus,
    eliminarEstatus
} from '../models/taskStatusModel';

export const listarEstatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const estatus = await obtenerTodosLosEstatus();
        res.json(estatus);
    } catch (error) {
        console.error('Error al listar estatus:', error);
        res.status(500).json({ mensaje: 'Error interno al obtener estatus' });
    }
};

export const crearNuevoEstatus = async (req: Request, res: Response): Promise<void> => {
    const { nombre, color } = req.body;

    if (!nombre) {
        res.status(400).json({ mensaje: 'El nombre del estatus es obligatorio' });
        return;
    }

    try {
        const nuevoEstatus = await crearEstatus(nombre, color);
        res.status(201).json({ mensaje: 'Estatus creado exitosamente', estatus: nuevoEstatus });
    } catch (error: any) {
        if (error.code === '23505') { // Unique violation
            res.status(400).json({ mensaje: 'Ya existe un estatus con ese nombre o clave' });
        } else {
            console.error('Error al crear estatus:', error);
            res.status(500).json({ mensaje: 'Error interno al crear estatus' });
        }
    }
};

export const modificarEstatus = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { nombre, color } = req.body;

    try {
        const estatusActualizado = await actualizarEstatus(parseInt(id as string), nombre, color);
        if (!estatusActualizado) {
            res.status(404).json({ mensaje: 'Estatus no encontrado' });
            return;
        }
        res.json({ mensaje: 'Estatus actualizado', estatus: estatusActualizado });
    } catch (error: any) {
        console.error('Error al actualizar estatus:', error);
        res.status(500).json({ mensaje: 'Error interno al actualizar estatus' });
    }
};

export const borrarEstatus = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
        const eliminado = await eliminarEstatus(parseInt(id as string));
        if (!eliminado) {
            res.status(404).json({ mensaje: 'Estatus no encontrado' });
            return;
        }
        res.json({ mensaje: 'Estatus eliminado exitosamente' });
    } catch (error: any) {
        if (error.message.includes('No se pueden eliminar')) {
            res.status(403).json({ mensaje: error.message });
        } else if (error.message.includes('siendo usado')) {
            res.status(400).json({ mensaje: error.message });
        } else {
            console.error('Error al eliminar estatus:', error);
            res.status(500).json({ mensaje: 'Error interno al eliminar estatus' });
        }
    }
};
