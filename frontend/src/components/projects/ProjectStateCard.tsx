import { ProjectState } from "@/lib/types";

export function ProjectStateCard({
  titulo,
  value = 0,
  color,
  borderColor,
  aditionalInfo,
  hoverBgColor,
}: ProjectState) {
  return (
    <article
      className={`flex items-center justify-between border-px border-gray-200 rounded-2xl shadow-sm overflow-hidden hover:-translate-y-1 ${hoverBgColor} transition-all duration-200`}
    >
      <div className={`border-b-4 ${borderColor} p-4 w-full`}>
        <h3 className="text-base 2xl:text-lg text-gray-600">{titulo}</h3>
        <div className="flex items-center gap-2">
          <p className={`${color} text-3xl 2xl:text-4xl`}>{value}</p>
          {aditionalInfo && (
            <p className={color}>{value < 1 ? "" : aditionalInfo}</p>
          )}
        </div>
      </div>
    </article>
  );
}
