import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
// Pages
import App from "./App";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Projects } from "./pages/Projects";
import { ProjectDetail } from "./pages/[id]";
import { Dashboard } from "./pages/Dashboard";
// Providers
import { AuthProvider } from "./context/AuthContext";
import { ProjectsProvider } from "./context/ProjectsContext";
import { ToastProvider } from "./context/ToastContext";
// Componentes
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ToastProvider>
      <AuthProvider>
        <ProjectsProvider>
          <BrowserRouter>
            <Routes>
              {/* Rutas Publicas con Layout */}
              <Route element={<Layout />}>
                <Route path="/" element={<App />} />

                {/* Rutas Protegidas */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/projects" element={<Projects />} />
                  <Route path="/projects/:id" element={<ProjectDetail />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                </Route>
              </Route>

              {/* Rutas de Autenticacion (Sin Layout) */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Ruta para manejar errores 404 */}
              <Route path="*" element={<h1>404 - Página no encontrada</h1>} />
            </Routes>
          </BrowserRouter>
        </ProjectsProvider>
      </AuthProvider>
    </ToastProvider>
  </StrictMode>,
);
