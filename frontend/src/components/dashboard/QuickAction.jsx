export function QuickAction({ label, icon, variant = "secondary", onClick }) {
  const variants = {
    secondary: "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-200",

    primary:
      "bg-sky-500 border-[#63b3ed] text-white shadow-lg shadow-blue-100 hover:bg-sky-600",
  };

  return (
    <>
      <button
        onClick={onClick}
        className={`w-full py-4 px-4 rounded-2xl text-sm font-bold border
  transition-all flex items-center justify-center gap-3 ${variants[variant]}
  `}
      >
        <span className="text-lg">{icon}</span>
        {label}
      </button>
    </>
  );
}
