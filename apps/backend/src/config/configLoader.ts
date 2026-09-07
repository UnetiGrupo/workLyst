import * as fs from 'fs';
import * as yaml from 'js-yaml';
import * as path from 'path';

interface Configuracion {
    server: {
        port: number;
    };
    database: {
        type?: 'postgres' | 'sqlite';
        filename?: string;
        // Opción 1: Connection string (recomendado para Supabase)
        connectionString?: string;
        // Opción 2: Parámetros individuales
        host?: string;
        port?: number;
        database?: string;
        user?: string;
        password?: string;
    };
    jwt: {
        accessTokenSecret: string;
        refreshTokenSecret: string;
        accessTokenExpiry: string;
        refreshTokenExpiry: string;
    };
    cors: {
        enabled: boolean;
        origin: string;
    };
    rateLimit: {
        windowMs: number;
        max: number;
        authMax: number;
    };
    system: {
        token: string;
    };
}

let configuracion: Configuracion;

export const cargarConfiguracion = (): Configuracion => {
    if (configuracion) {
        return configuracion;
    }

    try {
        const rutaConfig = path.resolve(__dirname, '../../bootstrap.yml');
        let archivoConfig: any = {};

        if (fs.existsSync(rutaConfig)) {
            const contenidoArchivo = fs.readFileSync(rutaConfig, 'utf8');
            archivoConfig = yaml.load(contenidoArchivo);
        }

        const serverConfig = archivoConfig?.server || {};
        const databaseConfig = archivoConfig?.database || {};
        const jwtConfig = archivoConfig?.jwt || {};
        const corsConfig = archivoConfig?.cors || {};
        const rateLimitConfig = archivoConfig?.rateLimit || {};
        const systemConfig = archivoConfig?.system || {};

        // Sobrescribir con variables de entorno si existen
        configuracion = {
            server: {
                port: Number(process.env.PORT) || serverConfig.port || 3000,
            },
            database: {
                type: (process.env.DB_TYPE as 'postgres' | 'sqlite') || databaseConfig.type || 'postgres',
                filename: process.env.DB_FILENAME || databaseConfig.filename || 'database.sqlite',
                connectionString: process.env.DATABASE_URL || databaseConfig.connectionString,
                host: process.env.DB_HOST || databaseConfig.host,
                port: Number(process.env.DB_PORT) || databaseConfig.port,
                database: process.env.DB_NAME || databaseConfig.database,
                user: process.env.DB_USER || databaseConfig.user,
                password: process.env.DB_PASSWORD || databaseConfig.password,
            },
            jwt: {
                accessTokenSecret: process.env.JWT_ACCESS_SECRET || jwtConfig.accessTokenSecret,
                refreshTokenSecret: process.env.JWT_REFRESH_SECRET || jwtConfig.refreshTokenSecret,
                accessTokenExpiry: process.env.JWT_ACCESS_EXPIRY || jwtConfig.accessTokenExpiry,
                refreshTokenExpiry: process.env.JWT_REFRESH_EXPIRY || jwtConfig.refreshTokenExpiry,
            },
            cors: {
                enabled: process.env.CORS_ENABLED ? process.env.CORS_ENABLED === 'true' : (corsConfig.enabled !== undefined ? corsConfig.enabled : true),
                origin: process.env.CORS_ORIGIN || corsConfig.origin || '*',
            },
            rateLimit: {
                windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || rateLimitConfig.windowMs || 900000,
                max: Number(process.env.RATE_LIMIT_MAX) || rateLimitConfig.max || 100,
                authMax: Number(process.env.RATE_LIMIT_AUTH_MAX) || rateLimitConfig.authMax || 5
            },
            system: {
                token: process.env.SYSTEM_API_TOKEN || systemConfig.token
            }
        };

        return configuracion;
    } catch (error) {
        console.error('Error al cargar la configuración:', error);
        throw new Error('Fallo al cargar el archivo de configuración o variables de entorno');
    }
};

export const obtenerConfiguracion = (): Configuracion => {
    if (!configuracion) {
        return cargarConfiguracion();
    }
    return configuracion;
};

export default obtenerConfiguracion;
