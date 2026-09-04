# Worklyst

Gestor de proyectos y tareas potenciado con IA para equipos de ingeniería.

## Descripción

Worklyst es una plataforma centralizada que automatiza la planificación, ejecución y entrega de proyectos. Ofrece plantillas Kanban y Scrum, un copiloto de IA para sugerencias inteligentes, y sincronización en tiempo real para equipos de productos modernos.

## Stack Tecnológico

| Capa | Tecnología |
|------|------------|
| Framework | [TanStack Start](https://tanstack.com/start) |
| Routing | [TanStack Router](https://tanstack.com/router) |
| Formularios | [TanStack Form](https://tanstack.com/form) |
| Estilos | [Tailwind CSS v4](https://tailwindcss.com) |
| Mobile | [Capacitor](https://capacitorjs.com) |
| Lenguaje | TypeScript |
| Runtime | [Nitro](https://nitro.build) |
| HTTP Client | Axios |

## Estructura del Proyecto

```
src/
├── components/
│   ├── common/           # Componentes reutilizables
│   │   ├── button.tsx    # Botón con variantes primary/brand
│   │   ├── input.tsx     # Input con label e iconos
│   │   ├── tag.tsx       # Etiquetas con dot opcional
│   │   └── icons.tsx     # Iconos SVG (Google, GitHub)
│   └── auth/             # Componentes de autenticación
│       ├── auth-background.tsx
│       ├── auth-header.tsx
│       ├── auth-footer.tsx
│       ├── auth-hero.tsx
│       ├── signup-form.tsx
│       └── signin-form.tsx
├── routes/
│   ├── __root.tsx
│   ├── index.tsx
│   └── auth/
│       ├── signup.tsx
│       └── signin.tsx
├── router.tsx
├── routeTree.gen.ts
└── styles.css
```

## Componentes

### Button

Componente de botón reutilizable con variantes.

```tsx
import { Button } from "#/components/common/button";

// Variante primaria
<Button variant="primary">Crear proyecto</Button>

// Variante brand (bordes sutiles)
<Button variant="brand">
  <Google className="size-4" />
  <span>Continuar con Google</span>
</Button>

// Como enlace
<Button href="/dashboard">Ir al dashboard</Button>
```

**Props:**
| Prop | Tipo | Descripción |
|------|------|-------------|
| `variant` | `"primary" \| "brand"` | Estilo del botón |
| `href` | `string` | Renderiza como Link de TanStack Router |
| `onClick` | `() => void` | Handler de clic |
| `disabled` | `boolean` | Estado deshabilitado |
| `children` | `ReactNode` | Contenido del botón |

### Input

Campo de entrada con label, icono y soporte de errores.

```tsx
import { Input } from "#/components/common/input";

<Input
  label="Correo Electrónico"
  type="email"
  placeholder="tu@email.com"
  icon={<Mail className="size-4" />}
  error={errors.email}
/>
```

**Props:**
| Prop | Tipo | Descripción |
|------|------|-------------|
| `label` | `string` | Label del campo (uppercase automático) |
| `icon` | `ReactNode` | Icono a la derecha |
| `error` | `string` | Mensaje de error |

### AuthHero

Sección hero reutilizable para páginas de autenticación.

```tsx
import { AuthHero } from "#/components/auth/auth-hero";

<AuthHero
  title={
    <>
      Construye más rápido. <br />
      <span className="text-gradient">Gestiona con IA.</span>
    </>
  }
  description="Plataforma para equipos de ingeniería."
  tags={[
    { text: "Scrum & Kanban", showDot: false },
    { text: "Copiloto AI", showDot: true },
  ]}
/>
```

### Tag

Etiqueta con soporte de dot indicador.

```tsx
import { Tag } from "#/components/common/tag";

<Tag showDot={true}>Sprints inteligentes</Tag>
```

## Formularios con TanStack Form

Los formularios usan TanStack Form para manejo de estado y validación.

```tsx
import { useForm } from "@tanstack/react-form";

const form = useForm({
  defaultValues: {
    email: "",
    password: "",
  },
  onSubmit: async ({ value }) => {
    // Enviar datos
  },
});

<form.Field
  name="email"
  validators={{
    onChange: ({ value }) => {
      if (!value) return "Este campo es requerido";
      return undefined;
    },
  }}
>
  {(fieldApi) => (
    <Input
      value={fieldApi.state.value}
      onChange={(e) => fieldApi.handleChange(e.target.value)}
      error={fieldApi.state.meta.errors[0]}
    />
  )}
</form.Field>
```

## Tema y Diseño

### Colores

| Token | Valor | Uso |
|-------|-------|-----|
| `primary-500` | `#3B82F6` | Botones principales, enlaces |
| `primary-600` | `#2563EB` | Hover de botones |
| `worklyst-bg` | `#F9FAFB` | Fondo de la app |
| `worklyst-surface` | `#FFFFFF` | Cards, modales |
| `worklyst-text` | `#090D16` | Texto principal |
| `worklyst-text-sub` | `#64748B` | Texto secundario |
| `worklyst-border` | `#E2E8F0` | Bordes, divisores |

### Fuentes

| Fuente | Uso | Variable |
|--------|-----|----------|
| Plus Jakarta Sans | UI general | `--font-display` |
| JetBrains Mono | Código, datos | `--font-mono` |

## Comandos

```bash
# Instalar dependencias
pnpm install

# Desarrollo
pnpm dev

# Build producción
pnpm build

# Linting
pnpm lint
pnpm check

# Generar rutas
pnpm generate-routes
```

## Roadmap

- [ ] Autenticación (Login/Signup)
- [ ] Dashboard principal
- [ ] Gestión de proyectos
- [ ] Tablero Kanban
- [ ] Tablero Scrum (Sprints)
- [ ] Copiloto de IA
- [ ] Plantillas predefinidas
- [ ] Colaboración en tiempo real
- [ ] Notificaciones
- [ ] App móvil con Capacitor

## Licencia

Privado - Worklyst © 2026
