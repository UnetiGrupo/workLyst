// Componentes
import Link from "next/link";

export function Footer() {
  return (
    <footer
      className="py-16 max-w-11/12 2xl:max-w-10/12 mx-auto"
      aria-label="Pie de página"
    >
      <div className="flex flex-col md:flex-row justify-between gap-12">
        <div className="flex flex-col gap-2 max-w-xs">
          <picture className="flex items-center gap-2">
            <img src="/logo.svg" alt="Worklyst Logo" className="h-8" />
            <h3 className="font-semibold">Worklyst</h3>
          </picture>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">
            Potencia la Colaboración de tu equipo con IA. Organiza, asigna y
            completa proyectos de manera más eficiente que nunca.
          </p>
          <div className="flex gap-4 text-slate-400">
            <a
              href="#"
              className="hover:text-sky-500 transition-colors"
              aria-label="Github"
            >
              Github
            </a>
            <a
              href="#"
              className="hover:text-sky-500 transition-colors"
              aria-label="Twitter"
            >
              Twitter
            </a>
            <a
              href="#"
              className="hover:text-sky-500 transition-colors"
              aria-label="LinkedIn"
            >
              LinkedIn
            </a>
            <a
              href="#"
              className="hover:text-sky-500 transition-colors"
              aria-label="Email"
            >
              Email
            </a>
          </div>
        </div>

        <nav
          className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-16"
          aria-label="Enlaces del pie de página"
        >
          <div>
            <h3 className="font-bold text-slate-900 mb-4">Producto</h3>
            <ul className="space-y-3 text-sm text-slate-500">
              <li>
                <Link href="/projects" className="hover:text-sky-500">
                  Proyectos
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-sky-500">
                  Dashboard
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-sky-500">
                  Chat Inteligente
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-sky-500">
                  Integrantes
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-slate-900 mb-4">Empresa</h3>
            <ul className="space-y-3 text-sm text-slate-500">
              <li>
                <a href="#" className="hover:text-sky-500">
                  Acerca de
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-sky-500">
                  Carreras
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-sky-500">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-sky-500">
                  Contacto
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-slate-900 mb-4">Soporte</h3>
            <ul className="space-y-3 text-sm text-slate-500">
              <li>
                <a href="#" className="hover:text-sky-500">
                  Centro de Ayuda
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-sky-500">
                  Documentación
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-sky-500">
                  API
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-sky-500">
                  Estado del Servicio
                </a>
              </li>
            </ul>
          </div>
        </nav>
      </div>

      <hr className="my-10 border-slate-100" />

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex gap-6 text-xs text-slate-400">
          <a href="#" className="hover:text-slate-600">
            Términos de Servicios
          </a>
          <a href="#" className="hover:text-slate-600">
            Política de Privacidad
          </a>
          <a href="#" className="hover:text-slate-600">
            Cookies
          </a>
        </div>
        <small className="text-xs text-slate-400">
          Hecho con React, Tailwind © 2025 Worklyst. Todos los derechos
          Reservados
        </small>
      </div>
    </footer>
  );
}
