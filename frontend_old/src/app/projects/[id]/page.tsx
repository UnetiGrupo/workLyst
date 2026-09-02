import { ProjectDetails } from "@/components/tasks/ProjectDetails";

interface ProjectPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params;

  return (
    <main className="min-h-screen flex flex-col gap-4 2xl:gap-8 mt-6 2xl:mt-8 max-w-11/12 2xl:max-w-10/12 mx-auto relative">
      <ProjectDetails projectId={id} />
    </main>
  );
}
