"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
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

export default function LandingBanners() {
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [loading, setLoading] = useState(true);

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
    return () => { cancelled = true; };
  }, []);

  if (loading || banners.length === 0) return null;

  return (
    <section
      className="landing-banners"
      style={{
        width: "100%",
        maxWidth: 1200,
        margin: "0 auto 1.5rem",
        padding: "0 5%",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 16,
          overflowX: "auto",
          paddingBottom: 8,
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {banners.map((b) => {
          const base = getApiBase();
          const src = `${base}/api/uploads/banners/${b.image_path}`;
          const content = (
            <div
              key={b.id}
              style={{
                flex: "0 0 auto",
                width: "min(320px, 85vw)",
                borderRadius: 12,
                overflow: "hidden",
                border: "1px solid rgba(65, 90, 119, 0.3)",
                boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
              }}
            >
              <Image
                src={src}
                alt="Banner"
                width={320}
                height={160}
                sizes="(max-width: 768px) 85vw, 320px"
                loading="lazy"
                style={{ width: "100%", height: "auto", display: "block", objectFit: "cover" }}
                unoptimized
              />
            </div>
          );
          if (b.link_url) {
            return (
              <a
                key={b.id}
                href={b.link_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                {content}
              </a>
            );
          }
          return content;
        })}
      </div>
    </section>
  );
}
