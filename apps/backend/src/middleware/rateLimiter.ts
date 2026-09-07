import rateLimit from 'express-rate-limit';
import obtenerConfig from '../config/configLoader';

const config = obtenerConfig();

export const globalLimiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        mensaje: 'Demasiadas peticiones desde esta IP, por favor intente nuevamente después de 15 minutos'
    }
});

export const authLimiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.authMax,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        mensaje: 'Demasiados intentos de inicio de sesión, por favor intente nuevamente después de 15 minutos'
    }
});
