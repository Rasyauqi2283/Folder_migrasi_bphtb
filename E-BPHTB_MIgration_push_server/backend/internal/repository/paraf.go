package repository

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
)

// ParafRepo handles pv_1_paraf_validate and related for Peneliti Validasi role.
type ParafRepo struct {
	pool *pgxpool.Pool
}

// NewParafRepo creates a ParafRepo.
func NewParafRepo(pool *pgxpool.Pool) *ParafRepo {
	return &ParafRepo{pool: pool}
}

// ParafBerkasRow one row for get-berkas-pending / get-monitoring-documents.
type ParafBerkasRow struct {
	Nobooking               string  `json:"nobooking"`
	NoValidasi              *string `json:"no_validasi"`
	Noppbb                  *string `json:"noppbb"`
	Tahunajb                *string `json:"tahunajb"`
	Namawajibpajak          *string `json:"namawajibpajak"`
	Namapemilikobjekpajak   *string `json:"namapemilikobjekpajak"`
	AktaTanahPath           *string `json:"akta_tanah_path"`
	SertifikatTanahPath     *string `json:"sertifikat_tanah_path"`
	PelengkapPath           *string `json:"pelengkap_path"`
	NoRegistrasi            *string `json:"no_registrasi"`
	Status                  *string `json:"status"`
	Trackstatus             *string `json:"trackstatus"`
	StatusTertampil         *string `json:"status_tertampil"`
	Keterangan              *string `json:"keterangan"`
	UpdatedAt               *string `json:"updated_at"`
	Namapembuat             *string `json:"namapembuat"`
	PenelitiTandaTanganPath *string `json:"peneliti_tanda_tangan_path"`
	StempelBookingPath      *string `json:"stempel_booking_path"`
	PcPersetujuan           *string `json:"pc_persetujuan"`
	TandaParafPath          *string `json:"tanda_paraf_path"`
	SignerUserid            *string `json:"signer_userid"`
	Pemverifikasi           *string `json:"pemverifikasi"`
	PemverifikasiNama       *string `json:"pemverifikasi_nama"`
	Pemparaf                *string `json:"pemparaf"`
	PemparafNama            *string `json:"pemparaf_nama"`
}

const parafBaseSelect = `
	SELECT pv.nobooking, pv.no_validasi, b.noppbb::text, b.tahunajb::text, b.namawajibpajak, b.namapemilikobjekpajak,
		b.akta_tanah_path, b.sertifikat_tanah_path, b.pelengkap_path, pc.no_registrasi,
		pv.status, pv.trackstatus, pv.status_tertampil, pv.keterangan, pv.updated_at::text,
		uc.special_field AS namapembuat, vu.tanda_tangan_path AS peneliti_tanda_tangan_path,
		pvs.stempel_booking_path, pc.persetujuan::text AS pc_persetujuan, pc.tanda_paraf_path, au.userid AS signer_userid,
		pc.pemverifikasi, pemverif_user.nama AS pemverifikasi_nama,
		pv.pemparaf, pemparaf_user.nama AS pemparaf_nama
	FROM pv_1_paraf_validate pv
	JOIN pat_1_bookingsspd b ON pv.nobooking = b.nobooking
	JOIN p_3_clear_to_paraf pc ON pv.nobooking = pc.nobooking
	JOIN a_2_verified_users uc ON b.userid = uc.userid
	LEFT JOIN a_2_verified_users vu ON vu.userid = $1
	LEFT JOIN p_2_verif_sign pvs ON pvs.nobooking = pv.nobooking
	LEFT JOIN a_2_verified_users au ON au.tanda_tangan_path = pc.tanda_paraf_path
	LEFT JOIN a_2_verified_users pemverif_user ON pemverif_user.userid = pc.pemverifikasi
	LEFT JOIN a_2_verified_users pemparaf_user ON pemparaf_user.userid = pv.pemparaf
`

// GetBerkasPending returns rows where status_tertampil IS NULL or 'Menunggu'.
func (r *ParafRepo) GetBerkasPending(ctx context.Context, parafVUserid string) ([]ParafBerkasRow, error) {
	if r.pool == nil {
		return nil, nil
	}
	q := parafBaseSelect + `
		WHERE pc.trackstatus = 'Terverifikasi'
		  AND (pv.status_tertampil IS NULL OR pv.status_tertampil = 'Menunggu')
		ORDER BY pc.no_registrasi ASC NULLS LAST, pv.no_validasi ASC
		LIMIT 100
	`
	return r.queryParafRows(ctx, q, parafVUserid)
}

// GetMonitoringDocuments returns rows where status_tertampil IN ('Sudah Divalidasi', 'Ditolak').
func (r *ParafRepo) GetMonitoringDocuments(ctx context.Context, parafVUserid string) ([]ParafBerkasRow, error) {
	if r.pool == nil {
		return nil, nil
	}
	q := parafBaseSelect + `
		WHERE pc.trackstatus = 'Terverifikasi'
		  AND pv.status_tertampil IN ('Sudah Divalidasi', 'Ditolak')
		ORDER BY pv.updated_at DESC, pv.no_validasi DESC
		LIMIT 100
	`
	return r.queryParafRows(ctx, q, parafVUserid)
}

func (r *ParafRepo) queryParafRows(ctx context.Context, q, userid string) ([]ParafBerkasRow, error) {
	rows, err := r.pool.Query(ctx, q, userid)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []ParafBerkasRow
	for rows.Next() {
		var row ParafBerkasRow
		if err := rows.Scan(&row.Nobooking, &row.NoValidasi, &row.Noppbb, &row.Tahunajb, &row.Namawajibpajak, &row.Namapemilikobjekpajak,
			&row.AktaTanahPath, &row.SertifikatTanahPath, &row.PelengkapPath, &row.NoRegistrasi,
			&row.Status, &row.Trackstatus, &row.StatusTertampil, &row.Keterangan, &row.UpdatedAt,
			&row.Namapembuat, &row.PenelitiTandaTanganPath, &row.StempelBookingPath, &row.PcPersetujuan, &row.TandaParafPath, &row.SignerUserid,
			&row.Pemverifikasi, &row.PemverifikasiNama, &row.Pemparaf, &row.PemparafNama); err != nil {
			continue
		}
		out = append(out, row)
	}
	return out, nil
}
