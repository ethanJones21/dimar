"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

gsap.registerPlugin(useGSAP, ScrollTrigger);

interface Props {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
  y?: number;
  as?: keyof React.JSX.IntrinsicElements;
}

export default function AnimatedStagger({
  children,
  className,
  stagger = 0.07,
  y = 28,
  as: Tag = "div",
}: Props) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const items = ref.current ? Array.from(ref.current.children) : [];
      if (!items.length) return;

      gsap.fromTo(
        items,
        { opacity: 0, y },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ref.current,
            start: "top 88%",
          },
        },
      );
    },
    { scope: ref },
  );

  return (
    // @ts-expect-error dynamic tag
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
