# Worklyst Frontend

## 1. Título del Proyecto y Descripción Corta

**Worklyst Frontend** es una aplicación moderna de gestión de proyectos y tareas. Está construida para ofrecer una experiencia de usuario fluida y eficiente en la administración de trabajo colaborativo.

Esta aplicación es el cliente frontend que interactúa con la APIbackend de Worklyst, proporcionando interfaces para autenticación, gestión de proyectos, tareas y colaboración en equipo.

## 2. Stack Tecnológico

El proyecto utiliza un conjunto de tecnologías modernas para garantizar rendimiento, escalabilidad y una gran experiencia de desarrollo:

* **Core Framework:** [Next.js](https://nextjs.org/) (v16.1.6) - Utilizando App Router.
* **Librería UI:** [React](https://react.dev/) (v19.2.3)
* **Lenguaje:** [TypeScript](https://www.typescriptlang.org/) (v5)
* **Estilos:** [Tailwind CSS](https://tailwindcss.com/) (v4)
* **Animaciones:** [GSAP](https://gsap.com/) (v3.14.2)
* **Iconos:** [Lucide React](https://lucide.dev/)
* **Cliente HTTP:** [Axios](https://axios-http.com/)
* **Calidad de Código:** ESLint

## 3. Prerrequisitos

Antes de comenzar, asegúrate de tener instalado el siguiente software en tu máquina:

* **Node.js**: Versión 18.17 o superior (Se recomienda v20 LTS).
* **Gestor de Paquetes**: npm, yarn, pnpm o bun.

## 4. Instalación y Configuración

Sigue estos pasos para levantar el entorno de desarrollo localmente:

1. **Clonar el repositorio:**

    ```bash
    git clone <url-del- repositorio>
    cd worklyst-frontend
    ```

2. **Instalar dependencias:**

    Usando npm:

    ```bash
    npm install
    ```

    O usando yarn:

    ```bash
    yarn install
    ```

3. **Configurar Variables de Entorno:**

    Crea un archivo `.env.local` en la raíz del proyecto y configura las variables necesarias (ver sección "Variables de Entorno").

4. **Ejecutar el servidor de desarrollo:**

    ```bash
    npm run dev
    ```

    Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 5. Scripts Disponibles

En el archivo `package.json` encontrarás los siguientes comandos principales:

| Comando | Descripción |
| :--- | :--- |
| `npm run dev` | Inicia el servidor de desarrollo en modo watch con Hot Module Replacement (HMR). |
| `npm run build` | Compila la aplicación para producción. Genera la carpeta `.next` optimizada. |
| `npm start` | Inicia un servidor de producción localmente (debes haber ejecutado `build` primero). |
| `npm run lint` | Ejecuta ESLint para analizar el código en busca de errores y problemas de estilo. |

## 6. Arquitectura del Proyecto

### Estructura de Directorios

A continuación se muestra la estructura principal de la carpeta `src`:

```
src/
├── app/          # Páginas y Layouts (Next.js App Router)
├── components/   # Componentes reusables de UI (Botones, Inputs, Cards, etc.)
├── contexts/     # Estado global utilizando React Context API (Auth, Projects, etc.)
├── hooks/        # Custom Hooks para lógica reutilizable
├── lib/          # Funciones de utilidad, definiciones de tipos e instancias de librerías
└── assets/       # (Opcional) Imágenes, fuentes y archivos estáticos no públicos
```

### Flujo de Datos

* **Gestión de Estado:** La aplicación utiliza **React Context API** para manejar el estado global. Los contextos principales incluyen:
  * `AuthContext`: Maneja la autenticación del usuario, token de sesión y estado de login/registro.
  * `ProjectsContext`, `TasksContext`, `UsersContext`: Manejan la data de negocio respectiva.
* **Comunicación con API:** Se utiliza **Axios** para realizar peticiones HTTP al backend.
* **Autenticación:** El token de sesión (`sessionToken`) y la información del usuario se persisten en `localStorage` para mantener la sesión activa entre recargas. Las peticiones protegidas incluyen headers como `x-api-key` y (potencialmente) headers de autorización.

## 7. Variables de Entorno

Configura estas variables en un archivo `.env.local` en la raíz del proyecto.

| Variable | Descripción | Ejemplo |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | La URL base de la API Backend. | `http://localhost:8000` o `https://api.midominio.com` |
| `NEXT_PUBLIC_APP_API_KEY` | Clave de API pública para autenticar la aplicación cliente. | `tu-api-key-publica` |

> **Nota:** Las variables que comienzan con `NEXT_PUBLIC_` están expuestas al navegador. No guardes secretos sensibles aquí aparte de los destinados al cliente.

## 8. Guía de Despliegue (Deployment)

La forma más sencilla de desplegar esta aplicación Next.js es utilizando [Vercel](https://vercel.com/), los creadores de Next.js.

### Despliegue Estándar (Vercel/Netlify)

1. Conecta tu repositorio a Vercel.
2. Configura las **Variables de Entorno** en el panel de configuración del proyecto.
3. Vercel detectará automáticamente Next.js y ejecutará `npm run build`.

### Despliegue en Servidor Propio (Node.js)

1. Construye la aplicación:

    ```bash
    npm run build
    ```

2. Inicia el servidor de producción:

    ```bash
    npm start
    ```

    (Asegúrate de usar un gestor de procesos como PM2 para mantener la aplicación corriendo).

## 9. Buenas Prácticas y Convenciones

* **Type Safety:** Utiliza TypeScript estrictamente. Evita el uso de `any` siempre que sea posible y define interfaces para tus modelos de datos en `src/lib/types.ts` (o similar).
* **Componentes:** Mantén los componentes pequeños y enfocados en una sola responsabilidad. Usa el patrón de composición.
* **Estilos:** Utiliza las clases de utilidad de Tailwind CSS. Para estilos complejos o reutilizables, considera extraer componentes o usar `@apply` en CSS modules solo si es estrictamente necesario.
* **Linter:** Ejecuta `npm run lint` antes de hacer commit para asegurar la calidad del código.
