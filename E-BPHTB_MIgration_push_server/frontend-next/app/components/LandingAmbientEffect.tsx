"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./LandingAmbientEffect.module.css";

export default function LandingAmbientEffect() {
  const [ready, setReady] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    let rafId: number;
    let x = 0.5;
    let y = 0.5;

    const handleMove = (e: MouseEvent) => {
      x = e.clientX / window.innerWidth;
      y = e.clientY / window.innerHeight;
    };

    const update = () => {
      root.style.setProperty("--cursor-x", `${x}`);
      root.style.setProperty("--cursor-y", `${y}`);
      rafId = requestAnimationFrame(update);
    };

    window.addEventListener("mousemove", handleMove, { passive: true });
    rafId = requestAnimationFrame(update);
    setReady(true);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`${styles.ambientContainer} ${ready ? styles.ready : ""}`}
      aria-hidden
    >
      <div className={styles.spotlight} />
    </div>
  );
}
