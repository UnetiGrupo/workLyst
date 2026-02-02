import { consulta } from '../db';

export const inicializarTablas = async () => {
    try {
        console.log('Verificando tablas de base de datos...');

        // Tabla de usuarios
        await consulta(`
            CREATE TABLE IF NOT EXISTS users (
                id VARCHAR(36) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Tabla de roles
        await consulta(`
            CREATE TABLE IF NOT EXISTS roles (
                id SERIAL PRIMARY KEY,
                name VARCHAR(50) NOT NULL UNIQUE
            )
        `);

        // Seed de roles (Insertar si no existen)
        await consulta(`INSERT INTO roles (name) VALUES ('owner') ON CONFLICT (name) DO NOTHING`);
        await consulta(`INSERT INTO roles (name) VALUES ('member') ON CONFLICT (name) DO NOTHING`);

        // Tabla de proyectos
        await consulta(`
            CREATE TABLE IF NOT EXISTS projects (
                id VARCHAR(36) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                owner_id VARCHAR(36) NOT NULL,
                status VARCHAR(20) DEFAULT 'active' CHECK(status IN ('active', 'finished')),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        // Tabla de miembros de proyectos
        await consulta(`
            CREATE TABLE IF NOT EXISTS project_members (
                project_id VARCHAR(36) NOT NULL,
                user_id VARCHAR(36) NOT NULL,
                role_id INTEGER NOT NULL DEFAULT 2,
                joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (project_id, user_id),
                FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (role_id) REFERENCES roles(id)
            )
        `);

        // Tabla de Tareas (Declaración inicial para nuevas instalaciones)
        // Nota: Para migraciones, ver bloques ALTER abajo
        await consulta(`
            CREATE TABLE IF NOT EXISTS task_statuses (
                id SERIAL PRIMARY KEY,
                name VARCHAR(50) NOT NULL UNIQUE,
                key VARCHAR(50) NOT NULL UNIQUE,
                color VARCHAR(7) DEFAULT '#808080',
                is_system BOOLEAN DEFAULT FALSE
            )
        `);

        // Seed de Estatus de Tareas
        await consulta(`INSERT INTO task_statuses (name, key, color, is_system) VALUES ('Pendiente', 'pending', '#ffc107', true) ON CONFLICT (key) DO NOTHING`);
        await consulta(`INSERT INTO task_statuses (name, key, color, is_system) VALUES ('En Progreso', 'in_progress', '#17a2b8', false) ON CONFLICT (key) DO NOTHING`);
        await consulta(`INSERT INTO task_statuses (name, key, color, is_system) VALUES ('Completada', 'completed', '#28a745', true) ON CONFLICT (key) DO NOTHING`);
        await consulta(`INSERT INTO task_statuses (name, key, color, is_system) VALUES ('Vencida', 'overdue', '#dc3545', true) ON CONFLICT (key) DO NOTHING`);

        // Tabla de Tareas
        await consulta(`
            CREATE TABLE IF NOT EXISTS tasks (
                id VARCHAR(36) PRIMARY KEY,
                project_id VARCHAR(36) NOT NULL,
                assigned_to VARCHAR(36),
                title VARCHAR(255) NOT NULL,
                description TEXT,
                status_id INTEGER REFERENCES task_statuses(id),
                due_date TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
                FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
            )
        `);

        // Migración: Añadir status_id si no existe y migrar datos
        try {
            // Verificar si columna status_id existe
            await consulta(`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS status_id INTEGER REFERENCES task_statuses(id)`);

            // Migrar datos antiguos (status string -> status_id)
            // Solo si existen filas con status_id NULL y status con texto
            const hasOldData = await consulta(`SELECT 1 FROM tasks WHERE status_id IS NULL LIMIT 1`);
            if (hasOldData.length > 0) {
                await consulta(`UPDATE tasks SET status_id = (SELECT id FROM task_statuses WHERE key = 'pending') WHERE status = 'pendiente'`);
                await consulta(`UPDATE tasks SET status_id = (SELECT id FROM task_statuses WHERE key = 'in_progress') WHERE status = 'en_progreso'`);
                await consulta(`UPDATE tasks SET status_id = (SELECT id FROM task_statuses WHERE key = 'completed') WHERE status = 'completada'`);
                await consulta(`UPDATE tasks SET status_id = (SELECT id FROM task_statuses WHERE key = 'overdue') WHERE status = 'vencida'`);

                // Default para cualquiera que quede
                await consulta(`UPDATE tasks SET status_id = (SELECT id FROM task_statuses WHERE key = 'pending') WHERE status_id IS NULL`);
            }

            // Opcional: Eliminar columna antigua 'status' si ya no se usa, pero por seguridad la dejaremos por ahora o se puede renombrar
            // await consulta(`ALTER TABLE tasks DROP COLUMN IF EXISTS status`); 
        } catch (e) {
            console.log('Nota: Migración de columnas de tareas ya realizada o no necesaria.');
        }

        // Tabla de estatus de grupos
        await consulta(`
            CREATE TABLE IF NOT EXISTS group_statuses (
                id SERIAL PRIMARY KEY,
                name VARCHAR(50) NOT NULL UNIQUE
            )
        `);

        // Seed de estatus de grupos
        await consulta(`INSERT INTO group_statuses (name) VALUES ('activo') ON CONFLICT (name) DO NOTHING`);
        await consulta(`INSERT INTO group_statuses (name) VALUES ('eliminado') ON CONFLICT (name) DO NOTHING`);

        // Tabla de grupos
        await consulta(`
            CREATE TABLE IF NOT EXISTS groups (
                id VARCHAR(36) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                owner_id VARCHAR(36) NOT NULL,
                status_id INTEGER NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (status_id) REFERENCES group_statuses(id)
            )
        `);

        // Tabla de miembros de grupos
        await consulta(`
            CREATE TABLE IF NOT EXISTS group_members (
                group_id VARCHAR(36) NOT NULL,
                user_id VARCHAR(36) NOT NULL,
                joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (group_id, user_id),
                FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        // Tabla de API Keys
        await consulta(`
            CREATE TABLE IF NOT EXISTS api_keys (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) UNIQUE NOT NULL,
                api_key VARCHAR(255) UNIQUE NOT NULL,
                status VARCHAR(20) DEFAULT 'active' CHECK(status IN ('active', 'inactive')),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Seed de API Keys iniciales
        await consulta(`
            INSERT INTO api_keys (name, api_key, status) 
            VALUES ('IA_BOT', '925053021afeec58aac3c36d1a7b8a2a00dfbc57de7ada2e30b7cb7b7fcc9d03', 'active') 
            ON CONFLICT (name) DO NOTHING
        `);
        await consulta(`
            INSERT INTO api_keys (name, api_key, status) 
            VALUES ('WEB_APP', '2f3051da7622f58f4ba191e2e9dacea002042ab1c7394f8bee67949081bf3436', 'active') 
            ON CONFLICT (name) DO NOTHING
        `);

        // Tabla de Bloqueo de Tokens (Blocklist)
        await consulta(`
            CREATE TABLE IF NOT EXISTS token_blocklist (
                id SERIAL PRIMARY KEY,
                token TEXT UNIQUE NOT NULL,
                expires_at TIMESTAMP NOT NULL
            )
        `);

        // Limpiar duplicados antes de asegurar el índice único (Fix para error ON CONFLICT)
        await consulta(`
            DELETE FROM token_blocklist a USING token_blocklist b 
            WHERE a.id < b.id AND a.token = b.token
        `);

        // Asegurar que el token en token_blocklist sea único (necesario para ON CONFLICT)
        await consulta(`CREATE UNIQUE INDEX IF NOT EXISTS token_blocklist_token_idx ON token_blocklist (token)`);

        // Crear usuario del sistema (IA Bot) si no existe
        const mensajeBot = await consulta(`SELECT * FROM users WHERE email = $1`, ['ia_bot@system.local']);
        if ((mensajeBot as any[]).length === 0) {
            const { v4: uuidv4 } = require('uuid');
            const bcrypt = require('bcryptjs');
            const botId = uuidv4();
            const hashedPassword = await bcrypt.hash('system_password_secure_' + uuidv4(), 10);

            await consulta(`
                INSERT INTO users(id, name, email, password)
                VALUES($1, $2, $3, $4)
            `, [botId, 'IA System Bot', 'ia_bot@system.local', hashedPassword]);
            console.log('Usuario de sistema (IA Bot) creado');
        }

        console.log('Tablas verificadas/creadas correctamente');
    } catch (error) {
        console.error('Error al inicializar las tablas:', error);
        throw error;
    }
};
