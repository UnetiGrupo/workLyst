import * as sqlite3 from 'sqlite3';
import { Database } from 'sqlite3';

export class SQLiteConnection {
    private db: Database | null = null;
    private filename: string;

    constructor(filename: string) {
        this.filename = filename;
    }

    async conectar(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(this.filename, (err) => {
                if (err) {
                    console.error('Error connecting to SQLite:', err);
                    reject(err);
                } else {
                    console.log(`✓ Conectado a SQLite: ${this.filename}`);
                    resolve();
                }
            });
        });
    }

    async desconectar(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                resolve();
                return;
            }
            this.db.close((err) => {
                if (err) reject(err);
                else {
                    this.db = null;
                    console.log('✓ Desconectado de SQLite');
                    resolve();
                }
            });
        });
    }

    async consulta(sql: string, params: any[] = []): Promise<any[]> {
        if (!this.db) throw new Error('Base de datos no conectada');
        return new Promise((resolve, reject) => {
            this.db!.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    async obtener(sql: string, params: any[] = []): Promise<any> {
        if (!this.db) throw new Error('Base de datos no conectada');
        return new Promise((resolve, reject) => {
            this.db!.get(sql, params, (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    async ejecutar(sql: string, params: any[] = []): Promise<any> {
        if (!this.db) throw new Error('Base de datos no conectada');
        return new Promise((resolve, reject) => {
            this.db!.run(sql, params, function (err) {
                if (err) reject(err);
                else resolve({
                    changes: this.changes,
                    lastInsertRowid: this.lastID
                });
            });
        });
    }
}
