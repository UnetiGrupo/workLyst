import { Plus } from "lucide-react";

interface CreateProjectCardProps {
  onClick?: () => void;
}

export function CreateProjectCard({ onClick }: CreateProjectCardProps) {
  return (
    <article
      onClick={onClick}
      className="flex flex-col gap-4 items-center justify-center p-4 2xl:p-8 h-full border-2 border-dashed rounded-xl cursor-pointer group hover:bg-blue-100/20 hover:border-blue-500 transition-all duration-300"
    >
      <Plus className="p-3 size-10 2xl:size-14 bg-gray-200 rounded-full text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-500 transition-all duration-300" />
      <div className="flex flex-col items-center gap-2">
        <h4 className="text-lg 2xl:text-xl font-medium">
          Crear nuevo proyecto
        </h4>
        <p className="text-gray-500 text-center text-sm 2xl:text-base">
          Comienza un nuevo proyecto colaborativo y gestiona tus tareas de
          manera eficiente.
        </p>
      </div>
    </article>
  );
}
