import { FileText, ShoppingBag, Database } from "lucide-react";
import type { ProjectItem } from "@/data/home-mocks";

interface CurrentProjectsProps {
  projects: ProjectItem[];
}

const getProjectIcon = (index: number) => {
  const icons = [
    <FileText key="1" className="w-6 h-6 text-primary-600" />,
    <ShoppingBag key="2" className="w-6 h-6 text-red-400" />,
    <Database key="3" className="w-6 h-6 text-slate-500" />,
  ];
  return icons[index % icons.length];
};

export function CurrentProjects({ projects }: CurrentProjectsProps) {
  return (
    <section className="mt-8">
      <h3 className="text-worklyst-text text-lg font-bold mb-4 font-display">
        Proyectos Actuales
      </h3>
      <div className="flex flex-col gap-3 lg:grid lg:grid-cols-2 xl:grid-cols-3">
        {projects.map((project, index) => {
          return (
            <article
              key={project.id}
              className="flex items-center justify-between bg-worklyst-surface p-4 rounded-2xl shadow-sm border border-worklyst-border"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-primary-50">
                  {getProjectIcon(index)}
                </div>
                <div className="flex flex-col">
                  <h4 className="text-worklyst-text font-bold text-[15px] font-display">
                    {project.title}
                  </h4>
                  <p className="text-worklyst-text-sub text-xs font-display mt-0.5">
                    {project.statusText}
                  </p>
                </div>
              </div>

              <div className="flex items-center -space-x-2">
                <div className="w-7 h-7 rounded-full bg-gray-200 border-2 border-worklyst-surface flex items-center justify-center text-[10px] font-bold text-worklyst-text z-20">
                  C
                </div>
                <div className="w-7 h-7 rounded-full bg-gray-300 border-2 border-worklyst-surface flex items-center justify-center text-[10px] font-bold text-worklyst-text z-10">
                  C
                </div>
                <div className="w-7 h-7 rounded-full bg-worklyst-tiza-bg border-2 border-worklyst-surface flex items-center justify-center text-[10px] font-bold text-worklyst-text-sub z-0">
                  +{project.membersCount}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
