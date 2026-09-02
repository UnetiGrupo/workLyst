import { useEffect } from "react";
import gsap from "gsap";

export function useProjectModalAnimation(
  showModal: boolean,
  overlayRef: React.RefObject<HTMLDivElement | null>,
  contentRef: React.RefObject<HTMLDivElement | null>,
) {
  useEffect(() => {
    if (showModal) {
      // animacion de entrada
      const tl = gsap.timeline();

      tl.to(overlayRef.current, {
        display: "flex",
        opacity: 1,
        duration: 0.3,
        ease: "power2.out",
      }).fromTo(
        contentRef.current,
        {
          y: 50,
          opacity: 0,
          scale: 0.95,
        },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.4,
          ease: "back.out(1.7)",
        },
        "-=0.2", //Solapamiento
      );
    } else {
      // Animación de SALIDA
      const tl = gsap.timeline();

      tl.to(contentRef.current, {
        scale: 0.9,
        opacity: 0,
        y: 10,
        duration: 0.2,
      }).to(overlayRef.current, {
        opacity: 0,
        duration: 0.3,
        onComplete: () => {
          gsap.set(overlayRef.current, { display: "none" });
        },
      });
    }
  }, [showModal, overlayRef, contentRef]);
}
