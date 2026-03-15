--
-- migrasi_to_neon.sql — skema penuh dari database bappenda (lokal) untuk dijalankan di Neon.
-- Dibuat dengan: pg_dump -U postgres -d bappenda --schema-only --no-owner --no-privileges
-- Cara pakai di Neon: psql "postgresql://...?sslmode=require" -f migrasi_to_neon.sql
-- Untuk generate ulang: jalankan generate_migrasi_to_neon.ps1 atau generate_migrasi_to_neon.bat (dengan PGPASSWORD set).
--

--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: jenis_wajib_pajak; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.jenis_wajib_pajak AS ENUM (
    'Badan Usaha',
    'Perorangan'
);


--
-- Name: audit_pv1_update(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.audit_pv1_update() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO pv_1_debug_log(no_validasi, old_status, new_status, updated_by, updated_at)
  VALUES (
    OLD.no_validasi,
    OLD.status,
    NEW.status,
    current_user,
    now()
  );
  RETURN NEW;
END;
$$;


--
-- Name: format_tanggalajb(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.format_tanggalajb() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Memastikan tanggalajb diformat dengan benar menjadi DD-MM-YYYY
    NEW.tanggalajb := CONCAT(
        LPAD(SUBSTRING(NEW.tanggalajb FROM 1 FOR 2), 2, '0'),  -- Tanggal dengan padding (2 digit)
        '-',  -- Menambahkan tanda hubung
        LPAD(SUBSTRING(NEW.tanggalajb FROM 3 FOR 2), 2, '0'),  -- Bulan dengan padding (2 digit)
        '-',  -- Menambahkan tanda hubung
        SUBSTRING(NEW.tanggalajb FROM 5 FOR 4)  -- Tahun (4 digit)
    );

    RETURN NEW;
END;
$$;


--
-- Name: generate_nobooking(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.generate_nobooking() RETURNS trigger
    LANGUAGE plpgsql
    AS $_$
DECLARE
    v_ppat_khusus VARCHAR;
    v_tahun INTEGER;
    v_urut INTEGER;
    v_nobooking VARCHAR;
BEGIN
    SELECT ppat_khusus INTO v_ppat_khusus
    FROM a_2_verified_users
    WHERE userid = NEW.userid;

    v_tahun := COALESCE(NEW.tahunajb::INTEGER, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER);

    SELECT COALESCE(MAX(CAST(SUBSTRING(nobooking FROM '[0-9]+$') AS INTEGER)), 0) + 1
    INTO v_urut
    FROM pat_1_bookingsspd
    WHERE userid = NEW.userid
      AND COALESCE(NULLIF(TRIM(tahunajb::TEXT), '')::INTEGER, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER) = v_tahun;

    IF v_ppat_khusus IS NULL OR v_ppat_khusus = '' THEN
        v_ppat_khusus := '0';
    END IF;

    v_nobooking := v_ppat_khusus || '-' || v_tahun::TEXT || '-' || LPAD(v_urut::TEXT, 6, '0');
    NEW.nobooking := v_nobooking;
    RETURN NEW;
END;
$_$;


--
-- Name: set_created_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_created_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.created_at := CURRENT_TIMESTAMP AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta';
  RETURN NEW;
END;
$$;


--
-- Name: set_default_status_ppat(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_default_status_ppat() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF NEW.divisi IN ('PPAT', 'PPATS') AND NEW.status_ppat IS NULL THEN
    NEW.status_ppat := 'aktif';
  END IF;
  RETURN NEW;
END;
$$;


--
-- Name: set_nobooking(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_nobooking() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    current_counter INT;
BEGIN
    -- Ambil counter berdasarkan tanggal
    SELECT counter INTO current_counter FROM daily_counter WHERE date = CURRENT_DATE;

    IF NOT FOUND THEN
        INSERT INTO daily_counter (date, counter) VALUES (CURRENT_DATE, 1);
        current_counter := 1;
    END IF;

    -- Set nobooking sesuai dengan format yang diinginkan (DD/MM/YYYY)
    NEW.nobooking := CONCAT(TO_CHAR(CURRENT_DATE, 'DD/MM/YYYY'), '-', current_counter);

    -- Update counter untuk hari ini
    UPDATE daily_counter SET counter = counter + 1 WHERE date = CURRENT_DATE;

    RETURN NEW;
END;
$$;


--
-- Name: set_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: update_notifications_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_notifications_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


--
-- Name: update_timestamp(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_timestamp() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: a_1_unverified_users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.a_1_unverified_users (
    id integer NOT NULL,
    nama character varying(255) NOT NULL,
    nik character varying(20) NOT NULL,
    telepon character varying(15) NOT NULL,
    email character varying(255) NOT NULL,
    password text NOT NULL,
    foto text,
    otp character varying(6),
    verifiedstatus character varying(50) NOT NULL,
    fotoprofil text,
    gender character varying(50),
    verse character varying(50),
    nip character varying(30),
    special_field character varying(250),
    pejabat_umum character varying(20),
    divisi character varying(20),
    ktp_ocr_json text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: a_1_unverified_users_new_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.a_1_unverified_users_new_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: a_1_unverified_users_new_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.a_1_unverified_users_new_id_seq OWNED BY public.a_1_unverified_users.id;


--
-- Name: a_2_verified_users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.a_2_verified_users (
    id integer NOT NULL,
    nama character varying(255) NOT NULL,
    nik character varying(20) NOT NULL,
    telepon character varying(15) NOT NULL,
    email character varying(255) NOT NULL,
    password text NOT NULL,
    foto text,
    otp character varying(6),
    verifiedstatus character varying(50) NOT NULL,
    fotoprofil text,
    userid character varying(255) NOT NULL,
    divisi character varying(255) NOT NULL,
    username character varying(255),
    statuspengguna character varying(50) DEFAULT 'offline'::character varying,
    nip character varying(20),
    special_parafv text,
    special_field character varying(255),
    ppat_khusus character varying(100),
    pejabat_umum character varying(50),
    status_ppat character varying(100),
    tanda_tangan_path text,
    tanda_tangan_mime text,
    last_active timestamp without time zone,
    gender text,
    verse character varying(50),
    alamat_pu text,
    npwp_badan text,
    nib text,
    nib_doc_path text
);


--
-- Name: a_2_verified_users_new_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.a_2_verified_users_new_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: a_2_verified_users_new_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.a_2_verified_users_new_id_seq OWNED BY public.a_2_verified_users.id;


--
-- Name: api_idempotency; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.api_idempotency (
    id integer NOT NULL,
    endpoint character varying(100) NOT NULL,
    idempotency_key character varying(64) NOT NULL,
    request_hash text,
    response_json jsonb,
    status character varying(20) DEFAULT 'stored'::character varying,
    created_at timestamp with time zone DEFAULT now(),
    expires_at timestamp with time zone
);


--
-- Name: api_idempotency_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.api_idempotency_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: api_idempotency_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.api_idempotency_id_seq OWNED BY public.api_idempotency.id;


--
-- Name: backup_jenis_wajib_pajak; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.backup_jenis_wajib_pajak (
    id integer
);


--
-- Name: backup_jenis_wajib_pajak_ppatk; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.backup_jenis_wajib_pajak_ppatk (
    bookingid integer
);


--
-- Name: bank_1_cek_hasil_transaksi; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bank_1_cek_hasil_transaksi (
    id integer NOT NULL,
    nobooking character varying(150) NOT NULL,
    userid character varying(50) NOT NULL,
    bphtb_yangtelah_dibayar integer,
    nomor_bukti_pembayaran character varying(255),
    tanggal_perolehan character varying(100),
    tanggal_pembayaran character varying(100),
    status_verifikasi character varying(75) DEFAULT 'Pending'::character varying,
    catatan_bank text,
    verified_by character varying(100),
    verified_at timestamp with time zone,
    no_registrasi character varying(100),
    status_dibank character varying(100) DEFAULT 'Dicheck'::character varying
);


--
-- Name: bank_1_cek_hasil_transaksi_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.bank_1_cek_hasil_transaksi_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: bank_1_cek_hasil_transaksi_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.bank_1_cek_hasil_transaksi_id_seq OWNED BY public.bank_1_cek_hasil_transaksi.id;


--
-- Name: banners; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.banners (
    id bigint NOT NULL,
    image_path text NOT NULL,
    link_url text,
    ttl_type character varying(20) NOT NULL,
    ttl_value integer,
    expires_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT banners_ttl_type_check CHECK (((ttl_type)::text = ANY ((ARRAY['hours'::character varying, 'day'::character varying, 'lifetime'::character varying])::text[])))
);


--
-- Name: banners_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.banners_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: banners_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.banners_id_seq OWNED BY public.banners.id;


--
-- Name: cek_ktp_ocr; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cek_ktp_ocr (
    id integer NOT NULL,
    ktp_ocr_json text,
    nik character varying(20)
);


--
-- Name: cek_ktp_ocr_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.cek_ktp_ocr_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: cek_ktp_ocr_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.cek_ktp_ocr_id_seq OWNED BY public.cek_ktp_ocr.id;


--
-- Name: daily_counter; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.daily_counter (
    date date NOT NULL,
    counter integer DEFAULT 1
);


--
-- Name: faq; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.faq (
    id bigint NOT NULL,
    question text NOT NULL,
    answer_html text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone
);


--
-- Name: faq_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.faq_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: faq_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.faq_id_seq OWNED BY public.faq.id;


--
-- Name: faqs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.faqs (
    id integer NOT NULL,
    question text NOT NULL,
    answer text NOT NULL,
    userid character varying(255),
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: faqs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.faqs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: faqs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.faqs_id_seq OWNED BY public.faqs.id;


--
-- Name: file_lengkap_tertandatangani; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.file_lengkap_tertandatangani (
    id integer NOT NULL,
    nobooking character varying(50) NOT NULL,
    userid character varying(50) NOT NULL,
    nama_pembuat_booking character varying(100),
    namawajibpajak character varying(100),
    tanda_tangan_path text,
    status_ttd character varying(20) DEFAULT 'pending'::character varying,
    tanggal_ttd timestamp without time zone,
    no_validasi character varying(100),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: file_lengkap_tertandatangani_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.file_lengkap_tertandatangani_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: file_lengkap_tertandatangani_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.file_lengkap_tertandatangani_id_seq OWNED BY public.file_lengkap_tertandatangani.id;


--
-- Name: lsb_1_serah_berkas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.lsb_1_serah_berkas (
    id integer NOT NULL,
    nobooking character varying(255) NOT NULL,
    userid character varying(50) NOT NULL,
    namawajibpajak character varying(255) NOT NULL,
    namapemilikobjekpajak character varying(255) NOT NULL,
    status character varying(50) NOT NULL,
    trackstatus character varying(50) NOT NULL,
    keterangan text,
    file_withstempel_path text,
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: TABLE lsb_1_serah_berkas; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.lsb_1_serah_berkas IS 'LSB_1 penyerahan dari tim LSB ke ppat/ppats';


--
-- Name: lsb_serah_berkas_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.lsb_serah_berkas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: lsb_serah_berkas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.lsb_serah_berkas_id_seq OWNED BY public.lsb_1_serah_berkas.id;


--
-- Name: ltb_1_terima_berkas_sspd; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ltb_1_terima_berkas_sspd (
    id integer NOT NULL,
    nobooking character varying(255),
    tanggal_terima character varying(50) DEFAULT to_char((now() AT TIME ZONE 'Asia/Jakarta'::text), 'DD-MM-YYYY'::text) NOT NULL,
    status character varying(50) DEFAULT 'Diterima'::character varying,
    pengirim_ltb text,
    trackstatus character varying(50) DEFAULT 'Diproses'::character varying,
    userid character varying(50) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    namawajibpajak character varying(255),
    namapemilikobjekpajak character varying(255),
    divisi character varying(255),
    nama character varying(255),
    jenis_wajib_pajak public.jenis_wajib_pajak,
    no_registrasi character varying(20)
);


--
-- Name: TABLE ltb_1_terima_berkas_sspd; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.ltb_1_terima_berkas_sspd IS 'LTB_1 menerima berkas booking dari ppat dan diteruskan ke peneliti';


--
-- Name: nobooking_daily_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.nobooking_daily_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: nobooking_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.nobooking_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: notices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notices (
    id integer NOT NULL,
    content text NOT NULL,
    active boolean DEFAULT false,
    userid character varying(255),
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: notices_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.notices_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: notices_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.notices_id_seq OWNED BY public.notices.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    userid character varying(50) NOT NULL,
    nobooking character varying(50),
    title character varying(255) NOT NULL,
    message text,
    type character varying(50) DEFAULT 'info'::character varying,
    is_read boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: p_1_verifikasi; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.p_1_verifikasi (
    id integer NOT NULL,
    nobooking character varying(50) NOT NULL,
    userid character varying(50) NOT NULL,
    namawajibpajak character varying(255) NOT NULL,
    namapemilikobjekpajak character varying(255) NOT NULL,
    tanggal_terima character varying(50) DEFAULT to_char((now() AT TIME ZONE 'Asia/Jakarta'::text), 'DD-MM-YYYY'::text) NOT NULL,
    status character varying(50),
    trackstatus character varying(50),
    pengirim_ltb text,
    pemilihan character varying(255),
    nomorstpd character varying(255),
    tanggalstpd date,
    angkapersen numeric(5,2),
    keterangandihitungsendiri text,
    isiketeranganlainnya text,
    nama_pengirim character varying(255),
    no_registrasi character varying(100),
    tanda_tangan_path text,
    persetujuan text,
    ttd_peneliti_mime character varying(50)
);


--
-- Name: p_2_verif_sign; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.p_2_verif_sign (
    id integer NOT NULL,
    nobooking character varying(100) NOT NULL,
    userid character varying(100) NOT NULL,
    stempel_booking_path text NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: p_3_clear_to_paraf; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.p_3_clear_to_paraf (
    id integer NOT NULL,
    nobooking character varying(255) NOT NULL,
    userid character varying(255) NOT NULL,
    namawajibpajak character varying(255) NOT NULL,
    namapemilikobjekpajak character varying(255) NOT NULL,
    tanggal_terima date,
    status character varying(50) NOT NULL,
    trackstatus character varying(50) NOT NULL,
    keterangan text,
    ttd_paraf_mime text,
    no_registrasi text,
    persetujuan text,
    tanda_paraf_path text,
    pemverifikasi character varying(100)
);


--
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.password_reset_tokens (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    token character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    expires_at timestamp without time zone
);


--
-- Name: password_reset_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.password_reset_tokens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: password_reset_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.password_reset_tokens_id_seq OWNED BY public.password_reset_tokens.id;


--
-- Name: pat_1_bookingsspd; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pat_1_bookingsspd (
    bookingid integer NOT NULL,
    userid character varying(50) NOT NULL,
    jenis_wajib_pajak public.jenis_wajib_pajak NOT NULL,
    nobooking character varying(255) NOT NULL,
    noppbb character varying(50) NOT NULL,
    namawajibpajak character varying(255) NOT NULL,
    alamatwajibpajak text NOT NULL,
    namapemilikobjekpajak character varying(255),
    alamatpemilikobjekpajak text,
    tanggal text,
    tahunajb integer DEFAULT 0 NOT NULL,
    kabupatenkotawp character varying(100) NOT NULL,
    kecamatanwp character varying(100) NOT NULL,
    kelurahandesawp character varying(100) NOT NULL,
    rtrwwp character varying(10) NOT NULL,
    npwpwp character varying(50),
    kodeposwp character varying(10) NOT NULL,
    kabupatenkotaop character varying(100) NOT NULL,
    kecamatanop character varying(100) NOT NULL,
    kelurahandesaop character varying(100) NOT NULL,
    rtrwop character varying(10) NOT NULL,
    npwpop character varying(50),
    kodeposop character varying(10) NOT NULL,
    trackstatus character varying(50) DEFAULT 'Draft'::character varying,
    akta_tanah_path character varying(255),
    sertifikat_tanah_path character varying(255),
    pelengkap_path character varying(255),
    nama character varying(255),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    file_withstempel_path character varying(255),
    nomor_validasi character varying(40),
    pdf_dokumen_path text,
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: pat_2_bphtb_perhitungan; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pat_2_bphtb_perhitungan (
    calculationid integer NOT NULL,
    nilaiperolehanobjekpajaktidakkenapajak numeric(15,2) NOT NULL,
    bphtb_yangtelah_dibayar integer,
    nobooking character varying(50) NOT NULL
);


--
-- Name: pat_3_documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pat_3_documents (
    id integer NOT NULL,
    userid character varying(255) NOT NULL,
    nama character varying(255) NOT NULL,
    path_document1 text,
    path_document2 text,
    upload_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    booking_id character varying(255)
);


--
-- Name: pat_4_objek_pajak; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pat_4_objek_pajak (
    id integer NOT NULL,
    letaktanahdanbangunan character varying(255) NOT NULL,
    rt_rwobjekpajak character varying(50),
    status_kepemilikan character varying(50),
    keterangan text,
    nomor_sertifikat character varying(100),
    tanggal_perolehan character varying(100),
    tanggal_pembayaran character varying(100),
    nomor_bukti_pembayaran character varying(100),
    nobooking character varying(255),
    harga_transaksi character varying(255),
    kelurahandesalp character varying(255),
    kecamatanlp character varying(255),
    jenis_perolehan text,
    CONSTRAINT ppatk_objek_pajak_status_kepemilikan_check CHECK (((status_kepemilikan)::text = ANY ((ARRAY['Milik Pribadi'::character varying, 'Milik Bersama'::character varying, 'Sewa'::character varying, 'Hak Guna Bangunan'::character varying])::text[])))
);


--
-- Name: pat_5_penghitungan_njop; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pat_5_penghitungan_njop (
    id integer NOT NULL,
    nobooking character varying(255) NOT NULL,
    luas_tanah numeric(10,2) NOT NULL,
    njop_tanah numeric(15,2) NOT NULL,
    luasxnjop_tanah numeric(15,2) GENERATED ALWAYS AS ((luas_tanah * njop_tanah)) STORED,
    luas_bangunan numeric(10,2) NOT NULL,
    njop_bangunan numeric(15,2) NOT NULL,
    luasxnjop_bangunan numeric(15,2) GENERATED ALWAYS AS ((luas_bangunan * njop_bangunan)) STORED,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    total_njoppbb numeric(15,2),
    CONSTRAINT ppatk_penghitungan_njop_luas_bangunan_check CHECK ((luas_bangunan >= (0)::numeric)),
    CONSTRAINT ppatk_penghitungan_njop_luas_tanah_check CHECK ((luas_tanah >= (0)::numeric)),
    CONSTRAINT ppatk_penghitungan_njop_njop_bangunan_check CHECK ((njop_bangunan >= (0)::numeric)),
    CONSTRAINT ppatk_penghitungan_njop_njop_tanah_check CHECK ((njop_tanah >= (0)::numeric)),
    CONSTRAINT valid_luas CHECK (((luas_tanah >= (0)::numeric) AND (luas_bangunan >= (0)::numeric))),
    CONSTRAINT valid_njop CHECK (((njop_tanah >= (0)::numeric) AND (njop_bangunan >= (0)::numeric)))
);


--
-- Name: pat_6_sign; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pat_6_sign (
    id integer NOT NULL,
    nobooking character varying(255) NOT NULL,
    userid character varying(100) NOT NULL,
    nama character varying(255) NOT NULL,
    path_ttd_ppatk character varying(255),
    path_ttd_wp character varying(255),
    ppat_khusus character varying(7)
);


--
-- Name: pat_7_validasi_surat; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pat_7_validasi_surat (
    id integer NOT NULL,
    nomor_validasi character varying(50) NOT NULL,
    nama_pemohon character varying(100) NOT NULL,
    alamat_pemohon text NOT NULL,
    no_telepon character varying(20) NOT NULL,
    tanggal_validasi timestamp with time zone DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Jakarta'::text) NOT NULL,
    tanggal_dibuat timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    status character varying(20) DEFAULT 'unused'::character varying,
    userid character varying(255),
    created_at timestamp with time zone DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Jakarta'::text),
    nobooking character varying(255),
    pemparaf text,
    status_tertampil character varying(100),
    CONSTRAINT ppatk_validasi_surat_status_check CHECK (((status)::text = ANY ((ARRAY['used'::character varying, 'unused'::character varying])::text[])))
);


--
-- Name: pat_8_validasi_tambahan; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pat_8_validasi_tambahan (
    id integer NOT NULL,
    nobooking character varying(50),
    kampungop character varying(50),
    kelurahanop character varying(50),
    kecamatanopj character varying(50),
    alamat_pemohon text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: peneliteri_clear_to_paraf_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.p_3_clear_to_paraf ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.peneliteri_clear_to_paraf_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: peneliti_data_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.peneliti_data_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: peneliti_data_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.peneliti_data_id_seq OWNED BY public.p_1_verifikasi.id;


--
-- Name: peneliti_verif_sign_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.peneliti_verif_sign_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: peneliti_verif_sign_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.peneliti_verif_sign_id_seq OWNED BY public.p_2_verif_sign.id;


--
-- Name: ppatk_bookingsspd_bookingid_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ppatk_bookingsspd_bookingid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ppatk_bookingsspd_bookingid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ppatk_bookingsspd_bookingid_seq OWNED BY public.pat_1_bookingsspd.bookingid;


--
-- Name: ppatk_bphtb_perhitungan_calculationid_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ppatk_bphtb_perhitungan_calculationid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ppatk_bphtb_perhitungan_calculationid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ppatk_bphtb_perhitungan_calculationid_seq OWNED BY public.pat_2_bphtb_perhitungan.calculationid;


--
-- Name: ppatk_documents_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ppatk_documents_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ppatk_documents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ppatk_documents_id_seq OWNED BY public.pat_3_documents.id;


--
-- Name: ppatk_objek_pajak_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ppatk_objek_pajak_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ppatk_objek_pajak_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ppatk_objek_pajak_id_seq OWNED BY public.pat_4_objek_pajak.id;


--
-- Name: ppatk_penghitungan_njop_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ppatk_penghitungan_njop_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ppatk_penghitungan_njop_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ppatk_penghitungan_njop_id_seq OWNED BY public.pat_5_penghitungan_njop.id;


--
-- Name: ppatk_sign_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ppatk_sign_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ppatk_sign_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ppatk_sign_id_seq OWNED BY public.pat_6_sign.id;


--
-- Name: ppatk_validasi_surat_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ppatk_validasi_surat_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ppatk_validasi_surat_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ppatk_validasi_surat_id_seq OWNED BY public.pat_7_validasi_surat.id;


--
-- Name: ppatk_validasi_tambahan_new_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ppatk_validasi_tambahan_new_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ppatk_validasi_tambahan_new_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ppatk_validasi_tambahan_new_id_seq OWNED BY public.pat_8_validasi_tambahan.id;


--
-- Name: pv_1_debug_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pv_1_debug_log (
    id integer NOT NULL,
    no_validasi character varying(100),
    old_status character varying(100),
    new_status character varying(100),
    updated_by text,
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: pv_1_debug_log_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.pv_1_debug_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: pv_1_debug_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.pv_1_debug_log_id_seq OWNED BY public.pv_1_debug_log.id;


--
-- Name: pv_1_paraf_validate; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pv_1_paraf_validate (
    nobooking character varying(50) NOT NULL,
    userid character varying(150),
    namawajibpajak text,
    namapemilikobjekpajak text,
    status character varying(100),
    trackstatus character varying(100),
    keterangan text,
    no_validasi character varying(100),
    pemverifikasi character varying(100),
    pemparaf character varying(100),
    status_tertampil character varying(100),
    no_registrasi character varying(40),
    id integer NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    tanda_tangan_validasi_path text,
    CONSTRAINT ck_pv1_no_validasi_format CHECK (((no_validasi)::text ~ '^[A-Z0-9]{8}-[A-Z0-9]{3}$'::text))
);


--
-- Name: pv_1_paraf_validate_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.pv_1_paraf_validate_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: pv_1_paraf_validate_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.pv_1_paraf_validate_id_seq OWNED BY public.pv_1_paraf_validate.id;


--
-- Name: pv_2_signing_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pv_2_signing_requests (
    id integer NOT NULL,
    document_id integer NOT NULL,
    signer_userid character varying(255),
    signer_role character varying(100) NOT NULL,
    bsre_request_id character varying(255),
    status character varying(20) DEFAULT 'Pending'::character varying NOT NULL,
    appearance_json jsonb,
    order_index integer DEFAULT 0 NOT NULL,
    signed_at timestamp with time zone,
    failure_reason text,
    usage_code character varying(100),
    password_attempts integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    nobooking character varying(255),
    no_validasi character varying(100) NOT NULL,
    source_pdf_path text,
    pdf_sha256 text,
    signed_pdf_path text,
    verification_report_json jsonb,
    signature_level text,
    qr_payload text,
    qr_image_path text,
    qr_sig text,
    qr_alg text,
    approved_by character varying(255),
    approved_at timestamp without time zone,
    CONSTRAINT ck_pv2_no_validasi_format CHECK (((no_validasi)::text ~ '^[A-Z0-9]{8}-[A-Z0-9]{3}$'::text)),
    CONSTRAINT pv_2_signing_requests_status_check CHECK (((status)::text = ANY (ARRAY['Pending'::text, 'Signing'::text, 'Signed'::text, 'Failed'::text, 'Cancelled'::text, 'APPROVED'::text])))
);


--
-- Name: pv_2_signing_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.pv_2_signing_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: pv_2_signing_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.pv_2_signing_requests_id_seq OWNED BY public.pv_2_signing_requests.id;


--
-- Name: pv_3_bsre_token_cache; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pv_3_bsre_token_cache (
    id integer NOT NULL,
    environment character varying(20) NOT NULL,
    access_token text NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    obtained_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT pv_3_bsre_token_cache_environment_check CHECK (((environment)::text = ANY ((ARRAY['sandbox'::character varying, 'prod'::character varying])::text[])))
);


--
-- Name: pv_3_bsre_token_cache_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.pv_3_bsre_token_cache_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: pv_3_bsre_token_cache_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.pv_3_bsre_token_cache_id_seq OWNED BY public.pv_3_bsre_token_cache.id;


--
-- Name: pv_4_signing_audit_event; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pv_4_signing_audit_event (
    id integer NOT NULL,
    entity_type character varying(50) NOT NULL,
    entity_id integer NOT NULL,
    event_type character varying(50) NOT NULL,
    payload_json jsonb,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    no_validasi text,
    signing_request_id integer,
    actor_userid text,
    origin text,
    correlation_id text,
    CONSTRAINT pv_4_signing_audit_event_entity_type_check CHECK (((entity_type)::text = ANY ((ARRAY['document'::character varying, 'signing_request'::character varying])::text[]))),
    CONSTRAINT pv_4_signing_audit_event_event_type_check CHECK (((event_type)::text = ANY ((ARRAY['created'::character varying, 'initiated'::character varying, 'otp_sent'::character varying, 'signed'::character varying, 'failed'::character varying, 'verified'::character varying])::text[])))
);


--
-- Name: pv_4_signing_audit_event_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.pv_4_signing_audit_event_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: pv_4_signing_audit_event_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.pv_4_signing_audit_event_id_seq OWNED BY public.pv_4_signing_audit_event.id;


--
-- Name: pv_7_audit_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pv_7_audit_log (
    id integer NOT NULL,
    no_validasi text,
    action text,
    acted_by text,
    reason text,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: pv_7_audit_log_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.pv_7_audit_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: pv_7_audit_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.pv_7_audit_log_id_seq OWNED BY public.pv_7_audit_log.id;


--
-- Name: pv_local_certs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pv_local_certs (
    id bigint NOT NULL,
    userid text NOT NULL,
    serial_number text NOT NULL,
    subject_cn text,
    subject_email text,
    subject_org text,
    public_key_pem text NOT NULL,
    algorithm text DEFAULT 'ECDSA-P256'::text,
    fingerprint_sha256 text,
    valid_from timestamp with time zone DEFAULT now(),
    valid_to timestamp with time zone DEFAULT (now() + '365 days'::interval),
    status text DEFAULT 'active'::text NOT NULL,
    revoked_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    passphrase_alg text,
    passphrase_salt text,
    passphrase_hash text,
    passphrase_iters integer,
    CONSTRAINT pv_local_certs_status_check CHECK ((status = ANY (ARRAY['active'::text, 'revoked'::text, 'expired'::text])))
);


--
-- Name: pv_local_certs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.pv_local_certs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: pv_local_certs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.pv_local_certs_id_seq OWNED BY public.pv_local_certs.id;


--
-- Name: sys_notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sys_notifications (
    id integer NOT NULL,
    recipient_id integer NOT NULL,
    recipient_divisi character varying(50) NOT NULL,
    title character varying(255) NOT NULL,
    message text NOT NULL,
    booking_id integer NOT NULL,
    is_read boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    expires_at timestamp without time zone DEFAULT (CURRENT_TIMESTAMP + '00:00:30'::interval)
);


--
-- Name: sys_notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.sys_notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sys_notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.sys_notifications_id_seq OWNED BY public.sys_notifications.id;


--
-- Name: terima_berkas_sspd_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.terima_berkas_sspd_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: terima_berkas_sspd_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.terima_berkas_sspd_id_seq OWNED BY public.ltb_1_terima_berkas_sspd.id;


--
-- Name: ttd_paraf_kasie; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ttd_paraf_kasie (
    userid text NOT NULL,
    signfile_path text NOT NULL,
    sign_paraf text,
    nobooking text,
    id bigint NOT NULL
);


--
-- Name: ttd_paraf_kasie_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ttd_paraf_kasie_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ttd_paraf_kasie_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ttd_paraf_kasie_id_seq OWNED BY public.ttd_paraf_kasie.id;


--
-- Name: user_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_sessions (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);


--
-- Name: a_1_unverified_users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.a_1_unverified_users ALTER COLUMN id SET DEFAULT nextval('public.a_1_unverified_users_new_id_seq'::regclass);


--
-- Name: a_2_verified_users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.a_2_verified_users ALTER COLUMN id SET DEFAULT nextval('public.a_2_verified_users_new_id_seq'::regclass);


--
-- Name: api_idempotency id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.api_idempotency ALTER COLUMN id SET DEFAULT nextval('public.api_idempotency_id_seq'::regclass);


--
-- Name: bank_1_cek_hasil_transaksi id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bank_1_cek_hasil_transaksi ALTER COLUMN id SET DEFAULT nextval('public.bank_1_cek_hasil_transaksi_id_seq'::regclass);


--
-- Name: banners id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.banners ALTER COLUMN id SET DEFAULT nextval('public.banners_id_seq'::regclass);


--
-- Name: cek_ktp_ocr id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cek_ktp_ocr ALTER COLUMN id SET DEFAULT nextval('public.cek_ktp_ocr_id_seq'::regclass);


--
-- Name: faq id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.faq ALTER COLUMN id SET DEFAULT nextval('public.faq_id_seq'::regclass);


--
-- Name: faqs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.faqs ALTER COLUMN id SET DEFAULT nextval('public.faqs_id_seq'::regclass);


--
-- Name: file_lengkap_tertandatangani id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.file_lengkap_tertandatangani ALTER COLUMN id SET DEFAULT nextval('public.file_lengkap_tertandatangani_id_seq'::regclass);


--
-- Name: lsb_1_serah_berkas id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lsb_1_serah_berkas ALTER COLUMN id SET DEFAULT nextval('public.lsb_serah_berkas_id_seq'::regclass);


--
-- Name: ltb_1_terima_berkas_sspd id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ltb_1_terima_berkas_sspd ALTER COLUMN id SET DEFAULT nextval('public.terima_berkas_sspd_id_seq'::regclass);


--
-- Name: notices id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notices ALTER COLUMN id SET DEFAULT nextval('public.notices_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: p_1_verifikasi id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.p_1_verifikasi ALTER COLUMN id SET DEFAULT nextval('public.peneliti_data_id_seq'::regclass);


--
-- Name: p_2_verif_sign id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.p_2_verif_sign ALTER COLUMN id SET DEFAULT nextval('public.peneliti_verif_sign_id_seq'::regclass);


--
-- Name: password_reset_tokens id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_reset_tokens ALTER COLUMN id SET DEFAULT nextval('public.password_reset_tokens_id_seq'::regclass);


--
-- Name: pat_1_bookingsspd bookingid; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pat_1_bookingsspd ALTER COLUMN bookingid SET DEFAULT nextval('public.ppatk_bookingsspd_bookingid_seq'::regclass);


--
-- Name: pat_2_bphtb_perhitungan calculationid; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pat_2_bphtb_perhitungan ALTER COLUMN calculationid SET DEFAULT nextval('public.ppatk_bphtb_perhitungan_calculationid_seq'::regclass);


--
-- Name: pat_3_documents id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pat_3_documents ALTER COLUMN id SET DEFAULT nextval('public.ppatk_documents_id_seq'::regclass);


--
-- Name: pat_4_objek_pajak id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pat_4_objek_pajak ALTER COLUMN id SET DEFAULT nextval('public.ppatk_objek_pajak_id_seq'::regclass);


--
-- Name: pat_5_penghitungan_njop id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pat_5_penghitungan_njop ALTER COLUMN id SET DEFAULT nextval('public.ppatk_penghitungan_njop_id_seq'::regclass);


--
-- Name: pat_6_sign id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pat_6_sign ALTER COLUMN id SET DEFAULT nextval('public.ppatk_sign_id_seq'::regclass);


--
-- Name: pat_7_validasi_surat id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pat_7_validasi_surat ALTER COLUMN id SET DEFAULT nextval('public.ppatk_validasi_surat_id_seq'::regclass);


--
-- Name: pat_8_validasi_tambahan id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pat_8_validasi_tambahan ALTER COLUMN id SET DEFAULT nextval('public.ppatk_validasi_tambahan_new_id_seq'::regclass);


--
-- Name: pv_1_debug_log id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pv_1_debug_log ALTER COLUMN id SET DEFAULT nextval('public.pv_1_debug_log_id_seq'::regclass);


--
-- Name: pv_1_paraf_validate id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pv_1_paraf_validate ALTER COLUMN id SET DEFAULT nextval('public.pv_1_paraf_validate_id_seq'::regclass);


--
-- Name: pv_2_signing_requests id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pv_2_signing_requests ALTER COLUMN id SET DEFAULT nextval('public.pv_2_signing_requests_id_seq'::regclass);


--
-- Name: pv_3_bsre_token_cache id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pv_3_bsre_token_cache ALTER COLUMN id SET DEFAULT nextval('public.pv_3_bsre_token_cache_id_seq'::regclass);


--
-- Name: pv_4_signing_audit_event id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pv_4_signing_audit_event ALTER COLUMN id SET DEFAULT nextval('public.pv_4_signing_audit_event_id_seq'::regclass);


--
-- Name: pv_7_audit_log id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pv_7_audit_log ALTER COLUMN id SET DEFAULT nextval('public.pv_7_audit_log_id_seq'::regclass);


--
-- Name: pv_local_certs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pv_local_certs ALTER COLUMN id SET DEFAULT nextval('public.pv_local_certs_id_seq'::regclass);


--
-- Name: sys_notifications id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sys_notifications ALTER COLUMN id SET DEFAULT nextval('public.sys_notifications_id_seq'::regclass);


--
-- Name: ttd_paraf_kasie id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ttd_paraf_kasie ALTER COLUMN id SET DEFAULT nextval('public.ttd_paraf_kasie_id_seq'::regclass);


--
-- Name: a_1_unverified_users a_1_unverified_users_new_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.a_1_unverified_users
    ADD CONSTRAINT a_1_unverified_users_new_pkey PRIMARY KEY (id);


--
-- Name: a_2_verified_users a_2_verified_users_new_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.a_2_verified_users
    ADD CONSTRAINT a_2_verified_users_new_pkey PRIMARY KEY (id);


--
-- Name: api_idempotency api_idempotency_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.api_idempotency
    ADD CONSTRAINT api_idempotency_pkey PRIMARY KEY (id);


--
-- Name: bank_1_cek_hasil_transaksi bank_1_cek_hasil_transaksi_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bank_1_cek_hasil_transaksi
    ADD CONSTRAINT bank_1_cek_hasil_transaksi_pkey PRIMARY KEY (id);


--
-- Name: banners banners_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.banners
    ADD CONSTRAINT banners_pkey PRIMARY KEY (id);


--
-- Name: cek_ktp_ocr cek_ktp_ocr_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cek_ktp_ocr
    ADD CONSTRAINT cek_ktp_ocr_pkey PRIMARY KEY (id);


--
-- Name: daily_counter daily_counter_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_counter
    ADD CONSTRAINT daily_counter_pkey PRIMARY KEY (date);


--
-- Name: faq faq_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.faq
    ADD CONSTRAINT faq_pkey PRIMARY KEY (id);


--
-- Name: faqs faqs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.faqs
    ADD CONSTRAINT faqs_pkey PRIMARY KEY (id);


--
-- Name: file_lengkap_tertandatangani file_lengkap_tertandatangani_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.file_lengkap_tertandatangani
    ADD CONSTRAINT file_lengkap_tertandatangani_pkey PRIMARY KEY (id);


--
-- Name: lsb_1_serah_berkas lsb_serah_berkas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lsb_1_serah_berkas
    ADD CONSTRAINT lsb_serah_berkas_pkey PRIMARY KEY (id);


--
-- Name: pat_1_bookingsspd nobooking_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pat_1_bookingsspd
    ADD CONSTRAINT nobooking_unique UNIQUE (nobooking);


--
-- Name: notices notices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notices
    ADD CONSTRAINT notices_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: pv_1_paraf_validate paraf_validate_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pv_1_paraf_validate
    ADD CONSTRAINT paraf_validate_pkey PRIMARY KEY (nobooking);


--
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (id);


--
-- Name: p_3_clear_to_paraf peneliteri_clear_to_paraf_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.p_3_clear_to_paraf
    ADD CONSTRAINT peneliteri_clear_to_paraf_pkey PRIMARY KEY (id);


--
-- Name: p_1_verifikasi peneliti_data_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.p_1_verifikasi
    ADD CONSTRAINT peneliti_data_pkey PRIMARY KEY (id);


--
-- Name: p_2_verif_sign peneliti_verif_sign_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.p_2_verif_sign
    ADD CONSTRAINT peneliti_verif_sign_pkey PRIMARY KEY (id);


--
-- Name: pat_1_bookingsspd ppatk_bookingsspd_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pat_1_bookingsspd
    ADD CONSTRAINT ppatk_bookingsspd_pkey PRIMARY KEY (bookingid);


--
-- Name: pat_2_bphtb_perhitungan ppatk_bphtb_perhitungan_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pat_2_bphtb_perhitungan
    ADD CONSTRAINT ppatk_bphtb_perhitungan_pkey PRIMARY KEY (calculationid);


--
-- Name: pat_3_documents ppatk_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pat_3_documents
    ADD CONSTRAINT ppatk_documents_pkey PRIMARY KEY (id);


--
-- Name: pat_4_objek_pajak ppatk_objek_pajak_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pat_4_objek_pajak
    ADD CONSTRAINT ppatk_objek_pajak_pkey PRIMARY KEY (id);


--
-- Name: pat_5_penghitungan_njop ppatk_penghitungan_njop_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pat_5_penghitungan_njop
    ADD CONSTRAINT ppatk_penghitungan_njop_pkey PRIMARY KEY (id);


--
-- Name: pat_6_sign ppatk_sign_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pat_6_sign
    ADD CONSTRAINT ppatk_sign_pkey PRIMARY KEY (id);


--
-- Name: pat_7_validasi_surat ppatk_validasi_surat_nomor_validasi_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pat_7_validasi_surat
    ADD CONSTRAINT ppatk_validasi_surat_nomor_validasi_key UNIQUE (nomor_validasi);


--
-- Name: pat_7_validasi_surat ppatk_validasi_surat_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pat_7_validasi_surat
    ADD CONSTRAINT ppatk_validasi_surat_pkey PRIMARY KEY (id);


--
-- Name: pat_8_validasi_tambahan ppatk_validasi_tambahan_new_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pat_8_validasi_tambahan
    ADD CONSTRAINT ppatk_validasi_tambahan_new_pkey PRIMARY KEY (id);


--
-- Name: pv_1_debug_log pv_1_debug_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pv_1_debug_log
    ADD CONSTRAINT pv_1_debug_log_pkey PRIMARY KEY (id);


--
-- Name: pv_2_signing_requests pv_2_signing_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pv_2_signing_requests
    ADD CONSTRAINT pv_2_signing_requests_pkey PRIMARY KEY (id);


--
-- Name: pv_3_bsre_token_cache pv_3_bsre_token_cache_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pv_3_bsre_token_cache
    ADD CONSTRAINT pv_3_bsre_token_cache_pkey PRIMARY KEY (id);


--
-- Name: pv_4_signing_audit_event pv_4_signing_audit_event_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pv_4_signing_audit_event
    ADD CONSTRAINT pv_4_signing_audit_event_pkey PRIMARY KEY (id);


--
-- Name: pv_7_audit_log pv_7_audit_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pv_7_audit_log
    ADD CONSTRAINT pv_7_audit_log_pkey PRIMARY KEY (id);


--
-- Name: pv_local_certs pv_local_certs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pv_local_certs
    ADD CONSTRAINT pv_local_certs_pkey PRIMARY KEY (id);


--
-- Name: pv_local_certs pv_local_certs_serial_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pv_local_certs
    ADD CONSTRAINT pv_local_certs_serial_number_key UNIQUE (serial_number);


--
-- Name: user_sessions session_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);


--
-- Name: sys_notifications sys_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sys_notifications
    ADD CONSTRAINT sys_notifications_pkey PRIMARY KEY (id);


--
-- Name: ltb_1_terima_berkas_sspd terima_berkas_sspd_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ltb_1_terima_berkas_sspd
    ADD CONSTRAINT terima_berkas_sspd_pkey PRIMARY KEY (id);


--
-- Name: ttd_paraf_kasie ttd_paraf_kasie_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ttd_paraf_kasie
    ADD CONSTRAINT ttd_paraf_kasie_pkey PRIMARY KEY (id);


--
-- Name: pat_1_bookingsspd unique_noval; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pat_1_bookingsspd
    ADD CONSTRAINT unique_noval UNIQUE (nomor_validasi);


--
-- Name: a_2_verified_users verified_users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.a_2_verified_users
    ADD CONSTRAINT verified_users_email_key UNIQUE (email);


--
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_session_expire" ON public.user_sessions USING btree (expire);


--
-- Name: idx_audit_event_composite; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_event_composite ON public.pv_4_signing_audit_event USING btree (entity_type, entity_id);


--
-- Name: idx_audit_event_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_event_created_at ON public.pv_4_signing_audit_event USING btree (created_at);


--
-- Name: idx_audit_event_entity_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_event_entity_id ON public.pv_4_signing_audit_event USING btree (entity_id);


--
-- Name: idx_audit_event_entity_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_event_entity_type ON public.pv_4_signing_audit_event USING btree (entity_type);


--
-- Name: idx_audit_event_event_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_event_event_type ON public.pv_4_signing_audit_event USING btree (event_type);


--
-- Name: idx_audit_no_validasi_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_no_validasi_created ON public.pv_4_signing_audit_event USING btree (no_validasi, created_at DESC);


--
-- Name: idx_banners_expires_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_banners_expires_at ON public.banners USING btree (expires_at);


--
-- Name: idx_bsre_token_cache_environment; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bsre_token_cache_environment ON public.pv_3_bsre_token_cache USING btree (environment);


--
-- Name: idx_bsre_token_cache_expires_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bsre_token_cache_expires_at ON public.pv_3_bsre_token_cache USING btree (expires_at);


--
-- Name: idx_bsre_token_cache_obtained_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bsre_token_cache_obtained_at ON public.pv_3_bsre_token_cache USING btree (obtained_at);


--
-- Name: idx_faq_expires_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_faq_expires_at ON public.faq USING btree (expires_at);


--
-- Name: idx_idem_expires; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_idem_expires ON public.api_idempotency USING btree (expires_at);


--
-- Name: idx_notifications_booking; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_booking ON public.sys_notifications USING btree (booking_id);


--
-- Name: idx_notifications_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_created_at ON public.notifications USING btree (created_at);


--
-- Name: idx_notifications_divisi; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_divisi ON public.sys_notifications USING btree (recipient_divisi, is_read);


--
-- Name: idx_notifications_is_read; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_is_read ON public.notifications USING btree (is_read);


--
-- Name: idx_notifications_nobooking; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_nobooking ON public.notifications USING btree (nobooking);


--
-- Name: idx_notifications_recipient; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_recipient ON public.sys_notifications USING btree (recipient_id, is_read, created_at);


--
-- Name: idx_notifications_userid; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_userid ON public.notifications USING btree (userid);


--
-- Name: idx_ppatk_bookingsspd_nobooking; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ppatk_bookingsspd_nobooking ON public.pat_1_bookingsspd USING btree (nobooking);


--
-- Name: idx_ppatk_nobooking; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ppatk_nobooking ON public.pat_5_penghitungan_njop USING btree (nobooking);


--
-- Name: idx_pv2_no_validasi; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pv2_no_validasi ON public.pv_2_signing_requests USING btree (no_validasi, id DESC);


--
-- Name: idx_token_env_expires; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_token_env_expires ON public.pv_3_bsre_token_cache USING btree (environment, expires_at DESC);


--
-- Name: ux_idem_endpoint_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ux_idem_endpoint_key ON public.api_idempotency USING btree (endpoint, idempotency_key);


--
-- Name: ux_pv1_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ux_pv1_id ON public.pv_1_paraf_validate USING btree (id);


--
-- Name: ux_pv1_no_validasi; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ux_pv1_no_validasi ON public.pv_1_paraf_validate USING btree (no_validasi);


--
-- Name: ux_pv2_no_validasi; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ux_pv2_no_validasi ON public.pv_2_signing_requests USING btree (no_validasi);


--
-- Name: pv_1_paraf_validate tg_audit_pv1; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER tg_audit_pv1 AFTER UPDATE ON public.pv_1_paraf_validate FOR EACH ROW EXECUTE FUNCTION public.audit_pv1_update();


--
-- Name: pat_1_bookingsspd trg_nobooking; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_nobooking BEFORE INSERT ON public.pat_1_bookingsspd FOR EACH ROW EXECUTE FUNCTION public.generate_nobooking();


--
-- Name: pat_5_penghitungan_njop trg_ppatk_update; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_ppatk_update BEFORE UPDATE ON public.pat_5_penghitungan_njop FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();


--
-- Name: a_2_verified_users trg_set_status_ppat; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_set_status_ppat BEFORE INSERT OR UPDATE ON public.a_2_verified_users FOR EACH ROW EXECUTE FUNCTION public.set_default_status_ppat();


--
-- Name: lsb_1_serah_berkas trg_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_updated_at BEFORE UPDATE ON public.lsb_1_serah_berkas FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: pat_8_validasi_tambahan trigger_set_created_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_set_created_at BEFORE INSERT ON public.pat_8_validasi_tambahan FOR EACH ROW EXECUTE FUNCTION public.set_created_at();


--
-- Name: notifications update_notifications_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON public.notifications FOR EACH ROW EXECUTE FUNCTION public.update_notifications_updated_at_column();


--
-- Name: pat_2_bphtb_perhitungan fk_bphtb_nobooking; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pat_2_bphtb_perhitungan
    ADD CONSTRAINT fk_bphtb_nobooking FOREIGN KEY (nobooking) REFERENCES public.pat_1_bookingsspd(nobooking);


--
-- Name: pat_5_penghitungan_njop fk_njop_nobooking; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pat_5_penghitungan_njop
    ADD CONSTRAINT fk_njop_nobooking FOREIGN KEY (nobooking) REFERENCES public.pat_1_bookingsspd(nobooking);


--
-- Name: pat_1_bookingsspd fk_noval; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pat_1_bookingsspd
    ADD CONSTRAINT fk_noval FOREIGN KEY (nomor_validasi) REFERENCES public.pat_7_validasi_surat(nomor_validasi);


--
-- Name: pat_4_objek_pajak fk_objekpajak_nobooking; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pat_4_objek_pajak
    ADD CONSTRAINT fk_objekpajak_nobooking FOREIGN KEY (nobooking) REFERENCES public.pat_1_bookingsspd(nobooking);


--
-- Name: pv_2_signing_requests fk_pv2_no_validasi_pv1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pv_2_signing_requests
    ADD CONSTRAINT fk_pv2_no_validasi_pv1 FOREIGN KEY (no_validasi) REFERENCES public.pv_1_paraf_validate(no_validasi);


--
-- Name: pv_4_signing_audit_event fk_signing_audit_event_request; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pv_4_signing_audit_event
    ADD CONSTRAINT fk_signing_audit_event_request FOREIGN KEY (signing_request_id) REFERENCES public.pv_2_signing_requests(id);


--
-- Name: sys_notifications sys_notifications_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sys_notifications
    ADD CONSTRAINT sys_notifications_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.pat_1_bookingsspd(bookingid);


--
-- Name: sys_notifications sys_notifications_recipient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sys_notifications
    ADD CONSTRAINT sys_notifications_recipient_id_fkey FOREIGN KEY (recipient_id) REFERENCES public.a_2_verified_users(id);


--
-- Name: pv_1_paraf_validate; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.pv_1_paraf_validate ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--

