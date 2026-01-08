export function ProjectModal() {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <article className="bg-white p-6 rounded-xl shadow-2xl border border-white/20 w-full max-w-md animate-in fade-in zoom-in duration-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Crear proyecto
        </h2>
        <form className="flex flex-col gap-4">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-gray-600">
              Nombre del Proyecto
            </span>
            <input
              type="text"
              name="name"
              className="px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              placeholder="Mi nuevo proyecto..."
            />
          </label>
          <div className="flex justify-end gap-3 mt-4">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Crear
            </button>
          </div>
        </form>
      </article>
    </div>
  );
}
