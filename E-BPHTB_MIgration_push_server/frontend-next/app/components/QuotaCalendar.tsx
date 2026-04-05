"use client";

import { useMemo, useState } from "react";

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function addMonths(d: Date, delta: number) {
  return new Date(d.getFullYear(), d.getMonth() + delta, 1);
}

const MONTH_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const WEEK_DAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

export default function QuotaCalendar({
  value,
  onChange,
}: {
  value: Date;
  onChange: (next: Date) => void;
}) {
  const [viewMonth, setViewMonth] = useState<Date>(() => startOfMonth(value));
  const today = useMemo(() => new Date(), []);

  const { year, monthIdx, dates } = useMemo(() => {
    const year = viewMonth.getFullYear();
    const monthIdx = viewMonth.getMonth();
    const firstDay = new Date(year, monthIdx, 1).getDay();
    const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();
    const out: (Date | null)[] = [];
    for (let i = 0; i < firstDay; i++) out.push(null);
    for (let d = 1; d <= daysInMonth; d++) out.push(new Date(year, monthIdx, d));
    return { year, monthIdx, dates: out };
  }, [viewMonth]);

  return (
    <div
      style={{
        minWidth: 240,
        background: "var(--card_bg_grey)",
        border: "1px solid var(--border_color)",
        borderRadius: 12,
        padding: 14,
        boxShadow: "var(--shadow_card)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
        <button
          type="button"
          onClick={() => setViewMonth((m) => addMonths(m, -1))}
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            border: "1px solid var(--border_color)",
            background: "transparent",
            cursor: "pointer",
            fontWeight: 800,
          }}
          aria-label="Bulan sebelumnya"
        >
          ←
        </button>
        <div style={{ fontSize: 14, fontWeight: 800, color: "var(--color_font_main)" }}>
          {MONTH_NAMES[monthIdx]} {year}
        </div>
        <button
          type="button"
          onClick={() => setViewMonth((m) => addMonths(m, 1))}
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            border: "1px solid var(--border_color)",
            background: "transparent",
            cursor: "pointer",
            fontWeight: 800,
          }}
          aria-label="Bulan berikutnya"
        >
          →
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6, fontSize: 12 }}>
        {WEEK_DAYS.map((w) => (
          <div
            key={w}
            style={{
              color: "var(--color_font_main_muted)",
              textAlign: "center",
              fontWeight: 700,
              padding: "4px 0",
            }}
          >
            {w}
          </div>
        ))}
        {dates.map((d, i) => {
          const isToday = d ? sameDay(d, today) : false;
          const isSelected = d ? sameDay(d, value) : false;
          return (
            <button
              key={i}
              type="button"
              disabled={d == null}
              onClick={() => d && onChange(d)}
              style={{
                textAlign: "center",
                padding: "8px 0",
                borderRadius: 10,
                border: isSelected ? "2px solid var(--accent)" : "1px solid transparent",
                color: d == null ? "transparent" : isSelected ? "var(--accent)" : "var(--color_font_main)",
                background: isToday ? "rgba(14,165,233,0.10)" : "transparent",
                fontWeight: isSelected ? 900 : isToday ? 800 : 600,
                cursor: d == null ? "default" : "pointer",
              }}
            >
              {d?.getDate() ?? ""}
            </button>
          );
        })}
      </div>

      <div style={{ marginTop: 10, fontSize: 12, color: "var(--color_font_main_muted)" }}>
        Klik tanggal untuk filter kuota.
      </div>
    </div>
  );
}

