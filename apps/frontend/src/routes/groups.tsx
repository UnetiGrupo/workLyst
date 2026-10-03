import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Search, Users, Plus, Sparkles, X, Bot } from 'lucide-react'
import { GROUPS_MOCK, type GroupItem } from '../data/groups-mocks'

export const Route = createFileRoute('/groups')({
component: RouteComponent,
})

function RouteComponent() {
const [activeTab, setActiveTab] = useState < 'mis-grupos' | 'explorar' > ('mis-grupos')
const [searchQuery, setSearchQuery] = useState('')
const [showWelcomeCard, setShowWelcomeCard] = useState(true)
const [groups] = useState < GroupItem[] > (GROUPS_MOCK)

// Filtrado simple por término de búsqueda
const filteredGroups = groups.filter((group) =>
group.name.toLowerCase().includes(searchQuery.toLowerCase())
)

return (
<main className="min-h-screen bg-worklyst-bg pb-28 px-4 pt-6 flex flex-col gap-5 font-display">

   <header className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-sm">
          O
</div>
        <h1 className="text-xl font-bold text-worklyst-text">Grupos y Comunidades</h1>
</header>

      {/* 2. BARRA DE BÚSQUEDA */}
      <div className="relative w-full">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-worklyst-text-sub" size={18} />
        <input
   type="text"
   value={searchQuery}
   onChange={(e) => setSearchQuery(e.target.value)}
   placeholder="Buscar Grupos o Comunidades..."
   className="w-full bg-worklyst-surface border border-worklyst-border rounded-xl pl-10 pr-4 py-3 text-sm text-worklyst-text placeholder:text-worklyst-text-sub placeholder:font-mono focus:outline-none focus:border-primary-500 shadow-sm transition-colors"
   />
</div>

   {/* 3. TABS / NAVEGACIÓN SECUNDARIA */}
   <nav className="flex border-b border-worklyst-border">
      <button
      onClick={() => setActiveTab('mis-grupos')}
      className={`pb-2 px-2 text-sm font-semibold font-mono transition-colors relative ${
      activeTab === 'mis-grupos' ? 'text-primary-600': 'text-worklyst-text-sub'
      }`}
      >
          Mis Grupos
          {activeTab === 'mis-grupos' && (
      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-full" />
      )}
      </button>

      <button
      onClick={() => setActiveTab('explorar')}
      className={`pb-2 px-6 text-sm font-semibold font-mono transition-colors relative ${
      activeTab === 'explorar' ? 'text-primary-600': 'text-worklyst-text-sub'
      }`}
      >
          Explorar
          {activeTab === 'explorar' && (
      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-full" />
      )}
      </button>
</nav>

      {/* 4. TARJETA BIENVENIDA / ONBOARDING (Función Personalizada) */}
      {showWelcomeCard && (
<section className="bg-primary-50 border border-primary-200 rounded-2xl p-4 relative flex flex-col gap-2">
      <button
   onClick={() => setShowWelcomeCard(false)}
   className="absolute top-3 right-3 text-worklyst-text-sub hover:text-worklyst-text"
   aria-label="Cerrar mensaje">
      <X size={16} />
      </button>
         <div className="flex items-center gap-2 text-primary-700 font-bold text-sm font-mono">
      <Sparkles size={18} />
            ¡Crea tu Comunidad y Trabaja en Equipo!
</div>
      <p className="text-xs text-worklyst-text-sub leading-relaxed">
            Aquí puedes unirte a salas de discusión de tu universidad o crear tus propios grupos de proyectos para colaborar en tiempo real.
</p>
</section>
)}

      {/* 5. LISTA DE TARJETAS DE GRUPOS */}
      <section className="flex flex-col gap-4">
        {filteredGroups.map((group) => (
   <article
      key={group.id}
      className="bg-worklyst-surface border border-worklyst-border rounded-2xl p-5 shadow-sm flex flex-col gap-3"
      >
      {/* Cabecera del Grupo */}
      <div className="flex items-start gap-3">
      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
      <Bot size={22} />
      </div>
      <div className="flex flex-col">
      <h2 className="font-bold text-worklyst-text text-base leading-tight">
      {group.name}</h2>
      
      <div className="flex items-center gap-1.5 text-worklyst-text-sub font-mono text-xs mt-1">
      <Users size={14} />
      <span>{group.membersCount} Miembros</span>
         </div>
      </div>
      </div>
      {/* Descripción */}
      <p className="text-xs text-worklyst-text-sub leading-relaxed">
      {group.description}
      </p>

      {/* Acción */}
      <div className="flex justify-end pt-1">
         <button className="bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white text-xs font-mono font-medium px-5 py-2.5 rounded-xl transition-colors">
                Ver Grupo
         </button>
      </div>
   </article>
   ))}
</section>

      {/* 6. BOTÓN FLOTANTE (FAB) PARA CREAR GRUPO */}
      <button
   className="fixed bottom-24 right-5 w-14 h-14 bg-primary-600 hover:bg-primary-700 active:scale-95 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary-600/30 transition-all z-40"
   aria-label="Crear Grupo"
   >
        <Plus size={28} />
      </button>
   </main>
)
}