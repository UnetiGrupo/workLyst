import { LoginForm } from "../lib/constants";
import { AuthHeader } from "../components/auth/AuthHeader";
import { FormInput } from "../components/auth/FormInput";
import { useAuth } from "../hooks/useAuth";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const { login, success, loading, error } = useAuth();

  useEffect(() => {
    if (success) {
      navigate("/projects");
    }
  }, [success, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(formData);
  };

  return (
    <main className="flex flex-col items-center justify-center h-screen">
      <div className="flex flex-col gap-4 bg-white p-6 rounded-2xl shadow-lg max-w-md w-full">
        <header className="flex flex-col items-center gap-2">
          <img className="w-20" src="/worklyst.svg" alt="Logo de Worklyst" />
          <h2 className="text-3xl font-extrabold tracking-wide">Worklyst</h2>
        </header>
        <div className="flex flex-col gap-4">
          <AuthHeader
            title="Bienvenido de nuevo"
            description="Ingresa tus credenciales para acceder a tus proyectos"
          />
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            {LoginForm.map((item) => (
              <FormInput
                key={item.name}
                {...item}
                onChange={(e) =>
                  setFormData({ ...formData, [item.name]: e.target.value })
                }
              />
            ))}
            {error && <p className="text-red-500 text-center">{error}</p>}
            {success && (
              <p className="text-green-500 text-center">
                Iniciaste sesión exitosamente
              </p>
            )}
            <button className="py-2.5 bg-sky-500 text-white rounded-lg text-lg
            hover:bg-sky-600 hover:scale-105 active:scale-90 transition-all
            cursor-pointer mt-2">
              {loading ? "Cargando..." : "Iniciar Sesión"}
            </button>
          </form>
          <span className="text-center mt-2 text-gray-600">
            ¿No tienes una cuenta?{" "}
            <a href="/register" className="text-blue-500 hover:underline">
              Registrate aquí
            </a>
          </span>
        </div>
      </div>
    </main>
  );
}
