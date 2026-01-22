import { Carts } from '../components/progress-carts/Progress-carts.jsx';
import { Taskitems } from '../components/task/Task-items.jsx';
import { Stadistic } from '../components/stadistic-carts/Stadistic-carts.jsx';
import { Quickactions } from '../components/quick-actions/Quick-actions.jsx';
import { Teamactivity } from '../components/team-activity/Team-activity.jsx';
import { Footer } from '../components/layout/Footer.jsx';

export function Dashboard () {
return (
<>
<div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 font-sans text-gray-800">

  <main className="max-w-7xl mx-auto">
  <header className="mb-8 mt-4">
    <h1 className="text-4xl font-extrabold text-gray-900 mb-2">!!Bienvenidos, Usuario!! 👋</h1>
    <p className="m-1 text-gray-500 text-lg">
Aqui tienes un resumen de tu Actividad y Proyectos
</p>
</header>

  <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
    <Carts
    title="Tareas Completadas"
    value="24"
    percentage="+10% desde la semana pasada"
    icon="📊"
    colorVariant="blue"
    />
  <Carts
    title="En Progreso"
    value="1"
    percentage="2 tareas esta semana"
    icon="⏳"
    colorVariant="yellow"
    />
  <Carts
    title="Atrasadas"
    value="8"
    percentage="Requiere atención inmediata"
    icon="🚨"
    colorVariant="red"
    />
  <Carts
    title="Productividad"
    value="92%"
    percentage="+5% mejora semanal"
    icon="📈"
    colorVariant="green"
    />
</section>

  <section>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 m-3">

      <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
  <div className="flex items-center gap-3 mb-2">
    <span className="bg-gray-100 p-2 rounded-2xl text-lg">📋</span>
    <h3 className="text-xl font-bold">Tareas Recientes</h3>
  </div>
  <div className="space-y-1 mt-4 border rounded-3xl">
    <Taskitems
      title="Diseñar mockups para landing page"
      project="Diseño Web"
      priority="Alto"
      date="Hoy"
      />
    <Taskitems
      title="Implementar autenticación OAuth"
      project="API Backend"
      priority="Medio"
      date="Mañana"
      />
    <Taskitems
      title="Revisar pruebas unitarias"
      project="Testing Suite"
      priority="Bajo"
      date="30 Agosto"
      />
  </div>
  </div>
  </div>
</section>

  <section>
    <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
  <h3 className="text-xl font-bold mb-6">Progreso de Proyectos</h3>
  <div className="space-y-2">
    <Stadistic name="Rediseño de Dashboard" percentage={75} />
    <Stadistic name="API de Autenticación" percentage={45} />
    <Stadistic name="Mobile App MVP" percentage={20} />
  </div>
  </div>
</section>

  <section className="flex m-3">
    <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
  <h3 className="text-xl font-bold mb-6">Acciones Rápidas</h3>
  <div className="flex flex-col gap-3">
    <Quickactions
    label="Programar Reunión"
    icon="📅"
    variant="secondary"
    onClick={() => console.log("Abriendo calendario...")}
    />
    <Quickactions
    label="Nuevo Proyecto"
    icon="➕"
    variant="primary"
    onClick={() => console.log("Creando proyecto...")}
    />
  </div>
  </div>
</section>

  <section className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">

    <div className="flex items-center gap-2 mb-2">
    <span className="text-xl">✨</span>
    <h3 className="text-xl font-bold">Actividad del Equipo</h3>
  </div>
  <p className="text-gray-400 text-[11px] md:text-xs mb-8">
    Últimas actualizaciones de tu equipo
  </p>
  <div className="space-y-1">
    <Teamactivity
      name="Orlando López"
      action="Comentó en Integración con API externa"
      time="2 horas"
      avatarText="OL"
      />
    <Teamactivity
      name="Pedro Castro"
      action="Completó la tarea Diseño de componentes UI"
      time="6 horas"
      avatarText="PC"
      />
    <Teamactivity
      name="Wrallean Brito"
      action="Movió la tarea Test Unitarios API a Review"
      time="4 horas"
      avatarText="WB"
      />
    <Teamactivity
      name="Jenn Díaz"
      action="Creó una nueva tarea Optimización de base de datos"
      time="10 horas"
      avatarText="JD"
      />
  </div>
</section>
  </main>
</div>

<section>
  <Footer />
</section>
</>
);
};