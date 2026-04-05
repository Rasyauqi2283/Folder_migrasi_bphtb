"use client";

import { useEffect, useCallback } from "react";
import type { FAQItem } from "./faqTypes";

function BubbleIcon({ letter }: { letter: string }) {
  const ch = letter.trim() || "?";
  return (
    <span
      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 text-lg font-bold text-white shadow-lg shadow-blue-900/25 ring-2 ring-white/25 transition-transform duration-300 group-hover:scale-105"
      aria-hidden
    >
      {ch}
    </span>
  );
}

export function FAQBubbleTile({
  item,
  onSelect,
  showRoleBadges,
}: {
  item: FAQItem;
  onSelect: (id: number) => void;
  showRoleBadges: boolean;
}) {
  const title = item.question.trim();
  const short = title.length > 72 ? `${title.slice(0, 70)}…` : title;
  const initial = title.charAt(0).toUpperCase();

  return (
    <button
      type="button"
      onClick={() => onSelect(item.id)}
      className="group relative flex h-full flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white/65 p-4 text-left shadow-lg shadow-slate-900/10 backdrop-blur-md transition-all duration-300 ease-out hover:z-10 hover:-translate-y-0.5 hover:border-blue-300/80 hover:bg-white/90 hover:shadow-xl hover:shadow-slate-900/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
    >
      <div className="flex items-start gap-3">
        <BubbleIcon letter={initial} />
        <div className="min-w-0 flex-1">
          <p className="line-clamp-3 text-sm font-semibold leading-snug text-slate-900">{short}</p>
          {showRoleBadges && item.allowed_roles.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {item.allowed_roles.map((r) => (
                <span
                  key={r}
                  className="rounded-full bg-blue-100/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-800"
                >
                  {r}
                </span>
              ))}
            </div>
          )}
          {showRoleBadges && item.allowed_roles.length === 0 && (
            <p className="mt-2 text-[10px] font-medium uppercase tracking-wide text-slate-500">
              Semua divisi
            </p>
          )}
        </div>
      </div>
      <span className="pointer-events-none absolute bottom-3 right-3 text-xs font-medium text-blue-600/80 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        Lihat jawaban →
      </span>
    </button>
  );
}

export function FAQAnswerModal({
  item,
  onClose,
}: {
  item: FAQItem | null;
  onClose: () => void;
}) {
  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!item) return;
    window.addEventListener("keydown", handleKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = prev;
    };
  }, [item, handleKey]);

  if (!item) return null;

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm transition-opacity duration-300"
      role="dialog"
      aria-modal="true"
      aria-labelledby="faq-modal-title"
      onClick={onClose}
    >
      <div
        className="flex max-h-[min(90vh,800px)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/20 bg-white/85 shadow-2xl shadow-slate-950/20 backdrop-blur-xl transition-all duration-300 ease-out"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative flex shrink-0 items-start justify-between gap-3 border-b border-slate-200/90 bg-white/50 px-5 py-4">
          <h2 id="faq-modal-title" className="pr-10 text-lg font-semibold leading-snug text-slate-900">
            {item.question}
          </h2>
          <button
            type="button"
            aria-label="Tutup"
            onClick={onClose}
            className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-900/75 text-xl leading-none text-white shadow-md transition hover:bg-slate-800"
          >
            ×
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <div
            className="faq-modal-body prose-a:text-blue-600 text-[0.95rem] leading-relaxed text-slate-800 [&_a:hover]:underline [&_img]:max-w-full [&_img]:rounded-lg [&_ul]:list-disc [&_ul]:pl-5"
            dangerouslySetInnerHTML={{ __html: item.answer_html }}
          />
        </div>

        <div className="shrink-0 border-t border-slate-200/90 bg-white/60 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-slate-900 py-3 text-center text-sm font-semibold text-white shadow-lg transition hover:bg-slate-800"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
