import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import type { User } from "@/lib/types";
import { useToast } from "./ToastContext";
import { useRouter } from "next/navigation";

interface AuthContextType {
  register: (formData: User) => Promise<void>;
  login: (formData: User) => Promise<void>;
  logout: () => Promise<void>;
  user: User | null;
  token: string | null;
  mounted: boolean;
  states: {
    loading: boolean;
    error: string | null;
    success: boolean;
  };
  updateUserLocal: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [states, setStates] = useState({
    loading: false,
    error: null,
    success: false,
  });
  const [mounted, setMounted] = useState(false);

  const router = useRouter();

  const { addToast } = useToast();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
  const APP_API_KEY = process.env.NEXT_PUBLIC_APP_API_KEY || "";

  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedUser = localStorage.getItem("usuario");
        const storedToken = localStorage.getItem("sessionToken");

        if (storedUser && storedToken) {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
        }
      } catch (err) {
        console.error("Error al recuperar la sesión:", err);
        localStorage.removeItem("usuario");
        localStorage.removeItem("sessionToken");
      } finally {
        setMounted(true);
      }
    };
    initializeAuth();
  }, []);

  const authConfig = {
    headers: {
      "Content-Type": "application/json",
      "x-api-key": APP_API_KEY,
    },
  };

  const register = async (formData: User) => {
    setStates({ loading: true, error: null, success: false });
    try {
      const response = await axios.post(
        `${API_URL}/api/auth/register`,
        formData,
        authConfig,
      );
      setUser((prevUser) => ({
        ...prevUser,
        ...response.data.usuario,
      }));
      localStorage.setItem("usuario", JSON.stringify(response.data.usuario));
      setStates((prev) => ({ ...prev, success: true }));
      addToast("Cuenta creada exitosamente. ¡Bienvenido!", "success");
      router.push("/login");
    } catch (error: any) {
      const msg =
        error.response?.data?.mensaje || "Error al registrar el usuario";
      setStates((prev) => ({ ...prev, error: msg, success: false }));
    } finally {
      setStates((prev) => ({ ...prev, loading: false }));
    }
  };

  const login = async (formData: User) => {
    setStates({ loading: true, error: null, success: false });
    try {
      const response = await axios.post(
        `${API_URL}/api/auth/login`,
        formData,
        authConfig,
      );
      const { sessionToken, usuario } = response.data;

      // Guardando datos de la respuesta (usuario)
      setUser(usuario);
      setToken(sessionToken);

      localStorage.setItem("sessionToken", sessionToken);
      localStorage.setItem("usuario", JSON.stringify(usuario));
      setStates((prev) => ({ ...prev, success: true }));
      addToast(`Bienvenido de nuevo, ${usuario.nombre}`, "success");
      router.push("/projects");
    } catch (error: any) {
      const msg = error.response?.data?.mensaje || "Error al iniciar sesión";
      setStates((prev) => ({ ...prev, error: msg, success: false }));
    } finally {
      setStates((prev) => ({ ...prev, loading: false }));
    }
  };

  const logout = async () => {
    setStates({ loading: true, error: null, success: false });
    try {
      const sessionToken = token || localStorage.getItem("sessionToken");

      if (sessionToken) {
        // Enviando token para invalidar sesión en backend
        const payload = { sessionToken };

        await axios.post(`${API_URL}/api/auth/logout`, payload, authConfig);
      }

      addToast("Sesión cerrada correctamente", "info");
    } catch (error: any) {
      console.warn("Error logout API:", error);
      // No mostramos error UI bloqueante, el usuario quiere salir de todos modos
    } finally {
      // SIEMPRE limpiamos localmente
      localStorage.removeItem("sessionToken");
      localStorage.removeItem("usuario");
      setUser(null);
      setToken(null);

      setStates((prev) => ({ ...prev, loading: false }));
      router.push("/login");
    }
  };

  const updateUserLocal = (updates: Partial<User>) => {
    setUser((prev) => {
      const updatedUser = prev ? { ...prev, ...updates } : null;
      if (updatedUser) {
        localStorage.setItem("usuario", JSON.stringify(updatedUser));
      }
      return updatedUser;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        register,
        login,
        logout,
        user,
        token,
        mounted,
        states,
        updateUserLocal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
}
