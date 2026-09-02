# DESIGN.md — Sistema de Diseño (Worklyst)

## 🎨 Paleta de Colores

### 1. Escala Primaria (`primary`)

| Nombre          | Token / Clave | Valor Hex | Uso Principal                                                              |
| :-------------- | :------------ | :-------- | :------------------------------------------------------------------------- |
| **Primary 50**  | `primary/50`  | `#EFF6FF` | Fondos de tags informativos, estados suaves, hover de botones secundarios. |
| **Primary 100** | `primary/100` | `#DBEAFE` | Bordes activos de inputs y fondos de alertas primarias.                    |
| **Primary 200** | `primary/200` | `#BFDBFE` | Elementos decorativos secundarios y líneas de enfoque.                     |
| **Primary 300** | `primary/300` | `#93C5FD` | Estados desactivados con tinte de marca.                                   |
| **Primary 400** | `primary/400` | `#60A5FA` | Iconos secundarios activos y elementos gráficos.                           |
| **Primary 500** | `primary/500` | `#3B82F6` | Elementos de interfaz activos, toggles y checkboxes.                       |
| **Primary 600** | `primary/600` | `#2563EB` | **Color Primario de Marca**. Botones principales, enlaces y tabs activas.  |
| **Primary 700** | `primary/700` | `#1D4ED8` | Estado `:hover` o `:active` para botones principales en interfaz móvil.    |
| **Primary 800** | `primary/800` | `#1E40AF` | Texto sobre fondos muy claros de tinte azul.                               |
| **Primary 900** | `primary/900` | `#1E3A8A` | Textos de alto contraste con tinte de marca.                               |
| **Primary 950** | `primary/950` | `#172554` | Fondos oscuros de alto contraste o modales nocturnos.                      |

---

### 2. Base e Interfaz (`Worklyst`)

| Nombre                    | Token / Clave                   | Valor Hex | Uso Principal                                                                |
| :------------------------ | :------------------------------ | :-------- | :--------------------------------------------------------------------------- |
| **Fondo Base**            | `Worklyst/Fondo`                | `#F9FAFB` | Fondo principal de la aplicación para vistas y pantallas completas.          |
| **Superficie Blanco**     | `Worklyst/Superficie-Blanco`    | `#FFFFFF` | Tarjetas (Cards), modales, menús flotantes e inputs.                         |
| **Texto Principal**       | `Worklyst/Texto-Principal`      | `#090D16` | Encabezados (H1, H2), títulos de tareas y texto con máxima legibilidad.      |
| **Gris Bordes**           | `Worklyst/Gris-Bordes`          | `#E2E8F0` | Divisores, líneas de separación y bordes inactivos de inputs/tarjetas.       |
| **Gris Texto Secundario** | `Worklyst/Gris-TextoSecundario` | `#64748B` | Subtítulos, horas de mensajes, placeholders y metadatos.                     |
| **Fondo Tiza**            | `Worklyst/Fondo-tiza`           | `#F0F2F5` | Fondo neutro alternativo para contenedores anidados o secciones secundarias. |
| **Tiza**                  | `Worklyst/Tiza`                 | `#F7F9FA` | Variación tiza ultra suave para sombras internas o superficies sobrias.      |

---

## 🔤 Fuentes

| Fuente | Uso | CSS Variable |
| :----- | :-- | :----------- |
| **Plus Jakarta Sans** | UI general, títulos, cuerpo de texto | `--font-display` |
| **JetBrains Mono** | Código, datos técnicos, monospace | `--font-mono` |

```css
@font-face {
  font-family: "JetBrains Mono";
  src: url("/fonts/jetbrains-mono-latin-wght-normal.woff2") format("woff2");
  font-weight: 100 800;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: "Plus Jakarta Sans";
  src: url("/fonts/plus-jakarta-sans-latin-wght-normal.woff2") format("woff2");
  font-weight: 200 800;
  font-style: normal;
  font-display: swap;
}
```

## 🛠️ Configuración para Tailwind CSS (`tailwind.config.js`)

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#EFF6FF",
          100: "#DBEAFE",
          200: "#BFDBFE",
          300: "#93C5FD",
          400: "#60A5FA",
          500: "#3B82F6",
          600: "#2563EB",
          700: "#1D4ED8",
          800: "#1E40AF",
          900: "#1E3A8A",
          950: "#172554",
        },
        worklyst: {
          bg: "#F9FAFB",
          surface: "#FFFFFF",
          "text-main": "#090D16",
          "text-sub": "#64748B",
          border: "#E2E8F0",
          tiza: {
            bg: "#F0F2F5",
            DEFAULT: "#F7F9FA",
          },
        },
      },
    },
  },
};
```
