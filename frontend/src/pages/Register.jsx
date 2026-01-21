// Constantes
import { RegisterForm } from "../lib/constants";

// Componentes
import { AuthHeader } from "../components/auth/AuthHeader";
import { FormInput } from "../components/auth/FormInput";

// Contexto
import { useAuth } from "../context/AuthContext";

// Hooks
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

export function Register() {
  const [formData, setFormData] = useState({
    usuario: "",
    email: "",
    password: "",
  });

  const { register, success, loading, user, tokens } = useAuth();

  const navigate = useNavigate();

  useEffect(() => {
    if (success && user && tokens.tokenAcceso) {
      navigate("/projects");
    }
  }, [success, user, tokens, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await register(formData);
  };

  return (
    <main className="flex flex-col items-center justify-center h-screen">
      <div className="flex flex-col gap-4 bg-white p-6 rounded-2xl shadow-lg max-w-md w-full">
        <header className="flex flex-col items-center gap-2">
          <img className="w-20" src="/worklyst.svg" alt="Logo de Worklyst" />
          <h1 className="text-3xl font-extrabold tracking-wide">Worklyst</h1>
        </header>

        <section
          className="flex flex-col gap-4"
          aria-label="Formulario de registro"
        >
          <AuthHeader
            title="Crear Cuenta"
            description="Completa tus datos para comenzar tu experiencia"
          />
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            {RegisterForm.map((item) => (
              <FormInput
                key={item.name}
                {...item}
                onChange={(e) =>
                  setFormData({ ...formData, [item.name]: e.target.value })
                }
              />
            ))}

            <button
              type="submit"
              className="py-2.5 bg-blue-400 text-white rounded-lg text-lg hover:bg-blue-500 hover:scale-105 active:scale-90 transition-all cursor-pointer mt-2"
              disabled={loading}
            >
              {loading ? "Cargando..." : "Registrarse"}
            </button>
          </form>

          <span className="text-center mt-2 text-gray-600">
            ¿Ya tienes una cuenta?{" "}
            <Link to="/login" className="text-blue-500 hover:underline">
              Inicia Sesión Aquí
            </Link>
          </span>
        </section>
      </div>
    </main>
  );
}
