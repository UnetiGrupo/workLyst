import { LayoutDashboard, FolderKanban, Users, MessageSquare, Settings } from 'lucide-react'

export function BottomNav() {
return (
<nav className="fixed bottom-0 left-0 right-0 bg-blue-100 border-t border-worklyst-border pb-4 pt-2 px-2 flex justify-between items-center z-50 rounded-t-3xl shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">

      <button className="flex flex-col items-center justify-center w-[72px] h-14 bg-primary-600 text-white rounded-2xl transition-transform active:scale-95">
        <LayoutDashboard className="w-6 h-6 mb-1" />
        <span className="text-[10px] font-bold font-display">Home</span>
      </button>

      <button className="flex flex-col items-center justify-center w-[72px] h-14 text-worklyst-text-sub hover:text-primary-600 transition-colors active:scale-95">
        <FolderKanban className="w-6 h-6 mb-1" />
        <span className="text-[10px] font-medium font-display">Proyectos</span>
      </button>

      <button className="flex flex-col items-center justify-center w-[72px] h-14 text-worklyst-text-sub hover:text-primary-600 transition-colors active:scale-95">
        <Users className="w-6 h-6 mb-1" />
        <span className="text-[10px] font-medium font-display">Grupos</span>
      </button>

      <button className="flex flex-col items-center justify-center w-[72px] h-14 text-worklyst-text-sub hover:text-primary-600 transition-colors active:scale-95">
        <MessageSquare className="w-6 h-6 mb-1" />
        <span className="text-[10px] font-medium font-display">Chats</span>
      </button>

      <button className="flex flex-col items-center justify-center w-[72px] h-14 text-worklyst-text-sub hover:text-primary-600 transition-colors active:scale-95">
        <Settings className="w-6 h-6 mb-1" />
        <span className="text-[10px] font-medium font-display">Ajustes</span>
      </button>
</nav>
)
}