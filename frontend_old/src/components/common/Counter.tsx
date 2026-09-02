"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export function Counter({ value }: { value: number }) {
  const countRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = countRef.current;
    if (!node) return;

    // Animamos un obejto virtual para luego pasar el valor del texto
    const obj = { val: 0 };

    gsap.to(obj, {
      val: value,
      duration: 1.5,
      ease: "power3.out",
      onUpdate: () => {
        if (node) node.textContent = Math.round(obj.val).toString();
      },
    });
  }, [value]);

  return <span ref={countRef}>0</span>;
}
