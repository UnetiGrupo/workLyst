export function ProgressCard({ title, value, percentage, icon, colorVariant }) {
  const variants = {
    blue: "bg-[#e0f2fe] border-blue-400 text-blue-900",
    yellow: "bg-[#fef9c3] border-yellow-400 text-yellow-900",
    red: "bg-[#fee2e2] border-red-400 text-red-900",
    green: "bg-[#dcfce7] border-green-400 text-green-900",
  };

  const textColors = {
    blue: "text-blue-800",
    yellow: "text-yellow-800",
    red: "text-red-800",
    green: "text-green-800",
  };

  const iconStyles = {
    blue: "text-blue-600 border-blue-700/60",
    yellow: "text-yellow-600 border-yellow-700/60",
    red: "text-red-600 border-red-700/60",
    green: "text-green-600 border-green-700/60",
  };

  const iconPadding = "p-1 md:p-1.5";

  return (
    <div
      className={`${variants[colorVariant]} p-5 rounded-4xl border relative overflow-hidden flex flex-col justify-between min-h-[150px] shadow-sm`}
    >
      <div className="flex justify-between items-start">
        <div>
          <p
            className={`text-[10px] md:text-xs font-bold uppercase leading-tight ${textColors[colorVariant]}`}
          >
            {title}
          </p>
          <h2 className="text-3xl font-black mt-2">{value}</h2>
          <p className="opacity-60 text-[10px] md:text-xs mt-1 font-medium">
            {percentage}
          </p>
        </div>
        <span
          className={`bg-white/50 rounded-xl text-lg border-2 shadow-sm ${iconPadding} ${iconStyles[colorVariant]}`}
        >
          {icon}
        </span>
      </div>
    </div>
  );
}
