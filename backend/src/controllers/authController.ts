import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { crearUsuario, buscarUsuarioPorEmail } from '../models/userModel';
import { bloquearToken } from '../models/tokenModel';
import obtenerConfig from '../config/configLoader';

const config = obtenerConfig();
const SECRET_ACCESS_TOKEN = config.jwt.accessTokenSecret;
const EXPIRACION_ACCESS_TOKEN = config.jwt.accessTokenExpiry;

// Función auxiliar para calcular fecha de expiración
const obtenerFechaExpiracion = (expiracion: string): Date => {
    const coincidencia = expiracion.match(/^(\d+)([smhd])$/);
    if (!coincidencia) throw new Error('Formato de expiración inválido');

    const valor = parseInt(coincidencia[1]);
    const unidad = coincidencia[2];
    const ahora = new Date();

    switch (unidad) {
        case 's': return new Date(ahora.getTime() + valor * 1000);
        case 'm': return new Date(ahora.getTime() + valor * 60 * 1000);
        case 'h': return new Date(ahora.getTime() + valor * 60 * 60 * 1000);
        case 'd': return new Date(ahora.getTime() + valor * 24 * 60 * 60 * 1000);
        default: throw new Error('Unidad de expiración inválida');
    }
};

export const registrar = async (req: Request, res: Response): Promise<void> => {
    const { usuario, email, password } = req.body;

    if (!usuario || !email || !password) {
        res.status(400).json({ mensaje: 'Todos los campos son obligatorios' });
        return;
    }

    const usuarioExistente = await buscarUsuarioPorEmail(email);
    if (usuarioExistente) {
        res.status(400).json({ mensaje: 'El usuario ya existe' });
        return;
    }

    const passwordHasheado = await bcrypt.hash(password, 10);
    const nuevoUsuario = await crearUsuario({ usuario, email, password: passwordHasheado });

    res.status(201).json({ mensaje: 'Usuario registrado exitosamente', usuario: nuevoUsuario });
};

export const iniciarSesion = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400).json({ mensaje: 'Email y contraseña son obligatorios' });
        return;
    }

    const usuario = await buscarUsuarioPorEmail(email);
    if (!usuario || !usuario.password) {
        res.status(401).json({ mensaje: 'Credenciales inválidas' });
        return;
    }

    const coincide = await bcrypt.compare(password, usuario.password);
    if (!coincide) {
        res.status(401).json({ mensaje: 'Credenciales inválidas' });
        return;
    }

    // Generar session token (JWT)
    const tokenAcceso = jwt.sign(
        { id: usuario.id, email: usuario.email },
        SECRET_ACCESS_TOKEN,
        { expiresIn: EXPIRACION_ACCESS_TOKEN } as jwt.SignOptions
    );

    res.json({
        mensaje: 'Login exitoso',
        sessionToken: tokenAcceso,
        usuario: { id: usuario.id, nombre: usuario.usuario, email: usuario.email }
    });
};

export const cerrarSesion = async (req: Request, res: Response): Promise<void> => {
    const { sessionToken } = req.body;

    if (!sessionToken) {
        res.status(400).json({ mensaje: 'Session token es obligatorio' });
        return;
    }

    try {
        // Bloquear el token de sesión (access token)
        const decoded: any = jwt.decode(sessionToken);
        const exp = decoded?.exp ? new Date(decoded.exp * 1000) : new Date(Date.now() + 3600000);
        await bloquearToken(sessionToken, exp);

        res.json({ mensaje: 'Logout exitoso' });
    } catch (error) {
        console.error('Error en cerrarSesion:', error);
        res.status(500).json({ mensaje: 'Error al cerrar sesión' });
    }
};
