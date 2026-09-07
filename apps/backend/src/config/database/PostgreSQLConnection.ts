import { Pool, PoolConfig } from 'pg';

/**
 * Conexión a PostgreSQL usando pg
 * Soporta Supabase mediante connection string o parámetros individuales
 */
export class PostgreSQLConnection {
    private pool: Pool | null = null;
    private config: PoolConfig;

    constructor(config: {
        connectionString?: string;
        host?: string;
        port?: number;
        database?: string;
        user?: string;
        password?: string;
    }) {
        const usarSSL = process.env.DB_SSL === 'true';
        const sslConfig = usarSSL ? { rejectUnauthorized: false } : undefined;

        // Si hay connection string, usarla (preferido para Supabase)
        if (config.connectionString) {
            this.config = {
                connectionString: config.connectionString,
                ssl: sslConfig
            };
        } else {
            // De lo contrario, usar parámetros individuales
            this.config = {
                host: config.host,
                port: config.port,
                database: config.database,
                user: config.user,
                password: config.password,
                ssl: sslConfig
            };
        }
    }

    async conectar(): Promise<void> {
        if (!this.pool) {
            this.pool = new Pool(this.config);

            // Probar conexión
            const client = await this.pool.connect();
            client.release();

            if (this.config.connectionString) {
                console.log('✓ Conectado a PostgreSQL (Supabase) usando connection string');
            } else {
                console.log(`✓ Conectado a PostgreSQL: ${this.config.host}:${this.config.port}/${this.config.database}`);
            }
        }
    }

    async desconectar(): Promise<void> {
        if (this.pool) {
            await this.pool.end();
            this.pool = null;
            console.log('✓ Desconectado de PostgreSQL');
        }
    }

    async consulta(sql: string, params: any[] = []): Promise<any[]> {
        if (!this.pool) throw new Error('Base de datos no conectada');
        const result = await this.pool.query(sql, params);
        return result.rows;
    }

    async obtener(sql: string, params: any[] = []): Promise<any> {
        if (!this.pool) throw new Error('Base de datos no conectada');
        const result = await this.pool.query(sql, params);
        return result.rows[0];
    }

    async ejecutar(sql: string, params: any[] = []): Promise<any> {
        if (!this.pool) throw new Error('Base de datos no conectada');
        const result = await this.pool.query(sql, params);
        return {
            changes: result.rowCount || 0,
            lastInsertRowid: result.rows[0]?.id,
        };
    }
}
