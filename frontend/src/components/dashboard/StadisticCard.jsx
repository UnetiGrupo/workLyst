export function StadisticCard({ name, percentage }) {
  const progressStyle = {
    width: `${percentage}%`,
  };

  return (
    <>
      <div className="mb-6 last:mb-0">
        <div className="flex justify-between text-xs md:text-sm font-bold mb-2.5">
          <span className="text-gray-700">{name}</span>
          <span className="text-blue-600">{percentage}%</span>
        </div>

        <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden border border-gray-50">
          <div
            className="bg-blue-500 h-full rounded-full transition-all duration-700 ease-out shadow-inner"
            style={progressStyle}
          ></div>
        </div>
      </div>
    </>
  );
}
