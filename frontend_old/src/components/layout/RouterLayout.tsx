"use client";
// Providers
import { AuthProvider } from "@/contexts/AuthContext";
// Hooks
import { usePathname } from "next/navigation";
// Componentes
import { Header } from "./Header";
import { Footer } from "./Footer";
// Providers
import { ToastProvider } from "@/contexts/ToastContext";
import { ProjectsProvider } from "@/contexts/ProjectsContext";
import { UsersProvider } from "@/contexts/UsersContext";
import { TasksProvider } from "@/contexts/TasksContext";
import { TaskStatusesProvider } from "@/contexts/TaskStatusesContext";
import { GroupsProvider } from "@/contexts/GroupContext";
// Components
import { ChatbotAgent } from "@/components/chatbot/ChatbotAgent";
import { Sidebar } from "./Sidebar";

export default function RouterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const showHeader = pathname === "/";
  const showSidebar =
    pathname !== "/" && pathname !== "/login" && pathname !== "/register";
  const showFooter = pathname !== "/login" && pathname !== "/register";

  // Mostrar chatbot solo en proyectos y tareas (según requerimiento)
  const showChatbot =
    pathname.startsWith("/projects") || pathname.startsWith("/tasks");

  return (
    <ToastProvider>
      <AuthProvider>
        <UsersProvider>
          <GroupsProvider>
            <ProjectsProvider>
              <TaskStatusesProvider>
                <TasksProvider>
                  <div className="min-h-screen flex flex-col">
                    {showHeader && <Header />}
                    {showSidebar && <Sidebar />}
                    <div
                      className={`flex-1 ${showSidebar ? "md:ml-64 2xl:ml-72" : ""}`}
                    >
                      {children}
                    </div>
                    {showChatbot && <ChatbotAgent />}
                    {showFooter && (
                      <div
                        className={`${showSidebar ? "md:ml-64 2xl:ml-72" : ""}`}
                      >
                        <Footer />
                      </div>
                    )}
                  </div>
                </TasksProvider>
              </TaskStatusesProvider>
            </ProjectsProvider>
          </GroupsProvider>
        </UsersProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
