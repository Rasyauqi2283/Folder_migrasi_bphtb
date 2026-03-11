(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/app/(protected)/admin/data-user/complete/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>AdminDataUserCompletePage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
const PAGE_SIZE = 10;
const DIVISI_OPTIONS = [
    {
        value: "",
        label: "Semua Divisi"
    },
    {
        value: "Administrator",
        label: "Admin"
    },
    {
        value: "PPAT",
        label: "PPAT"
    },
    {
        value: "PPATS",
        label: "PPATS"
    },
    {
        value: "LTB",
        label: "LTB"
    },
    {
        value: "LSB",
        label: "LSB"
    },
    {
        value: "Peneliti",
        label: "Peneliti"
    },
    {
        value: "Peneliti Validasi",
        label: "Peneliti Validasi"
    },
    {
        value: "Wajib Pajak",
        label: "WP"
    },
    {
        value: "BANK",
        label: "BANK"
    }
];
const FIELD_OPTIONS = [
    {
        value: "all",
        label: "Semua Kolom"
    },
    {
        value: "userid",
        label: "User ID"
    },
    {
        value: "nama",
        label: "Nama"
    },
    {
        value: "email",
        label: "Email"
    },
    {
        value: "nik",
        label: "NIK"
    },
    {
        value: "username",
        label: "Username"
    },
    {
        value: "telepon",
        label: "Telepon"
    }
];
function AdminDataUserCompletePage() {
    _s();
    const [users, setUsers] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [page, setPage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(1);
    const [search, setSearch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [divisionFilter, setDivisionFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [fieldFilter, setFieldFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("all");
    const [editOverlayOpen, setEditOverlayOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [editingUser, setEditingUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [editForm, setEditForm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        nama: "",
        telepon: "",
        username: "",
        nip: "",
        special_parafv: "",
        special_field: "",
        pejabat_umum: "",
        ppat_khusus: "",
        status_ppat: ""
    });
    const [savingEdit, setSavingEdit] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [deleteConfirm, setDeleteConfirm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const loadComplete = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "AdminDataUserCompletePage.useCallback[loadComplete]": async ()=>{
            setLoading(true);
            setError(null);
            try {
                const res = await fetch("/api/users/complete", {
                    credentials: "include"
                });
                if (!res.ok) throw new Error("Gagal memuat data pengguna");
                const data = await res.json();
                setUsers(Array.isArray(data) ? data : []);
            } catch (e) {
                setError(e instanceof Error ? e.message : "Terjadi kesalahan");
                setUsers([]);
            } finally{
                setLoading(false);
            }
        }
    }["AdminDataUserCompletePage.useCallback[loadComplete]"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AdminDataUserCompletePage.useEffect": ()=>{
            loadComplete();
        }
    }["AdminDataUserCompletePage.useEffect"], [
        loadComplete
    ]);
    const filteredUsers = users.filter((u)=>{
        if (divisionFilter && u.divisi?.toLowerCase() !== divisionFilter.toLowerCase()) return false;
        const term = search.trim().toLowerCase();
        if (!term) return true;
        const field = fieldFilter === "all" ? null : fieldFilter;
        if (field) {
            const val = u[field];
            return val != null && String(val).toLowerCase().includes(term);
        }
        return u.nama?.toLowerCase().includes(term) || u.email?.toLowerCase().includes(term) || u.nik?.includes(term) || u.userid?.toLowerCase().includes(term) || u.username?.toLowerCase().includes(term) || u.telepon?.includes(term);
    });
    const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
    const startIdx = (page - 1) * PAGE_SIZE;
    const pageUsers = filteredUsers.slice(startIdx, startIdx + PAGE_SIZE);
    const startDisplay = filteredUsers.length === 0 ? 0 : startIdx + 1;
    const endDisplay = Math.min(startIdx + PAGE_SIZE, filteredUsers.length);
    const openEdit = (u)=>{
        setEditingUser(u);
        setEditForm({
            nama: u.nama || "",
            telepon: u.telepon || "",
            username: u.username || "",
            nip: u.nip || "",
            special_parafv: u.special_parafv || "",
            special_field: u.special_field || "",
            pejabat_umum: u.pejabat_umum || "",
            ppat_khusus: u.ppat_khusus || "",
            status_ppat: u.status_ppat || ""
        });
        setEditOverlayOpen(true);
    };
    const closeEdit = ()=>{
        setEditOverlayOpen(false);
        setEditingUser(null);
    };
    const handleSaveEdit = async ()=>{
        if (!editingUser) return;
        setSavingEdit(true);
        try {
            const res = await fetch(`/api/users/${editingUser.userid}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({
                    userid: editingUser.userid,
                    divisi: editingUser.divisi,
                    nama: editForm.nama,
                    email: editingUser.email,
                    telepon: editForm.telepon,
                    username: editForm.username,
                    nip: editForm.nip,
                    special_parafv: editForm.special_parafv,
                    special_field: editForm.special_field,
                    pejabat_umum: editForm.pejabat_umum,
                    ppat_khusus: editForm.ppat_khusus
                })
            });
            if (!res.ok) throw new Error("Gagal menyimpan");
            const statusRes = await fetch(`/api/users/${editingUser.userid}/status-ppat`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({
                    status_ppat: editForm.status_ppat
                })
            });
            if (!statusRes.ok) console.warn("Gagal update status PPAT");
            closeEdit();
            loadComplete();
        } catch (e) {
            alert(e instanceof Error ? e.message : "Gagal menyimpan");
        } finally{
            setSavingEdit(false);
        }
    };
    const handleDelete = async ()=>{
        if (!deleteConfirm) return;
        try {
            const res = await fetch(`/api/users/${deleteConfirm.userid}`, {
                method: "DELETE",
                credentials: "include"
            });
            if (!res.ok) throw new Error("Gagal menghapus");
            setDeleteConfirm(null);
            loadComplete();
        } catch (e) {
            alert(e instanceof Error ? e.message : "Gagal menghapus");
        }
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AdminDataUserCompletePage.useEffect": ()=>{
            setPage(1);
        }
    }["AdminDataUserCompletePage.useEffect"], [
        search,
        divisionFilter,
        fieldFilter
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                style: {
                    color: "var(--color_font_main)",
                    margin: "0 0 0.5rem"
                },
                children: "Data User (Complete)"
            }, void 0, false, {
                fileName: "[project]/app/(protected)/admin/data-user/complete/page.tsx",
                lineNumber: 193,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                style: {
                    color: "var(--color_font_main_muted)",
                    margin: "0 0 1rem"
                },
                children: "User yang sudah terverifikasi dan memiliki UserID"
            }, void 0, false, {
                fileName: "[project]/app/(protected)/admin/data-user/complete/page.tsx",
                lineNumber: 196,
                columnNumber: 7
            }, this),
            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                style: {
                    color: "#dc2626",
                    marginBottom: "1rem"
                },
                children: error
            }, void 0, false, {
                fileName: "[project]/app/(protected)/admin/data-user/complete/page.tsx",
                lineNumber: 201,
                columnNumber: 9
            }, this),
            loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                style: {
                    color: "var(--color_font_main_muted)"
                },
                children: "Memuat..."
            }, void 0, false, {
                fileName: "[project]/app/(protected)/admin/data-user/complete/page.tsx",
                lineNumber: 205,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 12,
                            marginBottom: 16,
                            alignItems: "center"
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "text",
                                placeholder: "🔍 Cari pengguna...",
                                value: search,
                                onChange: (e)=>setSearch(e.target.value),
                                style: {
                                    padding: "8px 12px",
                                    borderRadius: 8,
                                    border: "1px solid var(--color_font_main_muted)",
                                    background: "var(--card_bg)",
                                    color: "var(--color_font_main)",
                                    minWidth: 220
                                }
                            }, void 0, false, {
                                fileName: "[project]/app/(protected)/admin/data-user/complete/page.tsx",
                                lineNumber: 217,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                value: divisionFilter,
                                onChange: (e)=>setDivisionFilter(e.target.value),
                                style: {
                                    padding: "8px 12px",
                                    borderRadius: 8,
                                    border: "1px solid var(--color_font_main_muted)",
                                    background: "var(--card_bg)",
                                    color: "var(--color_font_main)"
                                },
                                children: DIVISI_OPTIONS.map((o)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: o.value,
                                        children: o.label
                                    }, o.value, false, {
                                        fileName: "[project]/app/(protected)/admin/data-user/complete/page.tsx",
                                        lineNumber: 243,
                                        columnNumber: 17
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/app/(protected)/admin/data-user/complete/page.tsx",
                                lineNumber: 231,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                value: fieldFilter,
                                onChange: (e)=>setFieldFilter(e.target.value),
                                style: {
                                    padding: "8px 12px",
                                    borderRadius: 8,
                                    border: "1px solid var(--color_font_main_muted)",
                                    background: "var(--card_bg)",
                                    color: "var(--color_font_main)"
                                },
                                children: FIELD_OPTIONS.map((o)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: o.value,
                                        children: o.label
                                    }, o.value, false, {
                                        fileName: "[project]/app/(protected)/admin/data-user/complete/page.tsx",
                                        lineNumber: 258,
                                        columnNumber: 17
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/app/(protected)/admin/data-user/complete/page.tsx",
                                lineNumber: 246,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/(protected)/admin/data-user/complete/page.tsx",
                        lineNumber: 208,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            marginBottom: 8,
                            color: "var(--color_font_main_muted)",
                            fontSize: 14
                        },
                        children: filteredUsers.length === 0 ? "Menampilkan 0 data" : `Menampilkan ${startDisplay}-${endDisplay} dari ${filteredUsers.length} pengguna`
                    }, void 0, false, {
                        fileName: "[project]/app/(protected)/admin/data-user/complete/page.tsx",
                        lineNumber: 263,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            overflowX: "auto",
                            background: "#1b263b",
                            borderRadius: 8,
                            border: "1px solid rgba(65,90,119,0.3)"
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                            style: {
                                width: "100%",
                                borderCollapse: "collapse"
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                        style: {
                                            borderBottom: "1px solid rgba(65,90,119,0.5)"
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                style: thStyle,
                                                children: "User ID"
                                            }, void 0, false, {
                                                fileName: "[project]/app/(protected)/admin/data-user/complete/page.tsx",
                                                lineNumber: 280,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                style: thStyle,
                                                children: "Divisi"
                                            }, void 0, false, {
                                                fileName: "[project]/app/(protected)/admin/data-user/complete/page.tsx",
                                                lineNumber: 281,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                style: thStyle,
                                                children: "Nama"
                                            }, void 0, false, {
                                                fileName: "[project]/app/(protected)/admin/data-user/complete/page.tsx",
                                                lineNumber: 282,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                style: thStyle,
                                                children: "Email"
                                            }, void 0, false, {
                                                fileName: "[project]/app/(protected)/admin/data-user/complete/page.tsx",
                                                lineNumber: 283,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                style: thStyle,
                                                children: "Aksi"
                                            }, void 0, false, {
                                                fileName: "[project]/app/(protected)/admin/data-user/complete/page.tsx",
                                                lineNumber: 284,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/(protected)/admin/data-user/complete/page.tsx",
                                        lineNumber: 279,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/(protected)/admin/data-user/complete/page.tsx",
                                    lineNumber: 278,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                    children: pageUsers.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            colSpan: 5,
                                            style: {
                                                ...tdStyle,
                                                textAlign: "center",
                                                padding: 24
                                            },
                                            children: "Tidak ada data yang ditemukan"
                                        }, void 0, false, {
                                            fileName: "[project]/app/(protected)/admin/data-user/complete/page.tsx",
                                            lineNumber: 290,
                                            columnNumber: 21
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/(protected)/admin/data-user/complete/page.tsx",
                                        lineNumber: 289,
                                        columnNumber: 19
                                    }, this) : pageUsers.map((u)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                            style: {
                                                borderBottom: "1px solid rgba(65,90,119,0.2)"
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    style: tdStyle,
                                                    children: u.userid
                                                }, void 0, false, {
                                                    fileName: "[project]/app/(protected)/admin/data-user/complete/page.tsx",
                                                    lineNumber: 297,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    style: tdStyle,
                                                    children: u.divisi
                                                }, void 0, false, {
                                                    fileName: "[project]/app/(protected)/admin/data-user/complete/page.tsx",
                                                    lineNumber: 298,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    style: tdStyle,
                                                    children: u.nama
                                                }, void 0, false, {
                                                    fileName: "[project]/app/(protected)/admin/data-user/complete/page.tsx",
                                                    lineNumber: 299,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    style: tdStyle,
                                                    children: u.email
                                                }, void 0, false, {
                                                    fileName: "[project]/app/(protected)/admin/data-user/complete/page.tsx",
                                                    lineNumber: 300,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    style: tdStyle,
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            type: "button",
                                                            onClick: ()=>openEdit(u),
                                                            style: {
                                                                ...btnAksi,
                                                                marginRight: 8
                                                            },
                                                            children: "Edit"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/(protected)/admin/data-user/complete/page.tsx",
                                                            lineNumber: 302,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            type: "button",
                                                            onClick: ()=>setDeleteConfirm({
                                                                    userid: u.userid,
                                                                    nama: u.nama
                                                                }),
                                                            style: {
                                                                ...btnAksi,
                                                                background: "#dc2626"
                                                            },
                                                            children: "Hapus"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/(protected)/admin/data-user/complete/page.tsx",
                                                            lineNumber: 309,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/(protected)/admin/data-user/complete/page.tsx",
                                                    lineNumber: 301,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, u.id, true, {
                                            fileName: "[project]/app/(protected)/admin/data-user/complete/page.tsx",
                                            lineNumber: 296,
                                            columnNumber: 21
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/app/(protected)/admin/data-user/complete/page.tsx",
                                    lineNumber: 287,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/(protected)/admin/data-user/complete/page.tsx",
                            lineNumber: 277,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/(protected)/admin/data-user/complete/page.tsx",
                        lineNumber: 269,
                        columnNumber: 11
                    }, this),
                    totalPages > 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: "flex",
                            gap: 6,
                            justifyContent: "center",
                            marginTop: 12
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                disabled: page === 1,
                                onClick: ()=>setPage(1),
                                style: pageBtnStyle,
                                children: "«"
                            }, void 0, false, {
                                fileName: "[project]/app/(protected)/admin/data-user/complete/page.tsx",
                                lineNumber: 326,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                disabled: page === 1,
                                onClick: ()=>setPage((p)=>p - 1),
                                style: pageBtnStyle,
                                children: "‹"
                            }, void 0, false, {
                                fileName: "[project]/app/(protected)/admin/data-user/complete/page.tsx",
                                lineNumber: 327,
                                columnNumber: 15
                            }, this),
                            Array.from({
                                length: totalPages
                            }, (_, i)=>i + 1).filter((p)=>Math.abs(p - page) <= 2).map((p)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    onClick: ()=>setPage(p),
                                    style: {
                                        ...pageBtnStyle,
                                        ...p === page ? {
                                            background: "var(--accent)",
                                            color: "#fff"
                                        } : {}
                                    },
                                    children: p
                                }, p, false, {
                                    fileName: "[project]/app/(protected)/admin/data-user/complete/page.tsx",
                                    lineNumber: 331,
                                    columnNumber: 19
                                }, this)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                disabled: page === totalPages,
                                onClick: ()=>setPage((p)=>p + 1),
                                style: pageBtnStyle,
                                children: "›"
                            }, void 0, false, {
                                fileName: "[project]/app/(protected)/admin/data-user/complete/page.tsx",
                                lineNumber: 340,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                disabled: page === totalPages,
                                onClick: ()=>setPage(totalPages),
                                style: pageBtnStyle,
                                children: "»"
                            }, void 0, false, {
                                fileName: "[project]/app/(protected)/admin/data-user/complete/page.tsx",
                                lineNumber: 341,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/(protected)/admin/data-user/complete/page.tsx",
                        lineNumber: 325,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true),
            editOverlayOpen && editingUser && (()=>{
                const isPU = [
                    "PPAT",
                    "PPATS"
                ].includes(editingUser.divisi ?? "");
                const isPenelitiValidasi = (editingUser.divisi ?? "").toLowerCase() === "peneliti validasi";
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    role: "dialog",
                    "aria-modal": true,
                    style: {
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 1000
                    },
                    onClick: (e)=>e.target === e.currentTarget && closeEdit(),
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            background: "var(--card_bg)",
                            borderRadius: 12,
                            padding: 24,
                            width: "min(90vw, 720px)",
                            maxWidth: 720,
                            maxHeight: "85vh",
                            overflowY: "auto",
                            boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: 20
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    gridColumn: "1 / -1"
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                    style: {
                                        color: "var(--color_font_main)",
                                        margin: "0 0 4px"
                                    },
                                    children: [
                                        "Edit Pengguna: ",
                                        editingUser.userid,
                                        " (",
                                        isPU ? "PU" : "Karyawan",
                                        ")"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/(protected)/admin/data-user/complete/page.tsx",
                                    lineNumber: 382,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/(protected)/admin/data-user/complete/page.tsx",
                                lineNumber: 381,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 12
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                style: labelStyle,
                                                children: "Nama"
                                            }, void 0, false, {
                                                fileName: "[project]/app/(protected)/admin/data-user/complete/page.tsx",
                                                lineNumber: 389,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "text",
                                                value: editForm.nama,
                                                onChange: (e)=>setEditForm((f)=>({
                                                            ...f,
                                                            nama: e.target.value
                                                        })),
                                                style: inputStyle
                                            }, void 0, false, {
                                                fileName: "[project]/app/(protected)/admin/data-user/complete/page.tsx",
                                                lineNumber: 390,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/(protected)/admin/data-user/complete/page.tsx",
                                        lineNumber: 388,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                style: labelStyle,
                                                children: "Telepon"
                                            }, void 0, false, {
                                                fileName: "[project]/app/(protected)/admin/data-user/complete/page.tsx",
                                                lineNumber: 393,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "text",
                                                value: editForm.telepon,
                                                onChange: (e)=>setEditForm((f)=>({
                                                            ...f,
                                                            telepon: e.target.value
                                                        })),
                                                style: inputStyle
                                            }, void 0, false, {
                                                fileName: "[project]/app/(protected)/admin/data-user/complete/page.tsx",
                                                lineNumber: 394,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/(protected)/admin/data-user/complete/page.tsx",
                                        lineNumber: 392,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                style: labelStyle,
                                                children: "Username"
                                            }, void 0, false, {
                                                fileName: "[project]/app/(protected)/admin/data-user/complete/page.tsx",
                                                lineNumber: 397,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "text",
                                                value: editForm.username,
                                                onChange: (e)=>setEditForm((f)=>({
                                                            ...f,
                                                            username: e.target.value
                                                        })),
                                                style: inputStyle
                                            }, void 0, false, {
                                                fileName: "[project]/app/(protected)/admin/data-user/complete/page.tsx",
                                                lineNumber: 398,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/(protected)/admin/data-user/complete/page.tsx",
                                        lineNumber: 396,
                                        columnNumber: 15
                                    }, this),
                                    !isPU && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                style: labelStyle,
                                                children: "NIP"
                                            }, void 0, false, {
                                                fileName: "[project]/app/(protected)/admin/data-user/complete/page.tsx",
                                                lineNumber: 402,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "text",
                                                value: editForm.nip,
                                                onChange: (e)=>setEditForm((f)=>({
                                                            ...f,
                                                            nip: e.target.value
                                                        })),
                                                style: inputStyle
                                            }, void 0, false, {
                                                fileName: "[project]/app/(protected)/admin/data-user/complete/page.tsx",
                                                lineNumber: 403,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/(protected)/admin/data-user/complete/page.tsx",
                                        lineNumber: 401,
                                        columnNumber: 17
                                    }, this),
                                    !isPU && isPenelitiValidasi && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                style: labelStyle,
                                                children: "Special Parafv"
                                            }, void 0, false, {
                                                fileName: "[project]/app/(protected)/admin/data-user/complete/page.tsx",
                                                lineNumber: 408,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "text",
                                                value: editForm.special_parafv,
                                                onChange: (e)=>setEditForm((f)=>({
                                                            ...f,
                                                            special_parafv: e.target.value
                                                        })),
                                                style: inputStyle
                                            }, void 0, false, {
                                                fileName: "[project]/app/(protected)/admin/data-user/complete/page.tsx",
                                                lineNumber: 409,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/(protected)/admin/data-user/complete/page.tsx",
                                        lineNumber: 407,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/(protected)/admin/data-user/complete/page.tsx",
                                lineNumber: 387,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 12
                                },
                                children: isPU && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    style: labelStyle,
                                                    children: "Status PPAT"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/(protected)/admin/data-user/complete/page.tsx",
                                                    lineNumber: 418,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                    value: editForm.status_ppat,
                                                    onChange: (e)=>setEditForm((f)=>({
                                                                ...f,
                                                                status_ppat: e.target.value
                                                            })),
                                                    style: {
                                                        ...inputStyle,
                                                        width: "100%"
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: "",
                                                            children: "—"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/(protected)/admin/data-user/complete/page.tsx",
                                                            lineNumber: 420,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: "aktif",
                                                            children: "aktif"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/(protected)/admin/data-user/complete/page.tsx",
                                                            lineNumber: 421,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: "non-aktif",
                                                            children: "non-aktif"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/(protected)/admin/data-user/complete/page.tsx",
                                                            lineNumber: 422,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: "meninggal",
                                                            children: "meninggal"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/(protected)/admin/data-user/complete/page.tsx",
                                                            lineNumber: 423,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: "Pindah Kerja",
                                                            children: "Pindah Kerja"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/(protected)/admin/data-user/complete/page.tsx",
                                                            lineNumber: 424,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/(protected)/admin/data-user/complete/page.tsx",
                                                    lineNumber: 419,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/(protected)/admin/data-user/complete/page.tsx",
                                            lineNumber: 417,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    style: labelStyle,
                                                    children: "PPAT Khusus"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/(protected)/admin/data-user/complete/page.tsx",
                                                    lineNumber: 428,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "text",
                                                    value: editForm.ppat_khusus,
                                                    onChange: (e)=>setEditForm((f)=>({
                                                                ...f,
                                                                ppat_khusus: e.target.value
                                                            })),
                                                    style: inputStyle
                                                }, void 0, false, {
                                                    fileName: "[project]/app/(protected)/admin/data-user/complete/page.tsx",
                                                    lineNumber: 429,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/(protected)/admin/data-user/complete/page.tsx",
                                            lineNumber: 427,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    style: labelStyle,
                                                    children: "Special Field"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/(protected)/admin/data-user/complete/page.tsx",
                                                    lineNumber: 432,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "text",
                                                    value: editForm.special_field,
                                                    onChange: (e)=>setEditForm((f)=>({
                                                                ...f,
                                                                special_field: e.target.value
                                                            })),
                                                    style: inputStyle
                                                }, void 0, false, {
                                                    fileName: "[project]/app/(protected)/admin/data-user/complete/page.tsx",
                                                    lineNumber: 433,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/(protected)/admin/data-user/complete/page.tsx",
                                            lineNumber: 431,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    style: labelStyle,
                                                    children: "Pejabat Umum"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/(protected)/admin/data-user/complete/page.tsx",
                                                    lineNumber: 436,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "text",
                                                    value: editForm.pejabat_umum,
                                                    onChange: (e)=>setEditForm((f)=>({
                                                                ...f,
                                                                pejabat_umum: e.target.value
                                                            })),
                                                    style: inputStyle
                                                }, void 0, false, {
                                                    fileName: "[project]/app/(protected)/admin/data-user/complete/page.tsx",
                                                    lineNumber: 437,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/(protected)/admin/data-user/complete/page.tsx",
                                            lineNumber: 435,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true)
                            }, void 0, false, {
                                fileName: "[project]/app/(protected)/admin/data-user/complete/page.tsx",
                                lineNumber: 414,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    gridColumn: "1 / -1",
                                    display: "flex",
                                    gap: 8,
                                    justifyContent: "flex-end",
                                    marginTop: 8
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        onClick: closeEdit,
                                        style: btnSecondary,
                                        children: "Batal"
                                    }, void 0, false, {
                                        fileName: "[project]/app/(protected)/admin/data-user/complete/page.tsx",
                                        lineNumber: 444,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        onClick: handleSaveEdit,
                                        disabled: savingEdit,
                                        style: btnPrimary,
                                        children: savingEdit ? "Menyimpan..." : "Simpan"
                                    }, void 0, false, {
                                        fileName: "[project]/app/(protected)/admin/data-user/complete/page.tsx",
                                        lineNumber: 445,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/(protected)/admin/data-user/complete/page.tsx",
                                lineNumber: 443,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/(protected)/admin/data-user/complete/page.tsx",
                        lineNumber: 366,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/app/(protected)/admin/data-user/complete/page.tsx",
                    lineNumber: 352,
                    columnNumber: 9
                }, this);
            })(),
            deleteConfirm && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    position: "fixed",
                    inset: 0,
                    background: "rgba(0,0,0,0.5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 1000
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        background: "var(--card_bg)",
                        borderRadius: 12,
                        padding: 24,
                        maxWidth: 400
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                            style: {
                                color: "var(--color_font_main)",
                                margin: "0 0 8px"
                            },
                            children: "Konfirmasi Hapus"
                        }, void 0, false, {
                            fileName: "[project]/app/(protected)/admin/data-user/complete/page.tsx",
                            lineNumber: 475,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            style: {
                                color: "var(--color_font_main_muted)",
                                margin: "0 0 16px"
                            },
                            children: [
                                "Anda yakin ingin menghapus ",
                                deleteConfirm.nama,
                                " (",
                                deleteConfirm.userid,
                                ")?"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/(protected)/admin/data-user/complete/page.tsx",
                            lineNumber: 476,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                display: "flex",
                                gap: 8,
                                justifyContent: "flex-end"
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    onClick: ()=>setDeleteConfirm(null),
                                    style: btnSecondary,
                                    children: "Batal"
                                }, void 0, false, {
                                    fileName: "[project]/app/(protected)/admin/data-user/complete/page.tsx",
                                    lineNumber: 480,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    onClick: handleDelete,
                                    style: {
                                        ...btnPrimary,
                                        background: "#dc2626"
                                    },
                                    children: "Hapus"
                                }, void 0, false, {
                                    fileName: "[project]/app/(protected)/admin/data-user/complete/page.tsx",
                                    lineNumber: 481,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/(protected)/admin/data-user/complete/page.tsx",
                            lineNumber: 479,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/(protected)/admin/data-user/complete/page.tsx",
                    lineNumber: 467,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/(protected)/admin/data-user/complete/page.tsx",
                lineNumber: 456,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/(protected)/admin/data-user/complete/page.tsx",
        lineNumber: 192,
        columnNumber: 5
    }, this);
}
_s(AdminDataUserCompletePage, "TJkQ+KHIaseZX5t83TbD/vqDJbY=");
_c = AdminDataUserCompletePage;
const thStyle = {
    padding: "10px 12px",
    textAlign: "left",
    color: "rgba(255,255,255,0.9)",
    fontWeight: 600
};
const tdStyle = {
    padding: "10px 12px",
    color: "rgba(255,255,255,0.85)"
};
const pageBtnStyle = {
    minWidth: 34,
    height: 34,
    borderRadius: 8,
    border: "1px solid var(--color_font_main_muted)",
    background: "var(--card_bg)",
    color: "var(--color_font_main)",
    cursor: "pointer"
};
const btnAksi = {
    padding: "4px 10px",
    background: "#3b82f6",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 13
};
const inputStyle = {
    padding: "8px 12px",
    borderRadius: 8,
    border: "1px solid var(--color_font_main_muted)",
    background: "var(--card_bg)",
    color: "var(--color_font_main)",
    width: "100%"
};
const labelStyle = {
    display: "block",
    marginBottom: 4,
    color: "var(--color_font_main)",
    fontSize: 14
};
const btnPrimary = {
    padding: "8px 16px",
    background: "var(--accent)",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer"
};
const btnSecondary = {
    padding: "8px 16px",
    background: "transparent",
    color: "var(--color_font_main)",
    border: "1px solid var(--color_font_main_muted)",
    borderRadius: 8,
    cursor: "pointer"
};
var _c;
__turbopack_context__.k.register(_c, "AdminDataUserCompletePage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=app_%28protected%29_admin_data-user_complete_page_tsx_536ebe68._.js.map