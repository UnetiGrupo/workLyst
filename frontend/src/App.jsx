import { Footer } from "./components/layout/Footer";

function App() {
  return (
    <>
      <section className="py-16 px-6 md:px-20 lg:px-32 flex flex-col md:flex-row items-center justify-between gap-10">
        <div className="flex-1 max-w-2xl">
          <span className="inline-flex items-center gap-2 bg-sky-100 text-sky-600 px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
            Potenciado por IA
          </span>
          <h2
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 
            leading-tight mb-6"
          >
            Gestión de tareas <span className="text-sky-400">Inteligentes</span>{" "}
            para equipos
          </h2>
          <p className="text-slate-500 text-lg md:text-xl mb-8 leading-relaxed max-w-lg">
            Potencia la colaboración de tu equipo con IA. Organiza, asigna y
            completa proyectos de manera más eficiente que nunca.
          </p>
          <div className="flex flex-wrap gap-4">
            <button className="bg-sky-500 hover:bg-sky-600 text-white px-8 py-3 rounded-lg font-medium transition-all flex items-center gap-2 shadow-lg shadow-sky-200">
              Comenzar Gratis
            </button>
            <button className="bg-white border border-slate-200 text-slate-700 px-8 py-3 rounded-lg font-medium hover:bg-slate-50 transition-all flex items-center gap-2">
              Ver Demo <span className="text-xs">▶</span>{" "}
            </button>
          </div>
        </div>
        <div className="flex-1 w-full max-w-xl">
          <div className="relative">
            <img
              src="/images/IA-en-clase.webp"
              alt="Ilustración de Equipo de Trabajo"
              className="w-full h-auto rounded-2xl shadow-xl bg-purple-400 p-1.5"
            />
          </div>
        </div>
      </section>

      <section className="py-20 px-6 md:px-20 lg:px-32 bg-white">
        <div className="text-center md-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 m-1">
            Todo lo que necesitas para ser productivo.
          </h2>
          <p className="text-slate-500 text-lg m-3">
            Herramientas inteligentes que se adaptan a tu forma de trabajo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <article className="bg-white border border-slate-100 p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center mb-6">
              <span className="text-sky-600">🤖</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">
              Agente IA Especializado
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Obtén sugerencias inteligentes para organizar tareas y asignar
              trabajo según las habilidades del equipo.
            </p>
          </article>

          <article className="bg-white border border-slate-100 p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-6">
              <span className="text-green-600">👥</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">
              Colaboración en tiempo real
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Trabaja con tu equipo en tiempo real con chat integrado y
              actualizaciones instantáneas.
            </p>
          </article>

          <article className="bg-white border border-slate-100 p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mb-6">
              <span className="text-orange-600">📋</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">
              Tableros Kanban
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Visualiza el progreso de tus proyectos con tableros Kanban
              intuitivos y personalizables.
            </p>
          </article>

          <article className="bg-white border border-slate-100 p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mb-6">
              <span className="text-indigo-600">🕒</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">
              Gestión de Tiempo
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Seguimiento automático del tiempo y estimaciones inteligentes para
              una planificación precisa.
            </p>
          </article>

          <article className="bg-white border border-slate-100 p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mb-6">
              <span className="text-red-600">📊</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">
              Análisis y Reportes
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Insights detallados sobre la productividad del equipo y el
              progreso de los proyectos.
            </p>
          </article>

          <article
            className="md:col-span-1 lg:col-span-3 bg-white border border-slate-100
            p-8 rounded-2xl flex flex-col justify-center items-start"
          >
            <h3 className="text-2xl font-bold text-slate-900 mb-2">
              ¿Listo para transformar tu productividad?
            </h3>
            <p className="text-slate-500 mb-6">
              Únete a miles de equipos que ya estan trabajando de manera más
              inteligente.
            </p>
            <button
              className="bg-sky-500 hover:bg-sky-600 text-white px-6 py-2.5 rounded-lg
              font-medium transition-all flex items-center gap-2"
            >
              Comenzar ahora<span className="text-lg">→</span>
            </button>
          </article>
        </div>
      </section>
      <Footer />
    </>
  );
}

export default App;
