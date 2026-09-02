"use client";

// Constants
import { LOGIN_FORM } from "@/lib/constants";
// Components
import { AuthHeader } from "@/components/auth/AuthHeader";
import { FormInput } from "@/components/auth/FormInput";
// Hooks
import { useState, useRef, useLayoutEffect } from "react";
import Link from "next/link";
// Animaciones
import { animations } from "@/lib/animations";
import { useAnimations } from "@/hooks/useAnimations";
// Contextos
import { useAuth } from "@/contexts/AuthContext";
// Tipos
import { User } from "@/lib/types";
import { Button } from "@/components/common/Button";

export default function LoginPage() {
  const [formData, setFormData] = useState<User>({
    email: "",
    password: "",
  });

  const containerRef = useRef<HTMLElement>(null);
  const { animate } = useAnimations(containerRef);
  const { login, states } = useAuth();
  const { loading } = states;

  useLayoutEffect(() => {
    animate(() => {
      animations.fadeUp(".login", {
        ease: "back.out(1.8)",
      });
    });
  }, [animate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await login(formData);
  };

  return (
    <main
      ref={containerRef}
      className="flex flex-col items-center justify-center h-screen overflow-hidden"
    >
      <div className="flex flex-col gap-2 2xl:gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-lg max-w-md w-full login">
        <header className="flex flex-col items-center gap-2">
          <img
            className="w-12 2xl:w-16"
            src="/logo.svg"
            alt="Logo de Worklyst"
          />
          <h1 className="text-xl 2xl:text-3xl font-semibold">Worklyst</h1>
        </header>

        <section
          className="flex flex-col gap-4"
          aria-label="Formulario de inicio de sesión"
        >
          <AuthHeader
            title="Bienvenido de nuevo"
            description="Ingresa tus credenciales para acceder a tus proyectos"
          />
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            {LOGIN_FORM.map((item) => (
              <FormInput
                key={item.name}
                {...item}
                onChange={(e) =>
                  setFormData({ ...formData, [item.name]: e.target.value })
                }
              />
            ))}

            <Button
              type="submit"
              className="hover:scale-105 active:scale-100"
              disabled={loading}
            >
              {loading ? "Cargando..." : "Iniciar Sesión"}
            </Button>
          </form>

          <span className="text-sm 2xl:text-base text-center mt-2 text-gray-600">
            ¿No tienes una cuenta?{" "}
            <Link href="/register" className="text-blue-500 hover:underline">
              Registrate aquí
            </Link>
          </span>
        </section>
      </div>
    </main>
  );
}
