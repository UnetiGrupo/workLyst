import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/home/header";
import { Greeting } from "@/components/home/greeting";
import { StatsGrid } from "@/components/home/stats-grid";
import { UpcomingTasks } from "@/components/home/upcoming-tasks";
import { CurrentProjects } from "@/components/home/current-projects";
import { STATS_MOCK, TASKS_MOCK, PROJECTS_MOCK } from "@/data/home-mocks";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <div className="mx-auto min-h-screen w-full max-w-7xl px-4 pb-20 pt-2 md:px-8 2xl:px-12 font-display text-worklyst-text">
      <Header />
      <main>
        <Greeting userName="Pedro" criticalTasksCount={4} />
        <StatsGrid stats={STATS_MOCK} />
        <UpcomingTasks tasks={TASKS_MOCK} />
        <CurrentProjects projects={PROJECTS_MOCK} />
      </main>
    </div>
  );
}
