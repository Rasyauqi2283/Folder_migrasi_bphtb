"use client";

import { useCallback, useEffect, useState } from "react";
import styles from "./data-user-complete.module.css";
import { getApiBase } from "../../../../../lib/api";

const PAGE_SIZE = 10;

interface CompleteUser {
  id: number;
  userid: string;
  divisi: string;
  nama: string;
  email: string;
  nik?: string;
  telepon?: string;
  username?: string | null;
  nip?: string | null;
  special_parafv?: string | null;
  special_field?: string | null;
  ppat_khusus?: string | null;
  pejabat_umum?: string | null;
  status_ppat?: string | null;
  verse?: string | null;
  verifiedstatus?: string;
  statuspengguna?: string;
}

const DIVISI_OPTIONS = [
  { value: "", label: "Semua Divisi" },
  { value: "Administrator", label: "Admin" },
  { value: "PPAT", label: "PPAT" },
  { value: "PPATS", label: "PPATS" },
  { value: "LTB", label: "LTB" },
  { value: "LSB", label: "LSB" },
  { value: "Peneliti", label: "Peneliti" },
  { value: "Peneliti Validasi", label: "Peneliti Validasi" },
  { value: "Wajib Pajak", label: "WP" },
  { value: "BANK", label: "BANK" },
];

const FIELD_OPTIONS = [
  { value: "all", label: "Semua Kolom" },
  { value: "userid", label: "User ID" },
  { value: "nama", label: "Nama" },
  { value: "email", label: "Email" },
  { value: "nik", label: "NIK" },
  { value: "username", label: "Username" },
  { value: "telepon", label: "Telepon" },
];

function verseCategory(u: CompleteUser): "karyawan" | "pu" | "wp" {
  const v = (u.verse ?? "").trim();
  if (v.toUpperCase() === "PU") return "pu";
  if (v.toLowerCase() === "karyawan") return "karyawan";
  if (v.toUpperCase() === "WP") return "wp";
  const div = (u.divisi ?? "").toLowerCase();
  if (["ppat", "ppats"].includes(div)) return "pu";
  if (div === "wajib pajak") return "wp";
  return "karyawan";
}

function DataTable({
  rows,
  onEdit,
  onDelete,
  emptyMessage = "Tidak ada data",
}: {
  rows: CompleteUser[];
  onEdit: (u: CompleteUser) => void;
  onDelete: (u: CompleteUser) => void;
  emptyMessage?: string;
}) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead className={styles.thead}>
          <tr>
            <th>User ID</th>
            <th>Divisi</th>
            <th>Nama</th>
            <th>Email</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody className={styles.tbody}>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={5} className={styles.emptyCell}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((u) => (
              <tr key={u.id}>
                <td>{u.userid}</td>
                <td>{u.divisi}</td>
                <td>{u.nama}</td>
                <td>{u.email}</td>
                <td>
                  <div className={styles.actions}>
                    <button
                      type="button"
                      className={styles.btnEdit}
                      onClick={() => onEdit(u)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className={styles.btnDelete}
                      onClick={() => onDelete(u)}
                    >
                      Hapus
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function Pagination({
  currentPage,
  totalPages,
  onPage,
}: {
  currentPage: number;
  totalPages: number;
  onPage: (p: number) => void;
}) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => Math.abs(p - currentPage) <= 2
  );
  return (
    <div className={styles.pagination}>
      <button
        type="button"
        className={styles.pageBtn}
        disabled={currentPage <= 1}
        onClick={() => onPage(1)}
      >
        «
      </button>
      <button
        type="button"
        className={styles.pageBtn}
        disabled={currentPage <= 1}
        onClick={() => onPage(currentPage - 1)}
      >
        ‹
      </button>
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          className={`${styles.pageBtn} ${p === currentPage ? styles.pageBtnActive : ""}`}
          onClick={() => onPage(p)}
        >
          {p}
        </button>
      ))}
      <button
        type="button"
        className={styles.pageBtn}
        disabled={currentPage >= totalPages}
        onClick={() => onPage(currentPage + 1)}
      >
        ›
      </button>
      <button
        type="button"
        className={styles.pageBtn}
        disabled={currentPage >= totalPages}
        onClick={() => onPage(totalPages)}
      >
        »
      </button>
    </div>
  );
}

export default function AdminDataUserCompletePage() {
  const [users, setUsers] = useState<CompleteUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageKaryawan, setPageKaryawan] = useState(1);
  const [pagePu, setPagePu] = useState(1);
  const [pageWp, setPageWp] = useState(1);
  const [search, setSearch] = useState("");
  const [divisionFilter, setDivisionFilter] = useState("");
  const [fieldFilter, setFieldFilter] = useState("all");
  const [editOverlayOpen, setEditOverlayOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<CompleteUser | null>(null);
  const [editForm, setEditForm] = useState({
    nama: "",
    telepon: "",
    username: "",
    nip: "",
    special_parafv: "",
    special_field: "",
    pejabat_umum: "",
    ppat_khusus: "",
    status_ppat: "",
  });
  const [savingEdit, setSavingEdit] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    userid: string;
    nama: string;
  } | null>(null);

  const loadComplete = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${getApiBase()}/api/users/complete`, { credentials: "include" });
      if (!res.ok) throw new Error("Gagal memuat data pengguna");
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Terjadi kesalahan");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadComplete();
  }, [loadComplete]);

  const filteredUsers = users.filter((u) => {
    if (divisionFilter && u.divisi?.toLowerCase() !== divisionFilter.toLowerCase())
      return false;
    const term = search.trim().toLowerCase();
    if (!term) return true;
    const field = fieldFilter === "all" ? null : fieldFilter;
    if (field) {
      const val = (u as unknown as Record<string, unknown>)[field];
      return val != null && String(val).toLowerCase().includes(term);
    }
    return (
      (u.nama?.toLowerCase().includes(term)) ||
      (u.email?.toLowerCase().includes(term)) ||
      (u.nik?.includes(term)) ||
      (u.userid?.toLowerCase().includes(term)) ||
      (u.username?.toLowerCase().includes(term)) ||
      (u.telepon?.includes(term))
    );
  });

  const karyawanUsers = filteredUsers.filter((u) => verseCategory(u) === "karyawan");
  const puUsers = filteredUsers.filter((u) => verseCategory(u) === "pu");
  const wpUsers = filteredUsers.filter((u) => verseCategory(u) === "wp");

  const totalPagesK = Math.max(1, Math.ceil(karyawanUsers.length / PAGE_SIZE));
  const totalPagesPu = Math.max(1, Math.ceil(puUsers.length / PAGE_SIZE));
  const totalPagesWp = Math.max(1, Math.ceil(wpUsers.length / PAGE_SIZE));

  const startK = (pageKaryawan - 1) * PAGE_SIZE;
  const startPu = (pagePu - 1) * PAGE_SIZE;
  const startWp = (pageWp - 1) * PAGE_SIZE;

  const pageKaryawanRows = karyawanUsers.slice(startK, startK + PAGE_SIZE);
  const pagePuRows = puUsers.slice(startPu, startPu + PAGE_SIZE);
  const pageWpRows = wpUsers.slice(startWp, startWp + PAGE_SIZE);

  const openEdit = (u: CompleteUser) => {
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
      status_ppat: u.status_ppat || "",
    });
    setEditOverlayOpen(true);
  };

  const closeEdit = () => {
    setEditOverlayOpen(false);
    setEditingUser(null);
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;
    setSavingEdit(true);
    try {
      const res = await fetch(`/api/users/${editingUser.userid}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
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
          ppat_khusus: editForm.ppat_khusus,
        }),
      });
      if (!res.ok) throw new Error("Gagal menyimpan");
      const statusRes = await fetch(
        `${getApiBase()}/api/users/${editingUser.userid}/status-ppat`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ status_ppat: editForm.status_ppat }),
        }
      );
      if (!statusRes.ok) console.warn("Gagal update status PPAT");
      closeEdit();
      loadComplete();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Gagal menyimpan");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = (u: CompleteUser) => {
    setDeleteConfirm({ userid: u.userid, nama: u.nama });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      const res = await fetch(`${getApiBase()}/api/users/${deleteConfirm.userid}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Gagal menghapus");
      setDeleteConfirm(null);
      loadComplete();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Gagal menghapus");
    }
  };

  useEffect(() => {
    setPageKaryawan(1);
    setPagePu(1);
    setPageWp(1);
  }, [search, divisionFilter, fieldFilter]);

  return (
    <div className={`${styles.dataUserComplete} ${styles.wrapper}`}>
      <header className={styles.header}>
        <h1 className={styles.title}>Data User (Complete)</h1>
        <p className={styles.subtitle}>
          User yang sudah terverifikasi dan memiliki UserID
        </p>
      </header>

      {error && <div className={styles.error}>{error}</div>}

      {loading ? (
        <div className={styles.loading}>
          <div className={styles.spinner} />
          Memuat data...
        </div>
      ) : (
        <>
          <div className={styles.filterBar}>
            <div className={styles.searchWrap}>
              <span className={styles.searchIcon} aria-hidden>
                🔍
              </span>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Cari pengguna..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className={styles.select}
              value={divisionFilter}
              onChange={(e) => setDivisionFilter(e.target.value)}
            >
              {DIVISI_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <select
              className={styles.select}
              value={fieldFilter}
              onChange={(e) => setFieldFilter(e.target.value)}
            >
              {FIELD_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.summary}>
            <span className={styles.summaryLabel}>Total: {filteredUsers.length} pengguna</span>
            <span className={`${styles.badge} ${styles.badgeKaryawan}`}>
              Karyawan: {karyawanUsers.length}
            </span>
            <span className={`${styles.badge} ${styles.badgePu}`}>
              PU: {puUsers.length}
            </span>
            <span className={`${styles.badge} ${styles.badgeWp}`}>
              WP: {wpUsers.length}
            </span>
          </div>

          <div className={styles.tablesGrid}>
            <div className={styles.tableCard}>
              <div
                className={`${styles.tableCardHeader} ${styles.tableCardHeaderKaryawan}`}
              >
                Verse Karyawan ({karyawanUsers.length})
              </div>
              <DataTable
                rows={pageKaryawanRows}
                onEdit={openEdit}
                onDelete={handleDelete}
              />
              <Pagination
                currentPage={pageKaryawan}
                totalPages={totalPagesK}
                onPage={setPageKaryawan}
              />
            </div>
            <div className={styles.tableCard}>
              <div
                className={`${styles.tableCardHeader} ${styles.tableCardHeaderPu}`}
              >
                Verse PU ({puUsers.length})
              </div>
              <DataTable
                rows={pagePuRows}
                onEdit={openEdit}
                onDelete={handleDelete}
              />
              <Pagination
                currentPage={pagePu}
                totalPages={totalPagesPu}
                onPage={setPagePu}
              />
            </div>
          </div>

          <div className={styles.tableCard}>
            <div
              className={`${styles.tableCardHeader} ${styles.tableCardHeaderWp}`}
            >
              Verse Wajib Pajak (WP) ({wpUsers.length})
            </div>
            <DataTable
              rows={pageWpRows}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
            <Pagination
              currentPage={pageWp}
              totalPages={totalPagesWp}
              onPage={setPageWp}
            />
          </div>
        </>
      )}

      {/* Edit Modal */}
      {editOverlayOpen && editingUser && (
        <div
          className={styles.overlay}
          role="dialog"
          aria-modal
          aria-labelledby="edit-modal-title"
          onClick={(e) => e.target === e.currentTarget && closeEdit()}
        >
          <div className={styles.modal}>
            {(() => {
              const isPU = ["PPAT", "PPATS"].includes(
                editingUser.divisi ?? ""
              );
              const isPenelitiValidasi =
                (editingUser.divisi ?? "").toLowerCase() === "peneliti validasi";
              return (
                <>
                  <h2 id="edit-modal-title" className={styles.modalTitle}>
                    Edit Pengguna: {editingUser.userid} ({isPU ? "PU" : "Karyawan"})
                  </h2>
                  <div className={styles.modalForm}>
                    <div className={styles.modalFormCol}>
                      <div className={styles.field}>
                        <label className={styles.fieldLabel}>Nama</label>
                        <input
                          type="text"
                          className={styles.fieldInput}
                          value={editForm.nama}
                          onChange={(e) =>
                            setEditForm((f) => ({ ...f, nama: e.target.value }))
                          }
                        />
                      </div>
                      <div className={styles.field}>
                        <label className={styles.fieldLabel}>Telepon</label>
                        <input
                          type="text"
                          className={styles.fieldInput}
                          value={editForm.telepon}
                          onChange={(e) =>
                            setEditForm((f) => ({
                              ...f,
                              telepon: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className={styles.field}>
                        <label className={styles.fieldLabel}>Username</label>
                        <input
                          type="text"
                          className={styles.fieldInput}
                          value={editForm.username}
                          onChange={(e) =>
                            setEditForm((f) => ({
                              ...f,
                              username: e.target.value,
                            }))
                          }
                        />
                      </div>
                      {!isPU && (
                        <div className={styles.field}>
                          <label className={styles.fieldLabel}>NIP</label>
                          <input
                            type="text"
                            className={styles.fieldInput}
                            value={editForm.nip}
                            onChange={(e) =>
                              setEditForm((f) => ({ ...f, nip: e.target.value }))
                            }
                          />
                        </div>
                      )}
                      {!isPU && isPenelitiValidasi && (
                        <div className={styles.field}>
                          <label className={styles.fieldLabel}>
                            Special Parafv
                          </label>
                          <input
                            type="text"
                            className={styles.fieldInput}
                            value={editForm.special_parafv}
                            onChange={(e) =>
                              setEditForm((f) => ({
                                ...f,
                                special_parafv: e.target.value,
                              }))
                            }
                          />
                        </div>
                      )}
                    </div>
                    <div className={styles.modalFormCol}>
                      {isPU && (
                        <>
                          <div className={styles.field}>
                            <label className={styles.fieldLabel}>
                              Status PPAT
                            </label>
                            <select
                              className={styles.fieldInput}
                              value={editForm.status_ppat}
                              onChange={(e) =>
                                setEditForm((f) => ({
                                  ...f,
                                  status_ppat: e.target.value,
                                }))
                              }
                            >
                              <option value="">—</option>
                              <option value="aktif">aktif</option>
                              <option value="non-aktif">non-aktif</option>
                              <option value="meninggal">meninggal</option>
                              <option value="Pindah Kerja">Pindah Kerja</option>
                            </select>
                          </div>
                          <div className={styles.field}>
                            <label className={styles.fieldLabel}>
                              PPAT Khusus
                            </label>
                            <input
                              type="text"
                              className={styles.fieldInput}
                              value={editForm.ppat_khusus}
                              onChange={(e) =>
                                setEditForm((f) => ({
                                  ...f,
                                  ppat_khusus: e.target.value,
                                }))
                              }
                            />
                          </div>
                          <div className={styles.field}>
                            <label className={styles.fieldLabel}>
                              Special Field
                            </label>
                            <input
                              type="text"
                              className={styles.fieldInput}
                              value={editForm.special_field}
                              onChange={(e) =>
                                setEditForm((f) => ({
                                  ...f,
                                  special_field: e.target.value,
                                }))
                              }
                            />
                          </div>
                          <div className={styles.field}>
                            <label className={styles.fieldLabel}>
                              Pejabat Umum
                            </label>
                            <input
                              type="text"
                              className={styles.fieldInput}
                              value={editForm.pejabat_umum}
                              onChange={(e) =>
                                setEditForm((f) => ({
                                  ...f,
                                  pejabat_umum: e.target.value,
                                }))
                              }
                            />
                          </div>
                        </>
                      )}
                    </div>
                    <div className={styles.modalActions}>
                      <button
                        type="button"
                        className={styles.btnSecondary}
                        onClick={closeEdit}
                      >
                        Batal
                      </button>
                      <button
                        type="button"
                        className={styles.btnPrimary}
                        onClick={handleSaveEdit}
                        disabled={savingEdit}
                      >
                        {savingEdit ? "Menyimpan..." : "Simpan"}
                      </button>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteConfirm && (
        <div
          className={styles.overlay}
          role="dialog"
          aria-modal
          aria-labelledby="delete-modal-title"
          onClick={(e) => e.target === e.currentTarget && setDeleteConfirm(null)}
        >
          <div className={`${styles.modal} ${styles.deleteModal}`}>
            <h2 id="delete-modal-title" className={styles.modalTitle}>
              Konfirmasi Hapus
            </h2>
            <p className={styles.deleteModalText}>
              Anda yakin ingin menghapus{" "}
              <strong>{deleteConfirm.nama}</strong> ({deleteConfirm.userid})?
            </p>
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={() => setDeleteConfirm(null)}
              >
                Batal
              </button>
              <button
                type="button"
                className={`${styles.btnPrimary} ${styles.btnDanger}`}
                onClick={confirmDelete}
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
