"use client";

import { useEffect } from "react";

export default function ConsoleNoiseSuppressor() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    const originalWarn = console.warn;
    const originalError = console.error;

    const shouldSuppress = (args: unknown[]) => {
      const msg = args.map((a) => String(a ?? "")).join(" ").toLowerCase();
      return (
        msg.includes("resource") &&
        msg.includes("preload") &&
        (msg.includes("not used") || msg.includes("was preloaded"))
      );
    };

    console.warn = (...args: unknown[]) => {
      if (shouldSuppress(args)) return;
      originalWarn(...(args as Parameters<typeof originalWarn>));
    };
    console.error = (...args: unknown[]) => {
      if (shouldSuppress(args)) return;
      originalError(...(args as Parameters<typeof originalError>));
    };

    return () => {
      console.warn = originalWarn;
      console.error = originalError;
    };
  }, []);

  return null;
}

