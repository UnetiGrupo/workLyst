import { Folder, CheckCircle2, ClipboardList, Clock } from "lucide-react";
import type { StatItem } from "@/data/home-mocks";

const iconMap = {
  Folder,
  CheckCircle2,
  ClipboardList,
  Clock,
};

interface StatsGridProps {
  stats: StatItem[];
}

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <section className="my-4 grid grid-cols-2 gap-3">
      {stats.map((stat) => {
        const IconComponent =
          iconMap[stat.iconName as keyof typeof iconMap] || Folder;

        return (
          <div
            key={stat.id}
            className="flex flex-col justify-between rounded-2xl border border-worklyst-border bg-worklyst-surface p-4 shadow-xs"
          >
            <div className="mb-3 text-primary-600">
              <IconComponent className="h-6 w-6 stroke-[1.75]" />
            </div>
            <div>
              <span className="block text-[11px] font-bold tracking-wider text-worklyst-text-sub uppercase">
                {stat.title}
              </span>
              <span className="font-mono text-2xl font-extrabold text-worklyst-text">
                {stat.count}
              </span>
            </div>
          </div>
        );
      })}
    </section>
  );
}
