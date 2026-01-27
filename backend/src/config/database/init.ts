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

        // Tabla de refresh_tokens
        await consulta(`
            CREATE TABLE IF NOT EXISTS refresh_tokens (
                id VARCHAR(36) PRIMARY KEY,
                user_id VARCHAR(36) NOT NULL,
                token TEXT UNIQUE NOT NULL,
                expires_at TIMESTAMP NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        // Tabla de roles
        await consulta(`
            CREATE TABLE IF NOT EXISTS roles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name VARCHAR(50) NOT NULL UNIQUE
            )
        `);

        // Seed de roles (Insertar si no existen)
        await consulta(`INSERT OR IGNORE INTO roles (name) VALUES ('owner')`);
        await consulta(`INSERT OR IGNORE INTO roles (name) VALUES ('member')`);

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

        // Tabla de tareas
        await consulta(`
            CREATE TABLE IF NOT EXISTS tasks (
                id VARCHAR(36) PRIMARY KEY,
                project_id VARCHAR(36) NOT NULL,
                assigned_to VARCHAR(36),
                title VARCHAR(255) NOT NULL,
                description TEXT,
                status VARCHAR(20) DEFAULT 'pending' CHECK(status IN ('pending', 'in_progress', 'completed')),
                due_date TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
                FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
            )
        `);

        // Tabla de estatus de grupos
        await consulta(`
            CREATE TABLE IF NOT EXISTS group_statuses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name VARCHAR(50) NOT NULL UNIQUE
            )
        `);

        // Seed de estatus de grupos
        await consulta(`INSERT OR IGNORE INTO group_statuses (name) VALUES ('activo')`);
        await consulta(`INSERT OR IGNORE INTO group_statuses (name) VALUES ('eliminado')`);

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

        // Crear usuario del sistema (IA Bot) si no existe
        const mensajeBot = await consulta(`SELECT * FROM users WHERE email = 'ia_bot@system.local'`);
        if ((mensajeBot as any[]).length === 0) {
            const { v4: uuidv4 } = require('uuid');
            const bcrypt = require('bcryptjs');
            const botId = uuidv4();
            const hashedPassword = await bcrypt.hash('system_password_secure_' + uuidv4(), 10);

            await consulta(`
                INSERT INTO users(id, name, email, password)
        VALUES(?, 'IA System Bot', 'ia_bot@system.local', ?)
            `, [botId, hashedPassword]);
            console.log('Usuario de sistema (IA Bot) creado');
        }

        console.log('Tablas verificadas/creadas correctamente');
    } catch (error) {
        console.error('Error al inicializar las tablas:', error);
        throw error;
    }
};
