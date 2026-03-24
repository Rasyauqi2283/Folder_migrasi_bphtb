"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getApiBase } from "../../lib/api";

interface BannerItem {
  id: number;
  image_path: string;
  link_url: string | null;
  ttl_type: string;
  ttl_value: number | null;
  expires_at: string | null;
  created_at: string;
}

/** Satu sesi tab: setelah tutup, iklan tidak muncul lagi sampai tab ditutup / session baru */
const SESSION_DISMISSED_KEY = "ebphtb_landing_banner_dismissed_v1";

const SWIPE_THRESHOLD_PX = 56;

const overlayBackdrop: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 100000,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "1rem",
  background: "rgba(0, 0, 0, 0.58)",
  backdropFilter: "blur(3px)",
};

export default function LandingBanners() {
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/banners", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data?.success && Array.isArray(data?.data)) {
          setBanners(data.data);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (loading || banners.length === 0) return;
    try {
      if (sessionStorage.getItem(SESSION_DISMISSED_KEY) === "1") return;
    } catch {
      /* private mode */
    }
    setOverlayOpen(true);
    setIndex(0);
  }, [loading, banners]);

  const closeOverlay = useCallback(() => {
    setOverlayOpen(false);
    try {
      sessionStorage.setItem(SESSION_DISMISSED_KEY, "1");
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!overlayOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [overlayOpen]);

  useEffect(() => {
    if (!overlayOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeOverlay();
      if (banners.length > 1 && e.key === "ArrowLeft") {
        setIndex((i) => (i - 1 + banners.length) % banners.length);
      }
      if (banners.length > 1 && e.key === "ArrowRight") {
        setIndex((i) => (i + 1) % banners.length);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [overlayOpen, banners.length, closeOverlay]);

  const goPrev = useCallback(() => {
    setIndex((i) => (banners.length <= 1 ? 0 : (i - 1 + banners.length) % banners.length));
  }, [banners.length]);

  const goNext = useCallback(() => {
    setIndex((i) => (banners.length <= 1 ? 0 : (i + 1) % banners.length));
  }, [banners.length]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null || touchStartY.current == null || banners.length <= 1) {
      touchStartX.current = null;
      touchStartY.current = null;
      return;
    }
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const dx = endX - touchStartX.current;
    const dy = endY - touchStartY.current;
    touchStartX.current = null;
    touchStartY.current = null;
    if (Math.abs(dx) < SWIPE_THRESHOLD_PX) return;
    if (Math.abs(dy) > Math.abs(dx) * 1.2) return;
    if (dx > 0) goPrev();
    else goNext();
  };

  if (loading || banners.length === 0 || !overlayOpen) {
    return null;
  }

  const b = banners[index];
  const base = getApiBase();
  const src = `${base}/api/uploads/banners/${b.image_path}`;

  const imageBlock = (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={src}
      alt="Iklan"
      draggable={false}
      style={{
        maxWidth: "100%",
        maxHeight: "min(68vh, 640px)",
        width: "auto",
        height: "auto",
        objectFit: "contain",
        borderRadius: 12,
        boxShadow: "0 12px 40px rgba(0,0,0,0.35)",
        userSelect: "none",
        WebkitUserSelect: "none",
        touchAction: "pan-y",
      }}
    />
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Iklan"
      style={overlayBackdrop}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "min(920px, 96vw)",
          maxHeight: "min(90vh, 900px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          background: "rgba(255,255,255,0.06)",
          borderRadius: 16,
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.45)",
          border: "1px solid rgba(255,255,255,0.14)",
          overflow: "hidden",
        }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <button
          type="button"
          onClick={closeOverlay}
          aria-label="Tutup iklan"
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            zIndex: 2,
            width: 44,
            height: 44,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "none",
            borderRadius: "50%",
            background: "rgba(0,0,0,0.55)",
            color: "#fff",
            fontSize: "1.4rem",
            lineHeight: 1,
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
          }}
        >
          ×
        </button>

        <div
          style={{
            flex: 1,
            minHeight: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "3rem 1.25rem 1rem",
            background: "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(0,0,0,0.12) 100%)",
          }}
        >
          {b.link_url ? (
            <a
              href={b.link_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "block", maxWidth: "100%", lineHeight: 0 }}
            >
              {imageBlock}
            </a>
          ) : (
            imageBlock
          )}
        </div>

        <div
          style={{
            padding: "0 1.25rem 1.25rem",
            display: "flex",
            flexDirection: "column",
            gap: 14,
            alignItems: "center",
            background: "rgba(0,0,0,0.38)",
          }}
        >
          {banners.length > 1 && (
            <>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  flexWrap: "wrap",
                  width: "100%",
                }}
              >
                <button
                  type="button"
                  onClick={goPrev}
                  style={{
                    padding: "10px 16px",
                    fontWeight: 600,
                    fontSize: "0.88rem",
                    borderRadius: 8,
                    border: "1px solid rgba(255,255,255,0.35)",
                    background: "rgba(255,255,255,0.12)",
                    color: "#fff",
                    cursor: "pointer",
                  }}
                >
                  ← Sebelumnya
                </button>
                <span style={{ color: "rgba(255,255,255,0.88)", fontSize: "0.88rem", minWidth: 56, textAlign: "center" }}>
                  {index + 1} / {banners.length}
                </span>
                <button
                  type="button"
                  onClick={goNext}
                  style={{
                    padding: "10px 16px",
                    fontWeight: 600,
                    fontSize: "0.88rem",
                    borderRadius: 8,
                    border: "1px solid rgba(255,255,255,0.35)",
                    background: "rgba(255,255,255,0.12)",
                    color: "#fff",
                    cursor: "pointer",
                  }}
                >
                  Selanjutnya →
                </button>
              </div>

              <div
                role="radiogroup"
                aria-label="Pilih iklan"
                style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}
              >
                {banners.map((_, i) => (
                  <button
                    key={banners[i].id}
                    type="button"
                    role="radio"
                    aria-checked={i === index}
                    aria-label={`Iklan ${i + 1} dari ${banners.length}`}
                    onClick={() => setIndex(i)}
                    style={{
                      width: i === index ? 12 : 10,
                      height: i === index ? 12 : 10,
                      borderRadius: "50%",
                      border: "2px solid rgba(255,255,255,0.5)",
                      background: i === index ? "#fff" : "transparent",
                      padding: 0,
                      cursor: "pointer",
                      transition: "transform 0.15s ease, background 0.15s ease",
                      transform: i === index ? "scale(1.1)" : "scale(1)",
                    }}
                  />
                ))}
              </div>

              <p style={{ margin: 0, fontSize: "0.72rem", color: "rgba(255,255,255,0.5)", textAlign: "center" }}>
                Di ponsel: geser kiri/kanan pada gambar untuk iklan lain
              </p>
            </>
          )}

          <button
            type="button"
            onClick={closeOverlay}
            style={{
              width: "100%",
              maxWidth: 320,
              padding: "12px 20px",
              fontWeight: 600,
              fontSize: "0.95rem",
              borderRadius: 10,
              border: "none",
              background: "#f3f4f6",
              color: "#111827",
              cursor: "pointer",
              boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
            }}
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
