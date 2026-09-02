"use client";

import { ProjectState } from "@/lib/types";
import { Counter } from "@/components/common/Counter";

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
      className={`flex items-center justify-between border border-gray-200 rounded-2xl shadow-sm overflow-hidden hover:-translate-y-1 ${hoverBgColor} transition-all duration-300 bg-white`}
    >
      <div
        className={`border-b-4 ${borderColor} p-4 w-full flex flex-col gap-1`}
      >
        <h3 className="text-sm 2xl:text-base text-gray-500 font-medium uppercase tracking-tight">
          {titulo}
        </h3>
        <div className="flex items-baseline gap-2">
          {/* El número ahora se anima */}
          <p className={`${color} text-3xl 2xl:text-4xl font-bold`}>
            <Counter value={value} />
          </p>

          {aditionalInfo && value > 0 && (
            <p className={`${color} text-sm font-medium animate-pulse`}>
              {aditionalInfo}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
