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

  return (
    <ToastProvider>
      <AuthProvider>
        <UsersProvider>
          <ProjectsProvider>
            <TasksProvider>
              <div className="min-h-screen flex flex-col">
                {showHeader && <Header />}
                {showSidebar && <Sidebar />}
                <div
                  className={`flex-1 ${showSidebar ? "ml-64 2xl:ml-72" : ""}`}
                >
                  {children}
                </div>
                <ChatbotAgent />
                {showFooter && (
                  <div className={`${showSidebar ? "ml-64 2xl:ml-72" : ""}`}>
                    <Footer />
                  </div>
                )}
              </div>
            </TasksProvider>
          </ProjectsProvider>
        </UsersProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
