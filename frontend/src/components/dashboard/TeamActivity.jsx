export function TeamActivity({ name, action, time, avatarText }) {
  return (
    <>
      <div className="flex gap-4 pb-6 last:pb-0 group">
        <div className="w-10 h-10 bg-gray-100 rounded-full shrink-0 flex items-center justify-center text-gray-500 font-bold text-xs border border-gray-200 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
          {avatarText}
        </div>

        <div className="flex flex-col">
          <p className="text-sm text-gray-700 leading-snug">
            <span className="font-bold text-gray-900">{name}</span> {action}
          </p>
          <span className="text-[11px] text-gray-400 mt-1 font-medium italic">
            Hace {time}
          </span>
        </div>
      </div>
    </>
  );
}
