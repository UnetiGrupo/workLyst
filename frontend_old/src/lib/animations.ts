import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export interface AnimationOptions extends gsap.TweenVars {
  trigger?: gsap.DOMTarget;
  start?: string | number;
  toggleActions?: string;
  once?: boolean;
  useScroll?: boolean;
  type?: "from" | "to";
}

const createAnimation = (
  target: gsap.DOMTarget,
  vars: gsap.TweenVars,
  options: AnimationOptions = {},
) => {
  if (typeof window === "undefined") return;

  const {
    useScroll = false,
    start = "top 85%",
    toggleActions = "play none none none",
    duration = 0.8,
    delay = 0,
    ease = "power2.out",
    stagger = 0,
    // Extraemos trigger de aquí para que no se meta en ...customVars
    trigger: customTrigger,
    ...customVars
  } = options;

  // 1. Configuramos las variables base (SIN propiedades de ScrollTrigger)
  const config: any = {
    ...vars,
    ...customVars,
    duration,
    delay,
    stagger,
    ease,
  };

  // 2. Solo si useScroll es true, añadimos el objeto scrollTrigger
  if (useScroll) {
    config.scrollTrigger = {
      // Si no hay customTrigger, usamos el propio target
      trigger: customTrigger || target,
      start,
      toggleActions,
    };
  }

  const { type = "from" } = options;

  if (type === "to") {
    return gsap.to(target, config);
  }
  return gsap.from(target, config);
};

// --- Constante de Animaciones Exportable ---
export const animProps = (duration: number, delay: number, ease: string) => {
  return {
    fadeUp: { y: 50, opacity: 0, duration, delay, ease },
    fadeDown: { y: -50, opacity: 0, duration, delay, ease },
    fadeLeft: { x: 50, opacity: 0, duration, delay, ease },
    fadeRight: {
      x: -50,
      opacity: 0,
      duration,
      delay,
      ease,
    },
    fadeIn: { opacity: 0, duration, delay, ease },
    fadeOut: { opacity: 0, duration: 0.3, ease: "power2.in" },
    fadeUpScale: {
      y: 50,
      opacity: 0,
      scale: 0.9,
      duration,
      delay,
      ease,
    },
  };
};

const defaultProps = animProps(0.8, 0, "power2.out");

export const animations = {
  fadeUp: (target: gsap.DOMTarget, opts?: AnimationOptions) =>
    createAnimation(target, defaultProps.fadeUp, opts),
  fadeDown: (target: gsap.DOMTarget, opts?: AnimationOptions) =>
    createAnimation(target, defaultProps.fadeDown, opts),
  fadeLeft: (target: gsap.DOMTarget, opts?: AnimationOptions) =>
    createAnimation(target, defaultProps.fadeLeft, opts),
  fadeRight: (target: gsap.DOMTarget, opts?: AnimationOptions) =>
    createAnimation(target, defaultProps.fadeRight, opts),
  fadeUpScale: (target: gsap.DOMTarget, opts?: AnimationOptions) =>
    createAnimation(target, defaultProps.fadeUpScale, opts),
  fadeIn: (target: gsap.DOMTarget, opts?: AnimationOptions) =>
    createAnimation(target, defaultProps.fadeIn, opts),
  fadeOut: (target: gsap.DOMTarget, opts?: AnimationOptions) =>
    createAnimation(target, { ...defaultProps.fadeOut, type: "to" }, opts),
  menuIn: (target: gsap.DOMTarget, opts?: AnimationOptions) => {
    const config = {
      opacity: 0,
      y: -20,
      duration: 0.3,
      ease: "power2.out",
      ...opts,
    };
    return gsap.from(target, config);
  },
  menuOut: (target: gsap.DOMTarget, opts?: AnimationOptions) => {
    const config = {
      opacity: 0,
      y: -20,
      duration: 0.3,
      ease: "power2.in",
      ...opts,
    };
    return gsap.to(target, config);
  },
};
