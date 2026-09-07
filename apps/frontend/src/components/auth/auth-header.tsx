export function AuthHeader() {
  return (
    <header className="flex items-center gap-2">
      <img className="w-8" src="/images/logo.svg" alt="Logo de Worklyst" />
      <div className="flex flex-col">
        <h2 className="text-base font-black">Worklyst</h2>
        <h4 className="text-xs text-gray-300">
          Gestor de proyecto inteligente
        </h4>
      </div>
    </header>
  );
}
