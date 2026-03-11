module.exports = [
"[project]/app/(protected)/admin/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>AdminDashboardPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$context$2f$AuthContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/context/AuthContext.tsx [app-ssr] (ecmascript)");
(()=>{
    const e = new Error("Cannot find module '../components/GreetingCard'");
    e.code = 'MODULE_NOT_FOUND';
    throw e;
})();
"use client";
;
;
;
;
;
const CARD_STYLES = {
    wrapper: {
        background: "var(--card_bg)",
        border: "1px solid var(--card_border)",
        borderRadius: 12,
        padding: 24,
        boxShadow: "var(--card_shadow)",
        transition: "all 0.3s ease",
        cursor: "pointer",
        position: "relative",
        overflow: "hidden"
    },
    iconBlue: {
        background: "linear-gradient(135deg, var(--accent_hover) 0%, var(--accent) 100%)"
    },
    iconGreen: {
        background: "linear-gradient(135deg, #059669 0%, #047857 100%)"
    },
    iconPurple: {
        background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)"
    },
    iconOrange: {
        background: "linear-gradient(135deg, #d97706 0%, #b45309 100%)"
    },
    iconGold: {
        background: "linear-gradient(135deg, #d97706 0%, #b45309 100%)"
    }
};
function CalendarWidget() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const monthNames = [
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
        "Desember"
    ];
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = now.getDate();
    const weekDays = [
        "Min",
        "Sen",
        "Sel",
        "Rab",
        "Kam",
        "Jum",
        "Sab"
    ];
    const dates = [];
    const startOffset = firstDay;
    for(let i = 0; i < startOffset; i++)dates.push(null);
    for(let d = 1; d <= daysInMonth; d++)dates.push(d);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            minWidth: 220,
            background: "var(--card_bg)",
            border: "1px solid var(--card_border)",
            borderRadius: 12,
            padding: 16,
            boxShadow: "var(--card_shadow)"
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                style: {
                    margin: "0 0 12px",
                    fontSize: 15,
                    color: "var(--color_font_main)",
                    fontWeight: 700,
                    letterSpacing: "0.02em"
                },
                children: [
                    monthNames[month],
                    " ",
                    year
                ]
            }, void 0, true, {
                fileName: "[project]/app/(protected)/admin/page.tsx",
                lineNumber: 83,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: "grid",
                    gridTemplateColumns: "repeat(7, 1fr)",
                    gap: 6,
                    fontSize: 13
                },
                children: [
                    weekDays.map((w)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                color: "var(--color_font_main_muted)",
                                textAlign: "center",
                                fontWeight: 600,
                                padding: "4px 0"
                            },
                            children: w
                        }, w, false, {
                            fileName: "[project]/app/(protected)/admin/page.tsx",
                            lineNumber: 96,
                            columnNumber: 11
                        }, this)),
                    dates.map((d, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                textAlign: "center",
                                padding: "8px 0",
                                borderRadius: 8,
                                color: d === today ? "#fff" : "var(--color_font_main)",
                                background: d === today ? "var(--accent)" : "transparent",
                                fontWeight: d === today ? 700 : 500
                            },
                            children: d ?? ""
                        }, i, false, {
                            fileName: "[project]/app/(protected)/admin/page.tsx",
                            lineNumber: 109,
                            columnNumber: 11
                        }, this))
                ]
            }, void 0, true, {
                fileName: "[project]/app/(protected)/admin/page.tsx",
                lineNumber: 94,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/(protected)/admin/page.tsx",
        lineNumber: 73,
        columnNumber: 5
    }, this);
}
function AdminDashboardPage() {
    const { user } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$context$2f$AuthContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAuth"])();
    const [stats, setStats] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        pending: 0,
        complete: 0,
        statusPpat: 0,
        validasiQr: 0
    });
    const [taxSummary, setTaxSummary] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [validationStats, setValidationStats] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const load = async ()=>{
            try {
                const currentYear = new Date().getFullYear();
                const [pendingRes, completeRes, ppatStatsRes, qrRes, taxRes, validationRes] = await Promise.all([
                    fetch("/api/users/pending", {
                        credentials: "include"
                    }).catch(()=>null),
                    fetch("/api/users/complete", {
                        credentials: "include"
                    }).catch(()=>null),
                    fetch("/api/admin/notification-warehouse/ppat-users-stats", {
                        credentials: "include"
                    }).catch(()=>null),
                    fetch("/api/admin/validate-qr-search?page=1&limit=1", {
                        credentials: "include"
                    }).catch(()=>null),
                    fetch(`/api/admin/notification-warehouse/ppat-renewal?page=1&limit=1&jangka_waktu=12&tahun=${currentYear}`, {
                        credentials: "include"
                    }).catch(()=>null),
                    fetch("/api/admin/validation-statistics", {
                        credentials: "include"
                    }).catch(()=>null)
                ]);
                let pendingCount = 0;
                if (pendingRes?.ok) {
                    const data = await pendingRes.json().catch(()=>[]);
                    pendingCount = Array.isArray(data) ? data.length : 0;
                }
                let completeCount = 0;
                if (completeRes?.ok) {
                    const data = await completeRes.json().catch(()=>[]);
                    completeCount = Array.isArray(data) ? data.length : 0;
                }
                let ppatTotal = 0;
                if (ppatStatsRes?.ok) {
                    const j = await ppatStatsRes.json().catch(()=>({}));
                    if (j?.success && j?.data) ppatTotal = j.data.total ?? 0;
                }
                let qrTotal = 0;
                if (qrRes?.ok) {
                    const j = await qrRes.json().catch(()=>({}));
                    if (j?.success && j?.pagination) qrTotal = j.pagination.total ?? 0;
                }
                setStats({
                    pending: pendingCount,
                    complete: completeCount,
                    statusPpat: ppatTotal,
                    validasiQr: qrTotal
                });
                if (taxRes?.ok) {
                    const data = await taxRes.json().catch(()=>({}));
                    if (data?.success && data?.summary) {
                        setTaxSummary({
                            total_bphtb_formatted: data.summary.total_bphtb_formatted || "Rp 0",
                            total_transaksi: Number(data.summary.total_transaksi || 0)
                        });
                    }
                }
                if (validationRes?.ok) {
                    const data = await validationRes.json().catch(()=>({}));
                    setValidationStats(data);
                }
            } finally{
                setLoading(false);
            }
        };
        load();
    }, []);
    const cards = [
        {
            label: "Verifikasi Data User",
            value: stats.pending,
            sub: "User menunggu verifikasi",
            href: "/admin/data-user/pending",
            icon: "👤",
            iconClass: "orange"
        },
        {
            label: "Data User",
            value: stats.complete,
            sub: "Total user terverifikasi",
            href: "/admin/data-user/complete",
            icon: "👥",
            iconClass: "green"
        },
        {
            label: "Status PPAT",
            value: stats.statusPpat,
            sub: "Total PPAT/PPATS",
            href: "/admin/referensi/status-ppat",
            icon: "📋",
            iconClass: "blue"
        },
        {
            label: "Validasi QR",
            value: stats.validasiQr,
            sub: "Total validasi QR",
            href: "/admin/referensi/validasi-qr",
            icon: "🔍",
            iconClass: "purple"
        }
    ];
    const iconStyle = (c)=>c.iconClass === "orange" ? CARD_STYLES.iconOrange : c.iconClass === "green" ? CARD_STYLES.iconGreen : c.iconClass === "purple" ? CARD_STYLES.iconPurple : CARD_STYLES.iconBlue;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            maxWidth: 1400,
            margin: "0 auto"
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(GreetingCard, {
                nama: user?.nama || user?.userid || "Pengguna",
                pageLabel: user?.divisi || "Admin",
                subtitle: "Ringkasan aktivitas dan statistik administrasi Anda",
                gender: user?.gender ?? undefined,
                rightContent: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(CalendarWidget, {}, void 0, false, {
                    fileName: "[project]/app/(protected)/admin/page.tsx",
                    lineNumber: 222,
                    columnNumber: 23
                }, void 0)
            }, void 0, false, {
                fileName: "[project]/app/(protected)/admin/page.tsx",
                lineNumber: 217,
                columnNumber: 7
            }, this),
            loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                style: {
                    color: "var(--color_font_main_muted)",
                    marginBottom: 24
                },
                children: "Memuat..."
            }, void 0, false, {
                fileName: "[project]/app/(protected)/admin/page.tsx",
                lineNumber: 227,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                    gap: 20,
                    marginBottom: 24
                },
                children: cards.map((c)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                        href: c.href,
                        style: {
                            ...CARD_STYLES.wrapper,
                            borderLeft: "4px solid transparent",
                            borderLeftColor: c.iconClass === "orange" ? "#d97706" : c.iconClass === "green" ? "#059669" : c.iconClass === "purple" ? "#7c3aed" : "var(--accent)",
                            textDecoration: "none",
                            color: "var(--color_font_main)"
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 10,
                                    marginBottom: 16
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            width: 40,
                                            height: 40,
                                            borderRadius: 10,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: 20,
                                            ...iconStyle(c)
                                        },
                                        children: c.icon
                                    }, void 0, false, {
                                        fileName: "[project]/app/(protected)/admin/page.tsx",
                                        lineNumber: 250,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            fontSize: 16,
                                            fontWeight: 600
                                        },
                                        children: c.label
                                    }, void 0, false, {
                                        fileName: "[project]/app/(protected)/admin/page.tsx",
                                        lineNumber: 264,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/(protected)/admin/page.tsx",
                                lineNumber: 249,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontSize: 36,
                                    fontWeight: 700,
                                    margin: "8px 0",
                                    color: "var(--color_font_main)"
                                },
                                children: c.value
                            }, void 0, false, {
                                fileName: "[project]/app/(protected)/admin/page.tsx",
                                lineNumber: 266,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontSize: 14,
                                    color: "var(--color_font_main_muted)",
                                    marginBottom: 12
                                },
                                children: c.sub
                            }, void 0, false, {
                                fileName: "[project]/app/(protected)/admin/page.tsx",
                                lineNumber: 267,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    borderTop: "1px solid var(--card_border)",
                                    paddingTop: 16,
                                    marginTop: 16
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    style: {
                                        fontSize: 14,
                                        fontWeight: 600,
                                        color: "var(--accent)"
                                    },
                                    children: "Lihat Data →"
                                }, void 0, false, {
                                    fileName: "[project]/app/(protected)/admin/page.tsx",
                                    lineNumber: 269,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/(protected)/admin/page.tsx",
                                lineNumber: 268,
                                columnNumber: 15
                            }, this)
                        ]
                    }, c.href, true, {
                        fileName: "[project]/app/(protected)/admin/page.tsx",
                        lineNumber: 238,
                        columnNumber: 13
                    }, this))
            }, void 0, false, {
                fileName: "[project]/app/(protected)/admin/page.tsx",
                lineNumber: 229,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    marginBottom: 24
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                    href: "/admin/referensi/pemutakhiran-ppat",
                    style: {
                        ...CARD_STYLES.wrapper,
                        display: "block",
                        textDecoration: "none",
                        color: "var(--color_font_main)",
                        borderLeft: "4px solid #b45309"
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                                marginBottom: 16
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        width: 40,
                                        height: 40,
                                        borderRadius: 10,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: 20,
                                        ...CARD_STYLES.iconGold
                                    },
                                    children: "💰"
                                }, void 0, false, {
                                    fileName: "[project]/app/(protected)/admin/page.tsx",
                                    lineNumber: 291,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    style: {
                                        fontSize: 16,
                                        fontWeight: 600
                                    },
                                    children: "Nilai Transaksi Pajak"
                                }, void 0, false, {
                                    fileName: "[project]/app/(protected)/admin/page.tsx",
                                    lineNumber: 305,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/(protected)/admin/page.tsx",
                            lineNumber: 290,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                fontSize: 32,
                                fontWeight: 700,
                                color: "#047857",
                                margin: "8px 0"
                            },
                            children: taxSummary?.total_bphtb_formatted ?? "Rp 0"
                        }, void 0, false, {
                            fileName: "[project]/app/(protected)/admin/page.tsx",
                            lineNumber: 307,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                fontSize: 14,
                                color: "var(--color_font_main_muted)",
                                marginBottom: 12
                            },
                            children: [
                                "Periode 12 bulan • Tahun ",
                                new Date().getFullYear()
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/(protected)/admin/page.tsx",
                            lineNumber: 310,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                                gap: 12,
                                marginTop: 14
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        background: "rgba(10,19,34,0.06)",
                                        border: "1px solid var(--card_border)",
                                        borderRadius: 10,
                                        padding: "10px 12px"
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                fontSize: 12,
                                                color: "var(--color_font_main_muted)"
                                            },
                                            children: "Total Transaksi"
                                        }, void 0, false, {
                                            fileName: "[project]/app/(protected)/admin/page.tsx",
                                            lineNumber: 315,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                marginTop: 4,
                                                fontSize: 16,
                                                fontWeight: 700,
                                                color: "var(--color_font_main)"
                                            },
                                            children: (taxSummary?.total_transaksi ?? 0).toLocaleString("id-ID")
                                        }, void 0, false, {
                                            fileName: "[project]/app/(protected)/admin/page.tsx",
                                            lineNumber: 316,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/(protected)/admin/page.tsx",
                                    lineNumber: 314,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        background: "rgba(10,19,34,0.06)",
                                        border: "1px solid var(--card_border)",
                                        borderRadius: 10,
                                        padding: "10px 12px"
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                fontSize: 12,
                                                color: "var(--color_font_main_muted)"
                                            },
                                            children: "Keterangan"
                                        }, void 0, false, {
                                            fileName: "[project]/app/(protected)/admin/page.tsx",
                                            lineNumber: 321,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                marginTop: 4,
                                                fontSize: 14,
                                                fontWeight: 600,
                                                color: "var(--color_font_main)"
                                            },
                                            children: "Ringkasan dari Pemutakhiran PPAT"
                                        }, void 0, false, {
                                            fileName: "[project]/app/(protected)/admin/page.tsx",
                                            lineNumber: 322,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/(protected)/admin/page.tsx",
                                    lineNumber: 320,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/(protected)/admin/page.tsx",
                            lineNumber: 313,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                borderTop: "1px solid var(--card_border)",
                                paddingTop: 16,
                                marginTop: 16
                            },
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    fontSize: 14,
                                    fontWeight: 600,
                                    color: "var(--accent)"
                                },
                                children: "Lihat Detail →"
                            }, void 0, false, {
                                fileName: "[project]/app/(protected)/admin/page.tsx",
                                lineNumber: 326,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/(protected)/admin/page.tsx",
                            lineNumber: 325,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/(protected)/admin/page.tsx",
                    lineNumber: 280,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/(protected)/admin/page.tsx",
                lineNumber: 279,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                style: {
                    background: "var(--card_bg)",
                    border: "1px solid var(--card_border)",
                    borderRadius: 12,
                    padding: 24,
                    boxShadow: "var(--card_shadow)"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        style: {
                            margin: "0 0 20px",
                            color: "var(--color_font_main)",
                            fontSize: 20,
                            fontWeight: 700,
                            borderBottom: "2px solid var(--card_border)",
                            paddingBottom: 12
                        },
                        children: "Statistik Total Permohonan Validasi"
                    }, void 0, false, {
                        fileName: "[project]/app/(protected)/admin/page.tsx",
                        lineNumber: 341,
                        columnNumber: 9
                    }, this),
                    validationStats?.success && validationStats.data ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: "grid",
                            gridTemplateColumns: "minmax(0,200px) 1fr",
                            gap: 32,
                            alignItems: "start"
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    width: 200,
                                    height: 200,
                                    borderRadius: "50%",
                                    background: `conic-gradient(
                  #10b981 0% ${validationStats.data.sudahValidasi.percentage}%,
                  #3b82f6 ${validationStats.data.sudahValidasi.percentage}% ${validationStats.data.sudahValidasi.percentage + validationStats.data.tinggalVerifikasi.percentage}%,
                  #f59e0b ${validationStats.data.sudahValidasi.percentage + validationStats.data.tinggalVerifikasi.percentage}% 100%
                )`,
                                    flexShrink: 0
                                }
                            }, void 0, false, {
                                fileName: "[project]/app/(protected)/admin/page.tsx",
                                lineNumber: 346,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                style: {
                                    listStyle: "none",
                                    padding: 0,
                                    margin: 0
                                },
                                children: [
                                    {
                                        ...validationStats.data.sudahValidasi,
                                        color: "#10b981"
                                    },
                                    {
                                        ...validationStats.data.tinggalVerifikasi,
                                        color: "#3b82f6"
                                    },
                                    {
                                        ...validationStats.data.belumTerurus,
                                        color: "#f59e0b"
                                    }
                                ].map((item, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                        style: {
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 12,
                                            padding: 12,
                                            marginBottom: 8,
                                            background: "rgba(10,19,34,0.05)",
                                            borderRadius: 8,
                                            borderLeft: `4px solid ${item.color}`
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    width: 20,
                                                    height: 20,
                                                    borderRadius: 4,
                                                    background: item.color,
                                                    flexShrink: 0
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/app/(protected)/admin/page.tsx",
                                                lineNumber: 378,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    flex: 1
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            fontWeight: 600,
                                                            color: "var(--color_font_main)"
                                                        },
                                                        children: item.label
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/(protected)/admin/page.tsx",
                                                        lineNumber: 380,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            fontSize: 12,
                                                            color: "var(--color_font_main_muted)",
                                                            marginTop: 4
                                                        },
                                                        children: item.description ?? ""
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/(protected)/admin/page.tsx",
                                                        lineNumber: 381,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/(protected)/admin/page.tsx",
                                                lineNumber: 379,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    textAlign: "right"
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            fontSize: 18,
                                                            fontWeight: 700,
                                                            color: "var(--color_font_main)"
                                                        },
                                                        children: [
                                                            item.percentage,
                                                            "%"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/(protected)/admin/page.tsx",
                                                        lineNumber: 384,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            fontSize: 14,
                                                            color: "var(--color_font_main_muted)"
                                                        },
                                                        children: [
                                                            item.count,
                                                            " dokumen"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/(protected)/admin/page.tsx",
                                                        lineNumber: 385,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/(protected)/admin/page.tsx",
                                                lineNumber: 383,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, i, true, {
                                        fileName: "[project]/app/(protected)/admin/page.tsx",
                                        lineNumber: 365,
                                        columnNumber: 17
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/app/(protected)/admin/page.tsx",
                                lineNumber: 359,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/(protected)/admin/page.tsx",
                        lineNumber: 345,
                        columnNumber: 11
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        style: {
                            color: "var(--color_font_main_muted)",
                            margin: 0
                        },
                        children: "Memuat statistik validasi..."
                    }, void 0, false, {
                        fileName: "[project]/app/(protected)/admin/page.tsx",
                        lineNumber: 392,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/(protected)/admin/page.tsx",
                lineNumber: 332,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                style: {
                    marginTop: "2rem"
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                    href: "/dashboard",
                    style: {
                        color: "var(--accent_hover)",
                        textDecoration: "none"
                    },
                    children: "← Kembali ke Dashboard"
                }, void 0, false, {
                    fileName: "[project]/app/(protected)/admin/page.tsx",
                    lineNumber: 397,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/(protected)/admin/page.tsx",
                lineNumber: 396,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/(protected)/admin/page.tsx",
        lineNumber: 215,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=app_%28protected%29_admin_page_tsx_473b75a8._.js.map