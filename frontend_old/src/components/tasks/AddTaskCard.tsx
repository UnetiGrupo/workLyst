export function AddTaskCard({ onClick }: { onClick: () => void }) {
  return (
    <div
      className="flex items-center justify-center text-gray-500 text-sm py-2 border-2 border-gray-300 rounded border-dashed hover:text-blue-500 hover:bg-blue-100 hover:border-blue-500 transition-all duration-200 cursor-pointer"
      onClick={onClick}
    >
      Añadir Tarea
    </div>
  );
}
