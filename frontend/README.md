# Frontend de WorkLyst

WorkLyst es una herramienta moderna de gestión de proyectos diseñada para ayudarte a organizar tus tareas y proyectos de manera eficiente. Este repositorio contiene la aplicación **frontend**, construida con React y Vite, enfocándose en el rendimiento y una experiencia de usuario premium.

## 🚀 Tecnologías

- **[Vite](https://vitejs.dev/)**: Herramientas de Frontend de Próxima Generación.
- **[React](https://react.dev/)**: La librería para interfaces de usuario web y nativas.
- **[Tailwind CSS](https://tailwindcss.com/)**: Un framework de CSS de utilidad primero para el desarrollo rápido de UI.
- **[Axios](https://axios-http.com/)**: Cliente HTTP basado en promesas para el navegador y node.js.

## 📂 Estructura del Proyecto

El proyecto sigue una estructura modular dentro del directorio `src`:

```
src/
├── components/       # Componentes de UI reutilizables
│   └── auth/         # Componentes específicos de autenticación (FormInput, AuthHeader)
├── hooks/            # Hooks personalizados de React
│   └── useAuth.js    # Lógica de autenticación (Manejo de Login, Registro)
├── lib/              # Utilidades y constantes
│   └── constants.js  # Configuraciones de formularios y datos estáticos
├── pages/            # Páginas principales de la aplicación
│   ├── Login.jsx     # Página de inicio de sesión de usuario
│   └── Register.jsx  # Página de registro de usuario
├── App.jsx           # Componente principal de la aplicación y enrutamiento
└── main.jsx          # Punto de entrada
```

## 🛠️ Comenzando

Sigue estos pasos para configurar el proyecto localmente.

### Requisitos Previos

- **Node.js**: Versión 16+ recomendada
- **npm** o **bun**: Gestor de paquetes

### Instalación

1.  **Clonar el repositorio:**

    ```bash
    git clone <repository-url>
    cd workLyst/frontend
    ```

2.  **Instalar dependencias:**

    ```bash
    npm install
    # o
    bun install
    ```

3.  **Configuración del Entorno:**
    Crea un archivo `.env` en la raíz del directorio `frontend`. Puedes usar `.env.example` como referencia si está disponible.

    ```env
    VITE_API_URL=http://localhost:3000 # Tu URL de API del Backend
    ```

    > [!IMPORTANT]
    > Asegúrate de que tus variables de entorno comiencen con `VITE_` para ser expuestas a tu aplicación Vite.

4.  **Ejecutar el servidor de desarrollo:**
    ```bash
    npm run dev
    ```
    La aplicación estará disponible en `http://localhost:5173`.

## 📜 Scripts Disponibles

- `npm run dev`: Inicia el servidor de desarrollo.
- `npm run build`: Construye la aplicación para producción.
- `npm run lint`: Ejecuta ESLint para verificar problemas de calidad de código.
- `npm run preview`: Previsualiza localmente la compilación de producción.

## ✨ Características Principales

- **Sistema de Autenticación**: Flujos seguros de inicio de sesión y registro.
- **Diseño Responsivo**: Enfoque Mobile-first usando Tailwind CSS.
- **Arquitectura Moderna**: Estructura basada en componentes para mantenibilidad.
