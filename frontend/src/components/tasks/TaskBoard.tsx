"use client";

// Context
import { useTasks } from "@/contexts/TasksContext";
// Components
import { TaskCard } from "./TaskCard";
import { BoardColumn } from "./BoardColumn";
import { AddTaskCard } from "./AddTaskCard";
// Icons
import { CheckCircle, CircleDashed, Clock } from "lucide-react";
import { Task } from "@/lib/types";

interface TaskBoardProps {
  openModal: () => void;
  tasks: Task[];
}

export function TaskBoard({ openModal, tasks }: TaskBoardProps) {
  const columns = [
    {
      id: "pending",
      title: "Por Hacer",
      icon: CircleDashed,
      color: "text-yellow-500",
    },
    {
      id: "in-progress",
      title: "En Curso",
      icon: Clock,
      color: "text-blue-500",
    },
    {
      id: "completed",
      title: "Completadas",
      icon: CheckCircle,
      color: "text-green-500",
    },
  ];

  return (
    <article className="grid grid-cols-3 gap-6 2xl:gap-16 w-full  rounded-lg py-4 h-[calc(100vh-18rem)]">
      {columns.map((column) => {
        const columnTasks = tasks.filter((task) => task.estado === column.id);
        return (
          <BoardColumn key={column.id} {...column} value={columnTasks.length}>
            <div className="flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
              {columnTasks.map((task) => (
                <TaskCard key={task.id} {...task} />
              ))}
              {column.id === "pending" && <AddTaskCard onClick={openModal} />}
            </div>
          </BoardColumn>
        );
      })}
    </article>
  );
}
