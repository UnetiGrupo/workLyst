// Tipos
import type { Feature } from "@/lib/types";

export function FeatureCard({
  icon: Icon,
  title,
  description,
  iconColor,
  iconBgColor,
}: Feature) {
  return (
    <article className="flex flex-col gap-2 bg-white border border-slate-100 p-8 h-full rounded-2xl shadow-lg hover:-translate-y-2 hover:shadow-xl transition-all duration-300 group">
      <div
        className={`size-10 rounded-lg flex items-center justify-center ${iconBgColor} group-hover:rotate-12 transition-all duration-300`}
        aria-hidden="true"
      >
        <Icon className={`size-6 ${iconColor}`} />
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="text-xl 2xl:text-2xl font-bold">{title}</h3>
        <p className="text-slate-500 text-xs 2xl:text-sm">{description}</p>
      </div>
    </article>
  );
}
