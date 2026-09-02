import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { useLayoutEffect, useRef, useCallback } from "react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function useAnimations(scopeRef: React.RefObject<HTMLElement | null>) {
  const ctx = useRef<gsap.Context>(null);

  // Initialize GSAP context on mount
  useLayoutEffect(() => {
    ctx.current = gsap.context(() => {}, scopeRef);
    return () => ctx.current?.revert(); // Cleanup on unmount
  }, [scopeRef]);

  // Execute animations within the context
  const animate = useCallback((callback: (context: gsap.Context) => void) => {
    ctx.current?.add(callback);
  }, []);

  return { animate, gsap };
}
