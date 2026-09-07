# Configuración de Supabase

Este proyecto está configurado para usar PostgreSQL mediante Supabase.

## Obtener tu Connection String de Supabase

1. Ve a tu [Dashboard de Supabase](https://app.supabase.com)
2. Selecciona tu proyecto
3. Ve a **Project Settings** (ícono de engranaje en la barra lateral)
4. Haz clic en **Database**
5. Busca la sección **Connection String**
6. Selecciona **URI** (no "Session mode")
7. Copia la connection string que tiene este formato:
   ```
   postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
   ```

## Configurar el Proyecto

1. Abre el archivo `bootstrap.yml`
2. Reemplaza la `connectionString` con tu connection string de Supabase:
   ```yaml
   database:
     connectionString: postgresql://postgres.tu-proyecto:tu-password@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```

## Alternativa: Parámetros Individuales

Si prefieres usar parámetros individuales en lugar de connection string:

1. Comenta la línea `connectionString` en `bootstrap.yml`
2. Descomenta y configura los parámetros individuales:
   ```yaml
   database:
     # connectionString: ...
     host: aws-0-us-east-1.pooler.supabase.com
     port: 6543
     database: postgres
     user: postgres.tu-proyecto
     password: tu-password
   ```

## Inicializar las Tablas

Las tablas se crean automáticamente al iniciar el servidor. El sistema creará:
- Tabla `users`: Para almacenar usuarios
- Tabla `refresh_tokens`: Para tokens de autenticación

## Verificar la Conexión

Inicia el servidor:
```bash
npm run dev
```

Deberías ver el mensaje:
```
✓ Conectado a PostgreSQL (Supabase) usando connection string
✓ Tablas PostgreSQL inicializadas
```

## Notas Importantes

- ⚠️ **Nunca** subas `bootstrap.yml` con credenciales reales a un repositorio público
- El archivo está configurado en `.gitignore` para evitar esto
- Supabase requiere SSL, que está habilitado automáticamente en la configuración
