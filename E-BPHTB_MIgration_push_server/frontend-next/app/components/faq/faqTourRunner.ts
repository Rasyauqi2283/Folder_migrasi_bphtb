"use client";

import { driver, type DriveStep } from "driver.js";
import "driver.js/dist/driver.css";
import { buildFaqTourSteps } from "./faqTourSteps";

export function faqTourAutoRunStorageKey(userId: string): string {
  return `ebphtb_faq_tour_autorun_v1_${userId}`;
}

function filterStepsToHasElement(steps: DriveStep[]): DriveStep[] {
  return steps.filter((s) => {
    if (s.element == null) return true;
    if (typeof s.element === "string") {
      return typeof document !== "undefined" && !!document.querySelector(s.element);
    }
    if (typeof s.element === "function") {
      try {
        return !!s.element();
      } catch {
        return false;
      }
    }
    return true;
  });
}

export function startFaqGuidedTour(params: {
  isAdmin: boolean;
  divisi: string | undefined;
  userId: string;
  /** Set true hanya saat tur pertama otomatis — menulis localStorage supaya tidak auto lagi */
  markFirstVisitDone: boolean;
}): void {
  if (typeof window === "undefined") return;

  const steps = filterStepsToHasElement(buildFaqTourSteps(params.isAdmin, params.divisi));
  if (steps.length === 0) return;

  const d = driver({
    showProgress: true,
    animate: true,
    overlayOpacity: 0.82,
    overlayColor: "#0f172a",
    stagePadding: 10,
    stageRadius: 12,
    allowClose: true,
    overlayClickBehavior: "close",
    smoothScroll: true,
    progressText: "{{current}} dari {{total}}",
    nextBtnText: "Lanjut",
    prevBtnText: "Kembali",
    doneBtnText: "Selesai",
    steps,
    onDestroyed: () => {
      if (!params.markFirstVisitDone) return;
      try {
        localStorage.setItem(faqTourAutoRunStorageKey(params.userId), "1");
      } catch {
        /* private mode / disabled storage */
      }
    },
  });

  d.drive();
}
