"use client";

// Hooks
import { useEffect, useRef } from "react";
import { useAnimations } from "@/hooks/useAnimations";
// Componentes
import Link from "next/link";
import { FeatureCard } from "@/components/home/FeatureCard";
// Iconos
import { ArrowRight } from "lucide-react";
// Constantes
import { FEATURES } from "@/lib/constants";
// Animaciones
import { animations } from "@/lib/animations";
import { Button } from "@/components/common/Button";

export default function Home() {
  const container = useRef<HTMLElement>(null);

  const { animate } = useAnimations(container);

  animate(() => {
    animations.fadeUp(".hero-text", {
      duration: 0.7,
      delay: 0,
      stagger: 0.2,
      trigger: ".container",
    });
    animations.fadeLeft(".image");
    animations.fadeUpScale(".feature-card", {
      useScroll: true,
      duration: 0.6,
      stagger: 0.2,
      trigger: ".feature-grid",
    });
    animations.fadeLeft(".cta", {
      useScroll: true,
      delay: 1,
      stagger: 0.2,
      trigger: ".cta-container",
    });
  });

  return (
    <main className="max-w-11/12 2xl:max-w-10/12 mx-auto" ref={container}>
      {/* Hero Section */}
      <section
        className="flex flex-col md:flex-row items-center justify-between gap-4 py-8"
        aria-label="Introducción a Worklyst"
      >
        <div className="flex flex-col gap-2 2xl:gap-4 flex-1 max-w-2xl">
          <span className="w-fit inline-flex items-center gap-2 bg-blue-100 text-blue-600 px-2 2xl:px-4 py-1 2xl:py-1.5 rounded-full text-xs 2xl:text-sm font-semibold">
            Potenciado por IA
          </span>
          <h1
            className="text-4xl md:text-5xl 2xl:text-6xl font-extrabold text-slate-900 
            leading-tight hero-text"
          >
            Gestión de tareas{" "}
            <span className="text-blue-400">Inteligentes</span> para equipos
          </h1>
          <p className="text-slate-500 text-base 2xl:text-xl leading-relaxed max-w-lg hero-text">
            Potencia la colaboración de tu equipo con IA. Organiza, asigna y
            completa proyectos de manera más eficiente que nunca.
          </p>
          <div className="flex flex-wrap gap-4 hero-text">
            <Button href="/register">
              Comenzar Gratis
              <ArrowRight className="size-5" />
            </Button>
          </div>
        </div>
        <div className="flex-1 w-full max-w-md 2xl:max-w-xl">
          <div className="relative image">
            <img
              src="/images/IA-en-clase.webp"
              alt="Ilustración de equipo colaborando con IA en una oficina moderna"
              className="w-full h-auto rounded-2xl shadow-xl bg-purple-400 p-1.5"
              loading="eager"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        className="flex flex-col gap-4 2xl:gap-6"
        aria-labelledby="features-title"
      >
        <div className="flex flex-col gap-2 text-center">
          <h2
            id="features-title"
            className="text-3xl 2xl:text-4xl font-bold text-slate-900"
          >
            Todo lo que necesitas para ser productivo.
          </h2>
          <p className="text-slate-500 text-base 2xl:text-lg">
            Herramientas inteligentes que se adaptan a tu forma de trabajo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 feature-grid">
          {FEATURES.map((feature) => (
            <div key={feature.id} className="feature-card" aria-hidden="true">
              <FeatureCard
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                iconColor={feature.iconColor}
                iconBgColor={feature.iconBgColor}
              />
            </div>
          ))}

          <article
            className="md:col-span-1 lg:col-span-3 bg-white
            p-8 rounded-2xl flex flex-col justify-center items-start cta-container"
          >
            <h3 className="text-2xl font-bold mb-2 cta">
              ¿Listo para transformar tu productividad?
            </h3>
            <p className="text-gray-500 mb-6 cta">
              Únete a miles de equipos que ya estan trabajando de manera más
              inteligente.
            </p>
            <div aria-hidden="true" className="cta">
              <Button href="/register">
                Comenzar ahora
                <ArrowRight className="size-5" />
              </Button>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
