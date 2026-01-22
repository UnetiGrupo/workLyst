import { NavbarItems } from "../../lib/constants";
export function Header() {
return (
<header className="flex items-center justify-between px-14 py-2">
      <picture>
        <img className="w-48" src="/worklyst-logo.svg" alt="Worklyst Logo" />
      </picture>
      <nav className="flex flex-2 items-center justify-center gap-3">
        {NavbarItems.map(({ label, href }) => (
  <a
    className="text-xl text-gray-700 hover:text-blue-500 hover:scale-110 transition"
    href={href}
    >
            {label}
          </a>
  ))}
</nav>
      <aside className="flex items-center gap-4">
        <a
    href="/login"
    className="px-4 py-2.5 rounded-lg bg-sky-500 text-white font-medium hover:bg-sky-600 hover:scale-110 transition cursor-pointer"
    >
          Iniciar Sesión
        </a>
        <a
    href="/register"
    className="px-4 py-2.5 rounded-lg border border-gray-300 font-medium hover:bg-gray-200 hover:scale-110 transition cursor-pointer"
    >
          Crear Cuenta
        </a>
</aside>
</header>
);
}