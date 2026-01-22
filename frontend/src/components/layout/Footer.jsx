export function Footer() {
return (
<>
<footer
  className="bg-white pt-16 pb-8 px-6 md:px-20 lg:px-32 border-t
  border-slate-100"
  >
        <div
    className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between
    gap-12"
    >
          <div className="max-w-xs">
            <img src="" alt="" className="h-8 mb-4" />
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              Potencia la Colaboración de tu equipo con IA. Organiza, asigna y
              completa proyectos de manera más eficiente que nunca.
    </p>
            <div className="flex gap-4 text-slate-400">
              <a href="#" className="hover:text-sky-500 transition-colors">
                Github
              </a>
              <a href="#" className="hover:text-sky-500 transition-colors">
                Twitter
              </a>
              <a href="#" className="hover:text-sky-500 transition-colors">
                LinkedIn
              </a>
              <a href="#" className="hover:text-sky-500 transition-colors">
                Email
              </a>
    </div>
  </div>
          <nav className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-16">
            <div>
              <h4 className="font-bold text-slate-900 mb-4">Producto</h4>
              <ul className="space-y-3 text-sm text-slate-500">
                <li className="hover:text-sky-500 cursor-pointer">Proyectos</li>
                <li>Dashboard</li>
                <li>Chat Inteligente</li>
                <li>Integrantes</li>
    </ul>
    </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-4">Empresa</h4>
              <ul className="space-y-3 text-sm text-slate-500">
                <li>Acerca de</li>
                <li>Carreras</li>
                <li>Blog</li>
                <li>Contacto</li>
      </ul>
    </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-4">Soporte</h4>
              <ul className="space-y-3 text-sm text-slate-500">
                <li>Centro de Ayuda</li>
                <li>Documentación</li>
                <li>API</li>
                <li>Estado del Servicio</li>
      </ul>
    </div>
  </nav>
</div>

        <hr className="my-10 border-slate-100" />

        <div
className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between
items-center gap-4"
>
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
          <p className="text-xs text-slate-400">
            Hecho con React, Tailwind © 2025 Worklyst. Todos los derechos
            Reservados
</p>
</div>
</footer>
</>
);
}