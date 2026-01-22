import { ProgressCard } from "../components/dashboard/ProgressCard.jsx";
import { TaskItem } from "../components/dashboard/TaskItem.jsx";
import { StadisticCard } from "../components/dashboard/StadisticCard.jsx";
import { QuickAction } from "../components/dashboard/QuickAction.jsx";
import { TeamActivity } from "../components/dashboard/TeamActivity.jsx";

export function Dashboard() {
  return (
    <>
      <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 font-sans text-gray-800">
        <main className="max-w-7xl mx-auto">
          <header className="mb-8 mt-4">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
              !!Bienvenidos, Usuario!! 👋
            </h1>
            <p className="m-1 text-gray-500 text-lg">
              Aqui tienes un resumen de tu Actividad y Proyectos
            </p>
          </header>

          <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            <ProgressCard
              title="Tareas Completadas"
              value="24"
              percentage="+10% desde la semana pasada"
              icon="📊"
              colorVariant="blue"
            />
            <ProgressCard
              title="En Progreso"
              value="1"
              percentage="2 tareas esta semana"
              icon="⏳"
              colorVariant="yellow"
            />
            <ProgressCard
              title="Atrasadas"
              value="8"
              percentage="Requiere atención inmediata"
              icon="🚨"
              colorVariant="red"
            />
            <ProgressCard
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
                  <span className="bg-gray-100 p-2 rounded-2xl text-lg">
                    📋
                  </span>
                  <h3 className="text-xl font-bold">Tareas Recientes</h3>
                </div>
                <div className="space-y-1 mt-4 border rounded-3xl">
                  <TaskItem
                    title="Diseñar mockups para landing page"
                    project="Diseño Web"
                    priority="Alto"
                    date="Hoy"
                  />
                  <TaskItem
                    title="Implementar autenticación OAuth"
                    project="API Backend"
                    priority="Medio"
                    date="Mañana"
                  />
                  <TaskItem
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
                <StadisticCard name="Rediseño de Dashboard" percentage={75} />
                <StadisticCard name="API de Autenticación" percentage={45} />
                <StadisticCard name="Mobile App MVP" percentage={20} />
              </div>
            </div>
          </section>

          <section className="flex m-3">
            <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
              <h3 className="text-xl font-bold mb-6">Acciones Rápidas</h3>
              <div className="flex flex-col gap-3">
                <QuickAction
                  label="Programar Reunión"
                  icon="📅"
                  variant="secondary"
                  onClick={() => console.log("Abriendo calendario...")}
                />
                <QuickAction
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
              <TeamActivity
                name="Orlando López"
                action="Comentó en Integración con API externa"
                time="2 horas"
                avatarText="OL"
              />
              <TeamActivity
                name="Pedro Castro"
                action="Completó la tarea Diseño de componentes UI"
                time="6 horas"
                avatarText="PC"
              />
              <TeamActivity
                name="Wrallean Brito"
                action="Movió la tarea Test Unitarios API a Review"
                time="4 horas"
                avatarText="WB"
              />
              <TeamActivity
                name="Jenn Díaz"
                action="Creó una nueva tarea Optimización de base de datos"
                time="10 horas"
                avatarText="JD"
              />
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
