export interface FAQItem {
  id: number;
  question: string;
  answer_html: string;
  created_at: string;
  updated_at: string;
  expires_at: string | null;
  /** Kosong = semua divisi boleh melihat */
  allowed_roles: string[];
}

/** Nilai diselaraskan dengan `user.divisi` di AuthContext */
export const FAQ_DIVISI_OPTIONS: { value: string; label: string }[] = [
  { value: "Administrator", label: "Administrator" },
  { value: "BANK", label: "Bank" },
  { value: "Peneliti", label: "Peneliti" },
  { value: "Peneliti Validasi", label: "Peneliti Validasi" },
  { value: "LTB", label: "LTB" },
  { value: "LSB", label: "LSB" },
  { value: "Wajib Pajak", label: "Wajib Pajak" },
  { value: "Customer Service", label: "Customer Service" },
  { value: "PPAT", label: "PPAT" },
  { value: "PPATS", label: "PPATS" },
  { value: "Notaris", label: "Notaris" },
];

export function normalizeFAQItem(raw: unknown): FAQItem | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const id = Number(o.id);
  if (!Number.isFinite(id)) return null;
  const rolesRaw = o.allowed_roles;
  const allowed_roles = Array.isArray(rolesRaw)
    ? rolesRaw.filter((r): r is string => typeof r === "string")
    : [];
  return {
    id,
    question: String(o.question ?? ""),
    answer_html: String(o.answer_html ?? ""),
    created_at: String(o.created_at ?? ""),
    updated_at: String(o.updated_at ?? ""),
    expires_at: o.expires_at == null ? null : String(o.expires_at),
    allowed_roles,
  };
}

/** Filter sisi klien (API admin sudah mengembalikan semua; non-admin sudah difilter server) */
export function faqVisibleForUser(
  item: FAQItem,
  viewerDivisi: string | undefined,
  isAdmin: boolean
): boolean {
  if (isAdmin) return true;
  const allowed = item.allowed_roles ?? [];
  if (allowed.length === 0) return true;
  const v = (viewerDivisi ?? "").trim().toLowerCase();
  for (const a of allowed) {
    const al = String(a).trim().toLowerCase();
    if (al === "all" || al === "*") return true;
    if (v && al === v) return true;
  }
  return false;
}

export function stripHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function faqMatchesSearch(item: FAQItem, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  if (item.question.toLowerCase().includes(q)) return true;
  if (stripHtml(item.answer_html).toLowerCase().includes(q)) return true;
  for (const r of item.allowed_roles ?? []) {
    if (r.toLowerCase().includes(q)) return true;
  }
  return false;
}
