import { createFileRoute } from "@tanstack/react-router";
import { ActivityFeed } from "@/components/home/activity-feed";
import { AiAssistantCard } from "@/components/home/ai-assistant-card";
import { CurrentProjects } from "@/components/home/current-projects";
import { Greeting } from "@/components/home/greeting";
import { StatsGrid } from "@/components/home/stats-grid";
import { UpcomingTasks } from "@/components/home/upcoming-tasks";
import {
ACTIVITY_MOCK,
PROJECTS_MOCK,
STATS_MOCK,
TASKS_MOCK,
} from "@/data/home-mocks";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
return (

<div className="mx-auto w-full max-w-7xl px-4 py-4 pb-24 font-display text-worklyst-text md:px-6 md:pb-8 lg:px-8">
			<Greeting
   userName="Orlando"
   criticalTasksCount={4}
   productivityPercent={14}
   />
	<StatsGrid stats={STATS_MOCK} />
		<div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3 lg:grid-rows-[auto_1fr]">
		<div className="space-y-6 lg:col-span-2 lg:row-span-2">
		<UpcomingTasks tasks={TASKS_MOCK} />
		<CurrentProjects projects={PROJECTS_MOCK} />
   </div>

		<div className="space-y-6">
			<ActivityFeed activities={ACTIVITY_MOCK} />
			<AiAssistantCard />
   </div>
</div>
</div>
);
}