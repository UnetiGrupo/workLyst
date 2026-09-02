"use client";

// Constants
import { REGISTER_FORM } from "@/lib/constants";
// Components
import { AuthHeader } from "@/components/auth/AuthHeader";
import { FormInput } from "@/components/auth/FormInput";
import Link from "next/link";
// Context
import { useAuth } from "@/contexts/AuthContext";
// Hooks
import { useState, useRef, useLayoutEffect } from "react";
// Animaciones
import { animations } from "@/lib/animations";
import { useAnimations } from "@/hooks/useAnimations";
import { Button } from "@/components/common/Button";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    usuario: "",
    email: "",
    password: "",
  });

  const { register, states } = useAuth();
  const containerRef = useRef<HTMLElement>(null);
  const { animate } = useAnimations(containerRef);

  useLayoutEffect(() => {
    animate(() => {
      animations.fadeUp(".register", {
        ease: "back.out(1.8)",
      });
    });
  }, [animate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await register(formData);
  };

  return (
    <main
      ref={containerRef}
      className="flex flex-col items-center justify-center h-screen overflow-hidden"
    >
      <div className="flex flex-col gap-2 2xl:gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-lg max-w-md w-full register">
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
          aria-label="Formulario de registro"
        >
          <AuthHeader
            title="Crear Cuenta"
            description="Completa tus datos para comenzar tu experiencia"
          />
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            {REGISTER_FORM.map((item) => (
              <FormInput
                key={item.name}
                {...item}
                onChange={(e) =>
                  setFormData({ ...formData, [item.name]: e.target.value })
                }
              />
            ))}

            <Button
              className="hover:scale-105 active:scale-100"
              type="submit"
              disabled={states.loading}
            >
              {states.loading ? "Cargando..." : "Registrarse"}
            </Button>
          </form>

          <span className="text-sm 2xl:text-base text-center mt-2 text-gray-600">
            ¿Ya tienes una cuenta?{" "}
            <Link href="/login" className="text-blue-500 hover:underline">
              Inicia Sesión Aquí
            </Link>
          </span>
        </section>
      </div>
    </main>
  );
}
