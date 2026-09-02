// Componentes
import Link from "next/link";

export function Footer() {
  return (
    <footer
      className="py-12 md:py-16 px-4 md:px-0 max-w-11/12 2xl:max-w-10/12 mx-auto"
      aria-label="Pie de página"
    >
      <div className="flex flex-col lg:flex-row justify-between items-center lg:items-start gap-12">
        <div className="flex flex-col gap-4 max-w-xs text-center lg:text-left">
          <Link
            href="/"
            className="flex items-center justify-center lg:justify-start gap-2 group"
          >
            <img
              src="/logo.svg"
              alt="Worklyst Logo"
              className="h-8 group-hover:scale-105 transition-transform"
            />
            <h3 className="font-semibold text-lg text-slate-900">Worklyst</h3>
          </Link>
          <p className="text-slate-500 text-sm leading-relaxed">
            Potencia la Colaboración de tu equipo con IA. Organiza, asigna y
            completa proyectos de manera más eficiente que nunca.
          </p>
          <div className="flex items-center justify-center lg:justify-start gap-4 text-slate-400 mt-2">
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://github.com/UnetiGrupo/workLyst"
              className="hover:text-blue-600 transition-colors hover:scale-110 transform duration-200"
              aria-label="Github"
            >
              Github
            </a>
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="mailto:worklystuneti@gmail.com"
              className="hover:text-red-500 transition-colors hover:scale-110 transform duration-200"
              aria-label="Email"
            >
              Email
            </a>
          </div>
        </div>

        <nav
          className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12 w-full lg:w-auto text-center md:text-left"
          aria-label="Enlaces del pie de página"
        >
          <div className="flex flex-col gap-4">
            <h3 className="font-bold text-slate-900">Producto</h3>
            <ul className="space-y-3 text-sm text-slate-500">
              <li>
                <Link
                  href="/projects"
                  className="hover:text-blue-600 transition-colors"
                >
                  Proyectos
                </Link>
              </li>
              <li>
                <Link
                  href="/community"
                  className="hover:text-blue-600 transition-colors"
                >
                  Comunidad
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600 transition-colors">
                  Chat (Próximamente)
                </a>
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="font-bold text-slate-900">Empresa</h3>
            <ul className="space-y-3 text-sm text-slate-500">
              <li>
                <Link
                  href="/"
                  className="hover:text-blue-600 transition-colors"
                >
                  Inicio
                </Link>
              </li>
              <li>
                <a
                  href="mailto:worklystuneti@gmail.com"
                  className="hover:text-blue-600 transition-colors"
                >
                  Contacto
                </a>
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-4 col-span-2 md:col-span-1 items-center md:items-start">
            <h3 className="font-bold text-slate-900">Soporte</h3>
            <ul className="space-y-3 text-sm text-slate-500">
              <li>
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="/docs/Documentacion.pdf"
                  className="hover:text-blue-600 transition-colors"
                >
                  Documentación
                </a>
              </li>
              <li>
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://worklyst.onrender.com/api-docs/#/"
                  className="hover:text-blue-600 transition-colors"
                >
                  API
                </a>
              </li>
            </ul>
          </div>
        </nav>
      </div>

      <hr className="my-10 border-slate-100" />

      <div className="flex flex-col-reverse md:flex-row justify-between items-center gap-6 text-center md:text-left">
        <small className="text-xs text-slate-400 font-medium">
          &copy; {new Date().getFullYear()} Worklyst. Hecho con{" "}
          <span className="text-red-500">❤</span> por el equipo.
        </small>
        <div className="flex flex-wrap justify-center gap-6 text-xs text-slate-500 font-medium">
          <a href="#" className="hover:text-slate-800 transition-colors">
            Términos de Servicio
          </a>
          <a href="#" className="hover:text-slate-800 transition-colors">
            Política de Privacidad
          </a>
          <a href="#" className="hover:text-slate-800 transition-colors">
            Cookies
          </a>
        </div>
      </div>
    </footer>
  );
}
