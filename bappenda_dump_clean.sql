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
    AS $$
DECLARE
    v_ppatk_khusus text;
    v_current_year text;
    v_sequence_number integer;
    v_nobooking text;
BEGIN
    -- Dapatkan ppatk_khusus dari verified users
    SELECT ppatk_khusus 
    INTO v_ppatk_khusus
    FROM a_2_verified_users 
    WHERE userid = NEW.userid;

    -- Jika tidak ditemukan user, beri error
    IF NOT FOUND THEN
        RAISE EXCEPTION 'User ID % not found in a_2_verified_users', NEW.userid;
    END IF;

    -- Pastikan ppatk_khusus tidak null
    IF v_ppatk_khusus IS NULL THEN
        RAISE EXCEPTION 'ppatk_khusus is NULL for user ID %', NEW.userid;
    END IF;

    -- Dapatkan tahun sekarang
    v_current_year := EXTRACT(YEAR FROM CURRENT_DATE)::text;

    -- Hitung urutan booking untuk ppatk_khusus dan tahun ini
    SELECT COALESCE(COUNT(*), 0) + 1 
    INTO v_sequence_number
    FROM pat_1_bookingsspd 
    WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE)
    AND nobooking LIKE v_ppatk_khusus || '-' || v_current_year || '-%';

    -- Format urutan dengan 6 digit
    v_nobooking := v_ppatk_khusus || '-' || v_current_year || '-' || 
                  LPAD(v_sequence_number::text, 6, '0');

    -- Set nobooking
    NEW.nobooking := v_nobooking;
    
    RETURN NEW;
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        RAISE EXCEPTION 'User ID % not found in verified users table', NEW.userid;
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error generating nobooking: %', SQLERRM;
END;
$$;


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
    fotoprofil text
);


--
-- Name: TABLE a_1_unverified_users; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.a_1_unverified_users IS 'A_1 untuk penyimpanan users yang belum terverified';


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
    statuspengguna character varying(50) DEFAULT 'offline'::character varying,
    username character varying(255),
    nip character varying(20),
    ppatk_khusus character varying(100),
    special_field character varying(255),
    last_active timestamp without time zone,
    tanda_tangan_path text,
    special_parafv text,
    tanda_tangan_mime text,
    pejabat_umum character varying(50),
    status_ppat character varying(100)
);


--
-- Name: TABLE a_2_verified_users; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.a_2_verified_users IS 'A_2 untuk penyimpanan users yang datanya sudah lengkap';


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
-- Name: daily_counter; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.daily_counter (
    date date NOT NULL,
    counter integer DEFAULT 1
);


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
    pdf_dokumen_path text
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
    path_ttd_wp character varying(255)
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
-- Name: unverified_users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.unverified_users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: unverified_users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.unverified_users_id_seq OWNED BY public.a_1_unverified_users.id;


--
-- Name: user_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_sessions (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);


--
-- Name: verified_users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.verified_users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: verified_users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.verified_users_id_seq OWNED BY public.a_2_verified_users.id;


--
-- Name: a_1_unverified_users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.a_1_unverified_users ALTER COLUMN id SET DEFAULT nextval('public.unverified_users_id_seq'::regclass);


--
-- Name: a_2_verified_users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.a_2_verified_users ALTER COLUMN id SET DEFAULT nextval('public.verified_users_id_seq'::regclass);


--
-- Name: api_idempotency id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.api_idempotency ALTER COLUMN id SET DEFAULT nextval('public.api_idempotency_id_seq'::regclass);


--
-- Name: bank_1_cek_hasil_transaksi id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bank_1_cek_hasil_transaksi ALTER COLUMN id SET DEFAULT nextval('public.bank_1_cek_hasil_transaksi_id_seq'::regclass);


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
-- Data for Name: a_1_unverified_users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.a_1_unverified_users (id, nama, nik, telepon, email, password, foto, otp, verifiedstatus, fotoprofil) FROM stdin;
59	Farras Syauqi	12345678	087726101813	niemail@test.com	$2b$10$u3NUTJeIKccTb2imnGHsled6QJbCkGFvuZWjaG5JFlQad1etMjMvm	public\\uploads\\1747785591805.jpeg	119596	unverified	
42	AAM MUHARAM	12345567890123	08111111111	mhrmaam1960@gmail.com	$2b$10$hS9IdMhi8/lcIGnpPSgwl..dvImqZjzy.3XPj7b7aQZEgve.F/45K	public\\uploads\\1747020159739.jpeg	565611	unverified	
46	Farras Syauqi	123456789	087726101813	farras_syetefe@gmail.com	$2b$10$bqIkl1NQ9HPqixx5pt9OfOcF3c9Z6O5cGP6olvrDiz8IPc5ps4Bvq	public\\uploads\\1747288799995.jpeg	441467	unverified	
47	Farras Syauqi	123456789	087726101813	farras_12345@gmail.com	$2b$10$YElxYqZZSSAKZ3Oplc53CuQKiQty9nCC88yPpuVCUo4wXmqaMVDTO	public\\uploads\\1747288922176.jpeg	158151	unverified	
\.


--
-- Data for Name: a_2_verified_users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.a_2_verified_users (id, nama, nik, telepon, email, password, foto, otp, verifiedstatus, fotoprofil, userid, divisi, statuspengguna, username, nip, ppatk_khusus, special_field, last_active, tanda_tangan_path, special_parafv, tanda_tangan_mime, pejabat_umum, status_ppat) FROM stdin;
50	test3	12345	12345	email3@test.com	$2b$10$h1yS8IzO5DV.aoyBRNb6A.7Br.rn3PwGCKFEODkrO7FXvAQwc0iBq	public\\uploads\\1747929676965.jpeg	728241	complete	penting_F_simpan/profile-photo/default-foto-profile.png	WP01	Wajib Pajak	online	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
46	ini	1234	09109	inie@gmail.com	$2b$10$aitynHJQbHbCnCDk2LQO.uB5tz61Ngdrr3bx56hBZtWTKpP/HY5TW	public\\uploads\\1747718478981.jpeg	607799	complete	penting_F_simpan/profile-photo/default-foto-profile.png	PV01	Peneliti Validasi	online	Farras_nich	3218301223	\N		2025-09-22 02:15:29.972168	/penting_F_simpan/folderttd/parafv_sign/ttd-PV01.png	Ini ST. ESTE. MT	image/png	\N	\N
17	arras	1234567819212124	08111111111	rainrain2283@gmail.com	$2b$10$xxDIl7v/Np2kI1jlB6ugXOJyvYksUH2TfWeSJTOSOZZzfUI38UAAi	public\\uploads\\1744706491879.jpg	146006	complete	penting_F_simpan/profile-photo/default-foto-profile.png	A02	Administrator	offline	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
45	ds	1234	23	es@email.com	$2b$10$BjTLvF.Mk05DSUZyKJ66oOeyd7HBsECdfg0ra5EyBa6KO4mjqMLwi	public\\uploads\\1747715637624.jpeg	717176	complete	penting_F_simpan/profile-photo/default-foto-profile.png	LSB01	LSB	online	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
1	Admin_bap	1234567890	08123456789	admin@example.com	$2b$10$OvqKqeJH1Glt2/E5wCXu1.QeTqUs68PmK3wlrkl/e7YCkdso3KVBC	public/asset/default.jpg		complete	penting_F_simpan/profile-photo/1745319450779.jpeg	SA01	Administrator	online	Rasya	12314355352	\N	\N	\N	\N	\N	\N	\N	\N
42	Farras Syauqi	1234567789	087726101813	INImail@testing.com	$2b$10$XCIeuP0X.pLazJqf237MW.tOe4GXiX/3ASMIrP5kd9egr0mOPhHXi	public\\uploads\\1747700244202.jpeg	501983	complete	penting_F_simpan/profile-photo/default-foto-profile.png	L01	LTB	offline	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
48	test1	12345	1234	email1@test.com	$2b$10$b9/vK8lqZBE9UphHzXlr0O94Quadf9T6Ye/ahgHSfzxU9Y/EUn3aq	public\\uploads\\1747929597657.jpeg	892043	complete	penting_F_simpan/profile-photo/default-foto-profile.png	PATS02	PPATS	online	\N	\N	20005	\N	\N	\N	\N	\N	\N	aktif
59	Arras Sendal	123141413413414	08882228882	arras@arras.arras	$2b$10$8UpijYZ7kWIScOKigeBXJekMoa4wNhQNV6UY6YJRMJUc.JfkfYhvG	public\\penting_F_simpan\\uploads_ktp\\ktp-1755790999643.jpg	965375	complete	/penting_F_simpan/profile-photo/default-foto-profile.png	PAT05	PPAT	offline	editkaliya	348304	20007	\N	\N	\N	\N	\N	\N	aktif
47	s	12345	1244	Farras@test.com	$2b$10$YRelSHCH5pCcxAspgq.6Xe4G.ARYSuHGAI/0HrMfTsZ2Zkw.ocha6	public\\uploads\\1747802128073.jpeg	455695	complete	penting_F_simpan/profile-photo/default-foto-profile.png	PAT03	PPAT	online			20004	\N	\N	\N	\N	\N	\N	non-aktif
61	SYAUQI SIHAHA	348943743947	08123471812	farraskece007@gmail.com	$2b$10$A8e5JyihLqB66d6sc6EVA.BDQ0xy9XDJO9h5TkYQK8MCtFnMMaxjC	public\\penting_F_simpan\\uploads_ktp\\ktp-1758138106049.jpeg	911211	complete	/penting_F_simpan/profile-photo/default-foto-profile.png	LSB02	LSB	offline	GANYENG	437473298479	\N		2025-09-21 22:19:20.042697	\N		\N	\N	\N
40	Farras Syauqi	12345	087726101813	rainrain@testing.com	$2b$10$vNPU2A7707V7XqyyclPBkOp55y6ieMqhimMm9INFxOGMYr6X2xWyy	public\\uploads\\1747337182132.jpeg	897133	complete	/penting_F_simpan/profile-photo/PAT02_foto_profile_1757415196072.jpeg	PAT02	PPAT	offline	Rasya_cuy	11223344	20002	Rasya .ST.ST	2025-09-11 15:10:02.494903	/penting_F_simpan/folderttd/folderttd_ppatk/ttd-PAT02.png	\N	image/png	\N	aktif
53	FARRAS	2431431412	0891232312	anginangin@test.com	$2b$10$r1lnkxS0nl8gUnuG4QZPQeygaZCIDl6Kf6DqpPu/Qj654bwzk6yVO	public\\uploads\\1750957434454.jpeg	755441	complete	penting_F_simpan/profile-photo/default-foto-profile.png	P03	Peneliti	offline	ini_uname	123456577889	\N		2025-09-04 18:07:17.921228	image/jpeg	\N	\N	\N	\N
51	Rasya Sarinaka	12345678910	12345678910	farras.muharam@gmail.com	$2b$10$0xe0OwBV/MAzyWUnz/r6feQVL9YhA.9Poc/W9W48ABodhStbELApW	public\\uploads\\1748403727492.jpeg	382729	complete	penting_F_simpan/profile-photo/default-foto-profile.png	P01	Peneliti	offline	ini_uname	123456577889	\N		2025-09-22 00:23:55.722813	/penting_F_simpan/folderttd/peneliti_sign/ttd-P01.png	\N	image/png	\N	\N
60	Rasya Indehouse	381238209379123	483094839410	anginbom75@gmail.com	$2b$10$JcR4v.MRhUjXS3pmQGDvWO.1pHESlPE0JOCGuXmvsO5xBFFPARuR2	public\\penting_F_simpan\\uploads_ktp\\ktp-1757439963178.jpg	300185	complete	/penting_F_simpan/profile-photo/default-foto-profile.png	PAT06	PPAT	offline	Rasya_sih		20008	Farras ST. MT	2025-09-21 22:37:22.694764	/penting_F_simpan/folderttd/ppat_sign/ttd-PAT06.png		image/png	Notaris	aktif
56	ini tester ke 10	34831439	09118123382083	Farras@testertester.com	$2b$10$J1Td.pp1VK9YXwolfa4vGePFxmPapIXqqysS4RPJesBBgDcLkHxx2	public\\uploads\\1750981844105.jpeg	295303	complete	penting_F_simpan/profile-photo/default-foto-profile.png	BANK02	BANK	offline	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
43	A	12345	081	ini@testing.com	$2b$10$B4S5lN/zz/1dTOxrQADrCOg6LiIwmEi39jF8zmWn28/xZrofJGF4m	public\\uploads\\1747702518015.jpeg	101840	complete	/penting_F_simpan/profile-photo/LTB01_fotoProfile.jpeg	LTB01	LTB	offline	Farras	1234567	\N		2025-09-21 22:45:35.933681	\N	\N	\N	\N	\N
55	arras SPESIALIS	3439423420	02932132131	ucok@test.com	$2b$10$qZlThsX6MROdGGqgLLcr3unMVX5HDMaMUVQ18nyELecgNwrIXHHRa	public\\uploads\\1750957697179.jpeg	514742	complete	penting_F_simpan/profile-photo/default-foto-profile.png	BANK01	BANK	offline	Farras_syauqiKali	38309483920	\N		2025-09-21 22:46:12.240845	\N		\N	\N	\N
52	Asep Maulana	342413414231	087726101813	inimail@gmail.gmail	$2b$10$8XpCIIkos71qjFoYo8rJ7.aZki/p8KKkrdCcr6q4ENSHLQDKNtuS.	public\\uploads\\1749674121282.png	566188	complete	penting_F_simpan/profile-photo/default-foto-profile.png	P02	Peneliti	offline	ini_uname	123456577889	\N		2025-09-04 23:05:37.167754	image/jpeg	\N	\N	\N	\N
58	syauqo	84203843984	0820831	email@email.email	$2b$10$QBS3MQ1xEHeH9LuZ2X8nou7WcwPzy3tMcPP7E6XI9OPwfRa6RmGE2	public\\penting_Fpennyimpanan\\uploads_ktp\\ktp-1752030802781.jpeg	314179	complete	/penting_F_simpan/profile-photo/profile-1752150604723-293268532.jpeg	PAT04	PPAT	offline	ini_username		20006	Nama Gelar PPT	2025-07-10 21:37:03.245179	\N		\N	\N	aktif
57	test test test	12248304839	098232143213	yeyeyeyyeyey@testtest.com	$2b$10$lEBGjK8drHQm3vtUzURPmuNEtuEg6dFhF9xKn4I9EH3dkLbbZCmBe	public\\uploads\\1751274706377.png	330667	complete	penting_F_simpan/profile-photo/default-foto-profile.png	PV02	Peneliti Validasi	offline	RAINE	234314	\N		2025-09-09 16:24:10.174967	image/jpeg	RAINE, st, qw, 344	\N	\N	\N
41	TEst	12345678919	08123232	Farras_test@test.com	$2b$10$s9N8VRyLhyPGWBwtBa7SGOK2JvyH.E0lzdrAOP9M42kUCCOis1.CG	public\\uploads\\1747351572587.jpeg	178466	complete	penting_F_simpan/profile-photo/default.png	PATS01	PPATS	offline	farras__		20003	Farras, ST. SK sl	2025-08-01 21:17:37.171265	\N		\N	\N	aktif
2	Farras Syauqi	12345678910	087726101813	farrassyauqi22803@gmail.com	$2b$10$wxOJcia/mr2kWwViB7bRm.UnyY/mOWt8ZByroVoorOx5UHDYfYMjy	public\\uploads\\1744649747858.jpg	466343	complete	/penting_F_simpan/profile-photo/A01_fotoProfile.jpg	A01	Administrator	online	Farras ja	1234567899	\N	\N	2025-09-22 02:14:08.386166	\N	\N	\N	\N	\N
\.


--
-- Data for Name: api_idempotency; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.api_idempotency (id, endpoint, idempotency_key, request_hash, response_json, status, created_at, expires_at) FROM stdin;
3	validasi_initiate	c96c725b-aa67-4702-80d3-fd05bf6ebe8a	4e43524a631e4aed1c61de944c5499d03072264c960e5fb134f1b84288390330	{"success": true, "bsre_request_id": "MOCK-8b9c8b1c597bd1282cd0870b"}	completed	2025-09-15 15:54:07.770733+07	2025-09-16 15:54:07.770733+07
4	validasi_initiate	93940956-75e5-4a9c-b124-c73c052753f3	4e43524a631e4aed1c61de944c5499d03072264c960e5fb134f1b84288390330	{"success": true, "bsre_request_id": "MOCK-a7dfce9a2a20cd1bf0748f4d"}	completed	2025-09-15 16:08:42.689516+07	2025-09-16 16:08:42.689516+07
5	validasi_initiate	7ad0ad1b-2c0a-4b39-8612-884d548f2918	4e43524a631e4aed1c61de944c5499d03072264c960e5fb134f1b84288390330	{"success": true, "bsre_request_id": "MOCK-f79da360e54fc672140205d0"}	completed	2025-09-17 02:38:24.580067+07	2025-09-18 02:38:24.580067+07
6	validasi_authorize	9fb15dd8-df1e-4071-916b-71cfe7b98fda	b32fb33f78d96c88cd6d3b409678daec19ff0c15003318902d988cd74f1cc345	{"success": true, "signed_pdf_path": "/validasi/20008-2025-000002-Tervalidasi-signed.pdf"}	completed	2025-09-17 02:38:28.948945+07	2025-09-18 02:38:28.948945+07
7	validasi_initiate	deff8735-5a89-4463-a2d3-ebf15365743d	4e43524a631e4aed1c61de944c5499d03072264c960e5fb134f1b84288390330	{"success": true, "bsre_request_id": "MOCK-80c9dcfb642709071426fa38"}	completed	2025-09-17 03:41:12.734074+07	2025-09-18 03:41:12.734074+07
8	validasi_authorize	db519264-aca4-4b53-8f6f-a7148e2d14fc	b32fb33f78d96c88cd6d3b409678daec19ff0c15003318902d988cd74f1cc345	{"success": true, "signed_pdf_path": "/validasi/20008-2025-000002-Tervalidasi-signed.pdf"}	completed	2025-09-17 03:41:20.646079+07	2025-09-18 03:41:20.646079+07
9	validasi_initiate	90a41c14-e54a-40de-b5e9-38e137d665fc	4e43524a631e4aed1c61de944c5499d03072264c960e5fb134f1b84288390330	{"success": true, "bsre_request_id": "MOCK-d4386752812a571f113ad85b"}	completed	2025-09-17 03:46:43.910386+07	2025-09-18 03:46:43.910386+07
10	validasi_authorize	73b2397f-f155-48b8-8826-f245ac38aff3	b32fb33f78d96c88cd6d3b409678daec19ff0c15003318902d988cd74f1cc345	{"success": true, "signed_pdf_path": "/validasi/20008-2025-000002-Tervalidasi-signed.pdf"}	completed	2025-09-17 03:46:51.537453+07	2025-09-18 03:46:51.537453+07
11	validasi_initiate	42e15947-e4e0-48cf-8f14-4c681cbc1b6c	4e43524a631e4aed1c61de944c5499d03072264c960e5fb134f1b84288390330	{"success": true, "bsre_request_id": "MOCK-5b725aef085a5b9f199b60e2"}	completed	2025-09-17 03:47:37.146568+07	2025-09-18 03:47:37.146568+07
12	validasi_initiate	a9bcb58e-1947-48ac-99be-627f7cc0315d	4e43524a631e4aed1c61de944c5499d03072264c960e5fb134f1b84288390330	{"success": true, "bsre_request_id": "MOCK-14a27c0736552535935f4fa3"}	completed	2025-09-17 05:36:03.904373+07	2025-09-18 05:36:03.904373+07
13	validasi_authorize	04a066b6-26a2-438a-aafe-085bbdc0833f	b32fb33f78d96c88cd6d3b409678daec19ff0c15003318902d988cd74f1cc345	{"success": true, "signed_pdf_path": "/validasi/20008-2025-000002-Tervalidasi-signed.pdf"}	completed	2025-09-17 05:36:07.622119+07	2025-09-18 05:36:07.622119+07
14	validasi_initiate	e531007f-d07b-4bb3-9e39-c78be21027a1	4e43524a631e4aed1c61de944c5499d03072264c960e5fb134f1b84288390330	{"success": true, "bsre_request_id": "MOCK-4d5f591de3e4c9d137535964"}	completed	2025-09-17 06:41:58.505675+07	2025-09-18 06:41:58.505675+07
15	validasi_authorize	05f2b46f-5b8a-45c3-ba6a-1cf5c6c6e47b	b32fb33f78d96c88cd6d3b409678daec19ff0c15003318902d988cd74f1cc345	{"success": true, "signed_pdf_path": "/validasi/20008-2025-000002-Tervalidasi-signed.pdf"}	completed	2025-09-17 06:42:02.379326+07	2025-09-18 06:42:02.379326+07
16	validasi_initiate	7bcaa405-7ca6-42a6-a34c-b6a51c308f92	6c881119bd9c7aa3802b54e5d7f43cd62051055274c5d2c4ecd86f0508e77d4d	{"success": true, "bsre_request_id": "MOCK-886e58688456629585fddf48"}	completed	2025-09-17 06:57:30.055361+07	2025-09-18 06:57:30.055361+07
17	validasi_authorize	8f5b9c8d-51d3-4bde-86eb-ba62013c9cfa	f8451c8005a78e65a31552c36f892601b3c28cfe9c8de3319421abc013ca1d5a	{"success": true, "signed_pdf_path": "/validasi/20008-2025-000003-Tervalidasi-signed.pdf"}	completed	2025-09-17 06:57:38.33894+07	2025-09-18 06:57:38.33894+07
\.


--
-- Data for Name: backup_jenis_wajib_pajak; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.backup_jenis_wajib_pajak (id) FROM stdin;
27
40
44
\.


--
-- Data for Name: backup_jenis_wajib_pajak_ppatk; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.backup_jenis_wajib_pajak_ppatk (bookingid) FROM stdin;
134
138
133
136
137
135
142
139
143
141
144
145
146
147
149
150
148
151
153
152
154
\.


--
-- Data for Name: bank_1_cek_hasil_transaksi; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.bank_1_cek_hasil_transaksi (id, nobooking, userid, bphtb_yangtelah_dibayar, nomor_bukti_pembayaran, tanggal_perolehan, tanggal_pembayaran, status_verifikasi, catatan_bank, verified_by, verified_at, no_registrasi, status_dibank) FROM stdin;
1	20008-2025-000009	PAT06	90000000	41344143414	31-08-2025	19-12-2005	Pending	\N	\N	\N	2025O00008	Dicheck
2	20008-2025-000010	PAT06	90000000	\N	20-12-2025	10-12-2024	Disetujui	\N	BANK01	2025-09-21 05:42:37.830814+07	2025O00009	Tercheck
3	20008-2025-000011	PAT06	9000000	200000000	20-09-2020	02-09-2022	Disetujui	\N	BANK01	2025-09-21 17:02:15.500853+07	2025O00010	Tercheck
4	20008-2025-000012	PAT06	9000000	10193003	02-09-2025	02-02-2004	Disetujui	\N	BANK01	2025-09-21 21:30:54.596315+07	2025O00011	Tercheck
5	20008-2025-000013	PAT06	1000000000	41344143414	20-02-2025	20-01-2024	Disetujui	\N	BANK01	2025-09-21 22:46:20.915957+07	2025O00012	Tercheck
\.


--
-- Data for Name: daily_counter; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.daily_counter (date, counter) FROM stdin;
2025-04-27	12
2025-04-28	4
2025-04-29	4
\.


--
-- Data for Name: faqs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.faqs (id, question, answer, userid, updated_at) FROM stdin;
\.


--
-- Data for Name: file_lengkap_tertandatangani; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.file_lengkap_tertandatangani (id, nobooking, userid, nama_pembuat_booking, namawajibpajak, tanda_tangan_path, status_ttd, tanggal_ttd, no_validasi, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: lsb_1_serah_berkas; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.lsb_1_serah_berkas (id, nobooking, userid, namawajibpajak, namapemilikobjekpajak, status, trackstatus, keterangan, file_withstempel_path, updated_at) FROM stdin;
5	20008-2025-000005	J7MDZOXJ-5AD	KETERANGAN	KETERANGAN	Menunggu	Menunggu serah berkas		\N	2025-09-20 00:12:26.823597+07
6	20008-2025-000004	PAT06	Mayendar	Mugann	Terselesaikan	Diserahkan	Diserahkan oleh LSB02 pada 2025-09-18T16:45:15.768Z	\N	2025-09-20 00:12:26.823597+07
7	20008-2025-000012	PAT06	S	S	Diserahkan	Diserahkan	Diserahkan oleh LSB02 pada 2025-09-21T14:50:33.404Z	\N	2025-09-21 21:50:33.402341+07
\.


--
-- Data for Name: ltb_1_terima_berkas_sspd; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.ltb_1_terima_berkas_sspd (id, nobooking, tanggal_terima, status, pengirim_ltb, trackstatus, userid, created_at, updated_at, namawajibpajak, namapemilikobjekpajak, divisi, nama, jenis_wajib_pajak, no_registrasi) FROM stdin;
76	20008-2025-000002	2025-09-13	Dilanjutkan	\N	Diolah	PAT06	2025-09-13 17:05:43.963024	2025-09-13 17:09:43.284327	Farras Syauqi	Syauqi Muharam	LTB	\N	\N	2025O00001
77	20008-2025-000003	2025-09-17	Dilanjutkan	\N	Diolah	PAT06	2025-09-17 06:48:14.955329	2025-09-17 06:48:36.256464	Farras Syau	Syauqi Muharam	LTB	\N	\N	2025O00002
79	20008-2025-000004	2025-09-17	Dilanjutkan	\N	Diolah	PAT06	2025-09-17 19:53:45.897685	2025-09-17 19:54:16.401131	Mayendar	Mugann	LTB	\N	\N	2025O00004
78	20008-2025-000005	2025-09-17	Dilanjutkan	\N	Diolah	PAT06	2025-09-17 19:53:41.08664	2025-09-17 21:03:32.122458	KETERANGAN	KETERANGAN	LTB	\N	\N	2025O00003
80	20008-2025-000006	2025-09-18	Dilanjutkan	\N	Diolah	PAT06	2025-09-18 19:25:46.379966	2025-09-18 20:29:07.227104	DEMIN	SEMI	LTB	\N	\N	2025O00005
81	20008-2025-000007	2025-09-20	Diterima	\N	Diolah	PAT06	2025-09-20 01:15:55.079523	2025-09-20 01:15:55.079523	Farras Syauqi Muharam kali	Syauqi Muharam	LTB	Rasya Indehouse	Badan Usaha	2025O00006
82	20008-2025-000008	2025-09-20	Diterima	\N	Diolah	PAT06	2025-09-20 04:34:30.160537	2025-09-20 04:34:30.160537	Iyakah	ASTAGAHHH	LTB	Rasya Indehouse	Badan Usaha	2025O00007
83	20008-2025-000009	2025-09-20	Diterima	\N	Diolah	PAT06	2025-09-20 04:46:18.291633	2025-09-20 04:46:18.291633	Farras Dulu	SAYANG	LTB	Rasya Indehouse	Badan Usaha	2025O00008
84	20008-2025-000010	2025-09-21	Diterima	\N	Diolah	PAT06	2025-09-21 05:07:02.774504	2025-09-21 05:07:02.774504	Farras	ARAS SAYUQI	LTB	Rasya Indehouse	Badan Usaha	2025O00009
85	20008-2025-000011	2025-09-21	Diajukan	\N	Dilanjutkan	PAT06	2025-09-21 16:55:59.81397	2025-09-21 17:01:29.756137	ALAS KAKI	OH GITU	LTB	\N	\N	2025O00010
86	20008-2025-000012	2025-09-21	Diajukan	\N	Dilanjutkan	PAT06	2025-09-21 21:29:17.021283	2025-09-21 21:29:53.890252	S	S	LTB	\N	\N	2025O00011
87	20008-2025-000013	2025-09-21	Diajukan	\N	Dilanjutkan	PAT06	2025-09-21 22:40:04.734276	2025-09-21 22:45:48.641092	L	L	LTB	\N	\N	2025O00012
\.


--
-- Data for Name: notices; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.notices (id, content, active, userid, updated_at) FROM stdin;
\.


--
-- Data for Name: p_1_verifikasi; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.p_1_verifikasi (id, nobooking, userid, namawajibpajak, namapemilikobjekpajak, tanggal_terima, status, trackstatus, pengirim_ltb, pemilihan, nomorstpd, tanggalstpd, angkapersen, keterangandihitungsendiri, isiketeranganlainnya, nama_pengirim, no_registrasi, tanda_tangan_path, persetujuan, ttd_peneliti_mime) FROM stdin;
42	20008-2025-000003	PAT06	Farras Syau	Syauqi Muharam	2025-09-17	Diajukan	Diverifikasi	Dikirim oleh: A Loket Terima Berkas	penghitung_wajib_pajak	\N	\N	\N	\N	\N	A	2025O00003	/penting_F_simpan/folderttd/peneliti_sign/ttd-P01.png	true	image/png
43	20008-2025-000004	PAT06	Mayendar	Mugann	2025-09-17	Diajukan	Diverifikasi	Dikirim oleh: A Loket Terima Berkas	penghitung_wajib_pajak	\N	\N	\N	\N	\N	A	2025O00004	/penting_F_simpan/folderttd/peneliti_sign/ttd-P01.png	true	image/png
44	20008-2025-000005	PAT06	KETERANGAN	KETERANGAN	2025-09-17	Diajukan	Diverifikasi	Dikirim oleh: A Loket Terima Berkas	penghitung_wajib_pajak	\N	\N	\N	\N	\N	A	2025O00005	/penting_F_simpan/folderttd/peneliti_sign/ttd-P01.png	true	image/png
37	20002-2025-000007	PAT02	Syauqi	Gojek	2025-09-07	Diajukan	Diverifikasi	Dikirim oleh: A Loket Terima Berkas	penghitung_wajib_pajak	\N	\N	\N	\N	\N	A	2025O00001	/penting_F_simpan/folderttd/folderttd_ppatk/ttd-P01.jpg	true	image/jpeg
45	20008-2025-000006	PAT06	DEMIN	SEMI	2025-09-18	Diajukan	Diverifikasi	Dikirim oleh: A Loket Terima Berkas	penghitung_wajib_pajak	\N	\N	\N	\N	\N	A	2025O00006	/penting_F_simpan/folderttd/peneliti_sign/ttd-P01.png	true	image/png
38	20008-2025-000001	PAT06	Indor	Grab Jeck	2025-09-11	Diajukan	Diverifikasi	Dikirim oleh: A Loket Terima Berkas	penghitung_wajib_pajak	\N	\N	\N	\N	\N	A	2025O00001	\N	true	\N
41	20008-2025-000002	PAT06	Farras Syauqi	Syauqi Muharam	2025-09-13	Diajukan	Diverifikasi	Dikirim oleh: A Loket Terima Berkas	penghitung_wajib_pajak	\N	\N	\N	\N	\N	A	2025O00002	/penting_F_simpan/folderttd/folderttd_ppatk/ttd-P01.jpg	true	image/jpeg
46	20008-2025-000011	PAT06	ALAS KAKI	OH GITU	2025-09-21	Diajukan	Diverifikasi	Dikirim oleh: A Loket Terima Berkas	penghitung_wajib_pajak	\N	\N	\N	\N	\N	A	2025O00010	\N	true	\N
47	20008-2025-000012	PAT06	S	S	2025-09-21	Diajukan	Diverifikasi	Dikirim oleh: A Loket Terima Berkas	penghitung_wajib_pajak	\N	\N	\N	\N	\N	A	2025O00011	/penting_F_simpan/folderttd/peneliti_sign/ttd-P01.png	true	image/png
48	20008-2025-000013	PAT06	L	L	2025-09-21	Diajukan	Diverifikasi	Dikirim oleh: A Loket Terima Berkas	penghitung_wajib_pajak	\N	\N	\N	\N	\N	A	2025O00012	/penting_F_simpan/folderttd/peneliti_sign/ttd-P01.png	true	image/png
\.


--
-- Data for Name: p_2_verif_sign; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.p_2_verif_sign (id, nobooking, userid, stempel_booking_path, created_at) FROM stdin;
10	20008-2025-000011	P01	/asset/Stempel_bappenda.png	2025-09-21 18:33:22.20103+07
11	20008-2025-000012	P01	/asset/Stempel_bappenda.png	2025-09-21 21:32:09.724935+07
12	20008-2025-000013	P01	/asset/Stempel_bappenda.png	2025-09-21 23:23:47.968209+07
\.


--
-- Data for Name: p_3_clear_to_paraf; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.p_3_clear_to_paraf (id, nobooking, userid, namawajibpajak, namapemilikobjekpajak, tanggal_terima, status, trackstatus, keterangan, ttd_paraf_mime, no_registrasi, persetujuan, tanda_paraf_path, pemverifikasi) FROM stdin;
16	20008-2025-000003	PAT06	Farras Syau	Syauqi Muharam	\N	Dikerjakan	Terverifikasi	\N	\N	2025O00003	true	/penting_F_simpan/folderttd/peneliti_sign/ttd-P01.png	P01
17	20008-2025-000004	PAT06	Mayendar	Mugann	\N	Dikerjakan	Terverifikasi	\N	\N	2025O00004	true	/penting_F_simpan/folderttd/peneliti_sign/ttd-P01.png	P01
18	20008-2025-000005	PAT06	KETERANGAN	KETERANGAN	\N	Dikerjakan	Terverifikasi	\N	\N	2025O00005	true	/penting_F_simpan/folderttd/peneliti_sign/ttd-P01.png	P01
20	20008-2025-000001	PAT06	Indor	Grab Jeck	\N	Dikerjakan	Diverifikasi	\N	\N	2025O00001	\N	\N	P01
19	20008-2025-000006	PAT06	DEMIN	SEMI	\N	Dikerjakan	Terverifikasi	\N	\N	2025O00006	true	/penting_F_simpan/folderttd/peneliti_sign/ttd-P01.png	P01
14	20002-2025-000007	PAT02	Syauqi	Gojek	\N	Dikerjakan	Diverifikasi	\N	\N	2025O00001	true	/penting_F_simpan/folderttd/folderttd_ppatk/ttd-P01.jpg	\N
21	20008-2025-000011	PAT06	ALAS KAKI	OH GITU	\N	Dikerjakan	Terverifikasi	\N	\N	2025O00010	true	/penting_F_simpan/folderttd/peneliti_sign/ttd-P01.png	P01
22	20008-2025-000012	PAT06	S	S	\N	Dikerjakan	Terverifikasi	\N	\N	2025O00011	true	/penting_F_simpan/folderttd/peneliti_sign/ttd-P01.png	P01
15	20008-2025-000002	PAT06	Farras Syauqi	Syauqi Muharam	\N	Dikerjakan	Terverifikasi	\N	\N	2025O00002	true	/penting_F_simpan/folderttd/peneliti_sign/ttd-P01.png	P01
23	20008-2025-000013	PAT06	L	L	\N	Dikerjakan	Terverifikasi	\N	\N	2025O00012	true	/penting_F_simpan/folderttd/peneliti_sign/ttd-P01.png	P01
\.


--
-- Data for Name: password_reset_tokens; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.password_reset_tokens (id, email, token, created_at, expires_at) FROM stdin;
1	farrassyauqi22803@gmail.com	5546f8bb9afbe7d29094ae95cd34a158e1cee379361a1ed817ca49a04c40a775	2025-04-18 16:22:47.092025	2025-04-18 17:22:47.099
2	farrassyauqi22803@gmail.com	1c8986382ae95de94474845ef69006792f99a5124501bec34a7a82b0d6719dbc	2025-04-18 16:29:22.030296	2025-04-18 17:29:22.043
4	syauqimuharam@gmail.com	9772f07ad14a238e423d088d4beb697be06e0a8cf89253c47d41cb4bc296e6de	2025-05-07 17:33:46.789426	2025-05-07 18:33:46.798
5	syauqimuharam@gmail.com	07a692bdaad0fac44fef406093960021e23d78b23530a2f00b59011b003c31e2	2025-05-15 03:45:28.007576	2025-05-15 04:45:28.013
6	syauqimuharam@gmail.com	927e772890a3e4e56fc73ea1842e91a8c45ca85b5481afba90137df3af9b4e4a	2025-05-15 03:51:50.650027	2025-05-15 04:51:50.653
\.


--
-- Data for Name: pat_1_bookingsspd; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.pat_1_bookingsspd (bookingid, userid, jenis_wajib_pajak, nobooking, noppbb, namawajibpajak, alamatwajibpajak, namapemilikobjekpajak, alamatpemilikobjekpajak, tanggal, tahunajb, kabupatenkotawp, kecamatanwp, kelurahandesawp, rtrwwp, npwpwp, kodeposwp, kabupatenkotaop, kecamatanop, kelurahandesaop, rtrwop, npwpop, kodeposop, trackstatus, akta_tanah_path, sertifikat_tanah_path, pelengkap_path, nama, created_at, file_withstempel_path, nomor_validasi, pdf_dokumen_path) FROM stdin;
163	PAT02	Badan Usaha	20002-2025-000001	11.11.111.111.111.1111.1	a	323417	Objek	j	22-12-2018	2018	11111111	1111111	1111111	001/001	11.111.111.1-111.111	13341	k	k	k	002/003	11.111.111.1-111.111	12341	Diolah	public\\folder_input_sspd\\pdf\\1747698643936.pdf	public\\folder_input_sspd\\images\\1747698643951.jpeg	public\\folder_input_sspd\\pdf\\1747698643953.pdf	Farras Syauqi	2025-05-16 09:03:52.648751+07	\N	\N	\N
164	PAT02	Badan Usaha	20002-2025-000002	22.22.221.111.444.0444.4	s	d	d	d	20-05-2025	2024	ka	ke	kel	002/003	22.222.444.4-444.444	11332	dd	d	ddd	004/005	44.444.444.4-444.044	13435	Diolah	public\\folder_input_sspd\\pdf\\1747698561357.pdf	public\\folder_input_sspd\\images\\1747698561366.jpeg	public\\folder_input_sspd\\pdf\\1747698561367.pdf	Farras Syauqi	2025-05-20 06:48:13.807064+07	\N	\N	\N
186	PAT02	Badan Usaha	20002-2025-000007	39.38.439.840.938.4901.3	Syauqi	Jalan Jalan	Gojek	Jalan jalan	07-09-2025	2023	Kabupaten	Kecamatan	Kelurahan	002/004	80.384.938.3-403.434	12338	Kabupaten	Kecamatan	Kelurahan	008/002	03.843.838.4-384.983	34313	Diverifikasi	penting_F_simpan/folder_input_sspd/images/PAT02_Akta_000007_2025.jpeg	penting_F_simpan/folder_input_sspd/images/PAT02_SertifikatTanah_000007_2025.jpeg	penting_F_simpan/folder_input_sspd/images/PAT02_DokumenP_000007_2025.jpeg	Farras Syauqi	2025-09-07 17:35:26.109197+07	\N	\N	\N
188	PAT06	Badan Usaha	20008-2025-000002	32.84.380.489.384.0819.8	Farras Syauqi	Jalanan	Syauqi Muharam	Jalan Jalanan	13-09-2025	20251	Kabupaten	Kecamatan	Keluraha	008/002	34.348.304.8-938.490	14341	KoTAAA	Obwk	LUEah	002/001	83.904.183.9-028.903	12341	Terverifikasi	penting_F_simpan/folder_input_sspd/pdf/PAT06_Akta_000002_2025.pdf	penting_F_simpan/folder_input_sspd/images/PAT06_SertifikatTanah_000002_2025.png	penting_F_simpan/folder_input_sspd/images/PAT06_DokumenP_000002_2025.png	Rasya Indehouse	2025-09-13 16:38:50.367361+07	\N	\N	\N
193	PAT06	Badan Usaha	20008-2025-000007	83.02.473.472.974.9387.4	Farras Syauqi Muharam kali	"KETERANGAN"	Syauqi Muharam	Jalan ini Contoh	20-09-2025	2025	"KETERANGAN"	"KETERANGAN"	"KETERANGAN"	007/002	13.473.974.3-897.471	13441	KABUPATEN	KECAMATAN	KELURAHAN	002/006	38.749.374.8-937.497	12447	Diolah	penting_F_simpan/folder_input_sspd/pdf/PAT06_Akta_000007_2025.pdf	penting_F_simpan/folder_input_sspd/pdf/PAT06_SertifikatTanah_000007_2025.pdf	penting_F_simpan/folder_input_sspd/pdf/PAT06_DokumenP_000007_2025.pdf	Rasya Indehouse	2025-09-20 01:14:41.579517+07	\N	\N	\N
190	PAT06	Badan Usaha	20008-2025-000004	83.04.839.084.938.0834.0	Mayendar	Jalan Kali	Mugann	Jakab	17-09-2025	2025	Kabup	Kecam	Kelur	002/004	43.948.038.4-093.840	4834084	Kan	Kla	Kl	008/002	13.840.913.8-840.913	234314	Diserahkan	penting_F_simpan/folder_input_sspd/pdf/PAT06_Akta_000004_2025.pdf	penting_F_simpan/folder_input_sspd/pdf/PAT06_SertifikatTanah_000004_2025.pdf	penting_F_simpan/folder_input_sspd/pdf/PAT06_DokumenP_000004_2025.pdf	Rasya Indehouse	2025-09-17 19:50:32.20654+07	\N	15U1O7U7-XPI	\N
182	PAT02	Badan Usaha	20002-2025-000003	02.13.243.438.403.8493.8	Farras	Jalan	S	Jalan	03-09-2025	2021	K	k	k	002	23.893.819.8-938.409	18181	KAl	ks	sk	009	84.983.048.3-094.809	18321	Dilanjutkan	penting_F_simpan/folder_input_sspd/images/PAT02_Akta_000003_2025.png	penting_F_simpan/folder_input_sspd/pdf/PAT02_SertifikatTanah_000003_2025.pdf	penting_F_simpan/folder_input_sspd/images/PAT02_DokumenP_000003_2025.png	Farras Syauqi	2025-09-03 15:25:26.254592+07	\N	\N	\N
183	PAT02	Badan Usaha	20002-2025-000004	38.40.293.840.980.4981.3	Syau	Alamat	Pemilik Objek	Alamat Pemilik Objek	06-09-2025	2024	kemmca	Kecam	Kelura	002	84.384.038.4-938.489	02014	Kabup	kec	kle	009	13.908.418.4-091.384	23941	Draft	penting_F_simpan/folder_input_sspd/pdf/PAT02_Akta_000004_2025.pdf	penting_F_simpan/folder_input_sspd/pdf/PAT02_SertifikatTanah_000004_2025.pdf	penting_F_simpan/folder_input_sspd/images/PAT02_DokumenP_000004_2025.jpeg	Farras Syauqi	2025-09-06 19:39:49.474691+07	\N	\N	\N
184	PAT02	Badan Usaha	20002-2025-000005	32.94.203.849.024.8328.3	QWERTY	Jalan Jalan	Objek GOJEK	Jalan	07-09-2025	2024	Kabup	Kecam	Kelurahan	001	34.903.849.3-747.343	30312	Kabup	Kecam	Kwlruha	002/005	74.374.374.8-374.937	15352	Draft	\N	\N	\N	Farras Syauqi	2025-09-07 00:06:09.318464+07	\N	\N	\N
185	PAT02	Badan Usaha	20002-2025-000006	73.40.347.084.094.0930.9	Farras	Jalan Jalan	Syauqi	Alamat ini	07-09-2025	2012	Kabupaten	Kecamatan	Kelurahan	002/003	83.489.038.4-380.498	38132	Kabupaten	Kecamatan	Kelurahan	008	10.983.091.8-384.803	34834	Draft	\N	\N	\N	Farras Syauqi	2025-09-07 15:51:54.149616+07	\N	\N	\N
189	PAT06	Badan Usaha	20008-2025-000003	34.34.374.384.793.7489.1	Farras Syau	JALANIN AJA	Syauqi Muharam	Jalanin Aja	17-09-2025	2025	Kabupaten	Kecamatan	Kelurahan	002/004	34.834.394.0-180.829	22344	Kabupaten	Kecamatan	Kelurahan	001/002	80.284.928.4-038.948	43434	Sudah Divalidasi	penting_F_simpan/folder_input_sspd/pdf/PAT06_Akta_000003_2025.pdf	penting_F_simpan/folder_input_sspd/images/PAT06_SertifikatTanah_000003_2025.jpeg	penting_F_simpan/folder_input_sspd/images/PAT06_DokumenP_000003_2025.png	Rasya Indehouse	2025-09-17 06:46:26.709007+07	\N	JRXG60R1-K3J	\N
191	PAT06	Badan Usaha	20008-2025-000005	23.74.131.743.974.8197.4	KETERANGAN	KETERANGAN	KETERANGAN	KETERANGAN	17-09-2025	2	KETERANGAN	KETERANGAN	KETERANGAN	001/004	34.304.810.4-801.384	20342	KETERANGAN	KETERANGAN	KETERANGAN	231/002	10.941.840.1-380.948	38401	Terverifikasi	penting_F_simpan/folder_input_sspd/pdf/PAT06_Akta_000005_2025.pdf	penting_F_simpan/folder_input_sspd/pdf/PAT06_SertifikatTanah_000005_2025.pdf	penting_F_simpan/folder_input_sspd/pdf/PAT06_DokumenP_000005_2025.pdf	Rasya Indehouse	2025-09-17 19:52:14.311579+07	\N	J7MDZOXJ-5AD	\N
192	PAT06	Badan Usaha	20008-2025-000006	83.74.924.374.927.8728.9	DEMIN	DAMN	SEMI	KALA	18-09-2025	2025	KELA	KECM	KELUR	007/002	43.473.749.1-774.937	48343	KALA	KALA	KALA	001/222	89.217.232.3-233.331	38499	Terverifikasi	penting_F_simpan/folder_input_sspd/pdf/PAT06_Akta_000006_2025.pdf	penting_F_simpan/folder_input_sspd/pdf/PAT06_SertifikatTanah_000006_2025.pdf	penting_F_simpan/folder_input_sspd/images/PAT06_DokumenP_000006_2025.jpeg	Rasya Indehouse	2025-09-18 16:48:13.769391+07	\N	FSADQ30O-O5N	\N
187	PAT06	Badan Usaha	20008-2025-000001	34.74.389.473.897.4938.7	Indor	JLn	Grab Jeck	Kantor	10-09-2025	2020	Kabup	Kecam	Kelurahan	008/002	23.434.319.0-483.849	18241	Kabupaten	Kota	Provinsi	002/002	18.431.048.9-384.091	12382	Diverifikasi	penting_F_simpan/folder_input_sspd/images/PAT06_Akta_000001_2025.jpg	penting_F_simpan/folder_input_sspd/images/PAT06_SertifikatTanah_000001_2025.jpg	penting_F_simpan/folder_input_sspd/images/PAT06_DokumenP_000001_2025.jpg	Rasya Indehouse	2025-09-10 02:16:21.216772+07	\N	\N	\N
194	PAT06	Badan Usaha	20008-2025-000008	43.74.923.748.374.9783.4	Iyakah	astaga ngerinyah	ASTAGAHHH	NGERINYAAHH	20-09-2025	2025	Kabupaten	Kecamatan	Kelurahan	002/004	74.398.473.8-743.974	11328	HAHHAA	HAHAHA	HAHAHA	001	87.493.749.8-374.749	48310	Diolah	penting_F_simpan/folder_input_sspd/pdf/PAT06_Akta_000008_2025.pdf	penting_F_simpan/folder_input_sspd/pdf/PAT06_SertifikatTanah_000008_2025.pdf	penting_F_simpan/folder_input_sspd/pdf/PAT06_DokumenP_000008_2025.pdf	Rasya Indehouse	2025-09-20 04:33:35.513826+07	\N	\N	\N
195	PAT06	Badan Usaha	20008-2025-000009	47.39.748.374.979.1783.4	Farras Dulu	JALAN	SAYANG	SAYANG	20-09-2025	2024	SAYANG	SAYANG	SAYANG	008	31.347.139.8-478.471	203319	SAYANG	V	SAYANG	001/002	93.738.174.9-834.731	22983	Diolah	penting_F_simpan/folder_input_sspd/pdf/PAT06_Akta_000009_2025.pdf	penting_F_simpan/folder_input_sspd/pdf/PAT06_SertifikatTanah_000009_2025.pdf	penting_F_simpan/folder_input_sspd/pdf/PAT06_DokumenP_000009_2025.pdf	Rasya Indehouse	2025-09-20 04:45:10.442119+07	\N	\N	\N
196	PAT06	Badan Usaha	20008-2025-000010	38.40.329.480.384.0849.3	Farras	Jalan Jalan ASIK	ARAS SAYUQI	JALAN	21-09-2025	2023	KABUP	KECAM	KEL	001	20.384.810.8-412.983	30413	KABUP	KECAM	LURAH	002	10.840.238.0-128.038	2093	Diolah	penting_F_simpan/folder_input_sspd/pdf/PAT06_Akta_000010_2025.pdf	penting_F_simpan/folder_input_sspd/pdf/PAT06_SertifikatTanah_000010_2025.pdf	penting_F_simpan/folder_input_sspd/pdf/PAT06_DokumenP_000010_2025.pdf	Rasya Indehouse	2025-09-21 05:02:06.589128+07	\N	\N	\N
198	PAT06	Badan Usaha	20008-2025-000012	34.83.947.937.498.3749.8	S	k	S	K	21-09-2025	2024	l	k	l	001	34.890.489.3-478.974	20391	K	L	M	009	97.979.879.3-748.971	22382	Diserahkan	penting_F_simpan/folder_input_sspd/images/PAT06_Akta_000012_2025.png	penting_F_simpan/folder_input_sspd/images/PAT06_SertifikatTanah_000012_2025.png	penting_F_simpan/folder_input_sspd/images/PAT06_DokumenP_000012_2025.png	Rasya Indehouse	2025-09-21 21:28:22.110627+07	\N	TEVP4058-I8M	\N
197	PAT06	Badan Usaha	20008-2025-000011	73.74.937.483.274.9837.9	ALAS KAKI	JANGAN	OH GITU	JANGAN	21-09-2025	2025	JANGAN	JANGAN	JANGAN	001	24.434.344.3-444.333	21840	JANGAN	JANGAN	JANGAN	009	33.314.348.1-084.019	2092	Terverifikasi	penting_F_simpan/folder_input_sspd/pdf/PAT06_Akta_000011_2025.pdf	penting_F_simpan/folder_input_sspd/images/PAT06_SertifikatTanah_000011_2025.png	penting_F_simpan/folder_input_sspd/pdf/PAT06_DokumenP_000011_2025.pdf	Rasya Indehouse	2025-09-21 16:55:12.901813+07	\N	6EEWC4WH-URT	\N
199	PAT06	Badan Usaha	20008-2025-000013	80.89.048.944.803.8938.0	L	L	L	L	21-09-2025	2023	L	L	l	10	83.098.898.0-438.938	29021	L	L	L	30	08.193.004.8-384.038	38230	Sudah Divalidasi	penting_F_simpan/folder_input_sspd/images/PAT06_Akta_000013_2025.png	penting_F_simpan/folder_input_sspd/images/PAT06_SertifikatTanah_000013_2025.png	penting_F_simpan/folder_input_sspd/pdf/PAT06_DokumenP_000013_2025.pdf	Rasya Indehouse	2025-09-21 22:38:37.550322+07	\N	W9SIH8KE-A4A	\N
\.


--
-- Data for Name: pat_2_bphtb_perhitungan; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.pat_2_bphtb_perhitungan (calculationid, nilaiperolehanobjekpajaktidakkenapajak, bphtb_yangtelah_dibayar, nobooking) FROM stdin;
126	2342434.00	232313	20002-2025-000001
127	800000000.00	3000000	20002-2025-000002
141	80000000.00	800000000	20002-2025-000003
142	80000000.00	10000000	20002-2025-000004
143	80000000.00	80000000	20002-2025-000005
144	80000000.00	20000000	20002-2025-000006
145	80000000.00	20000000	20002-2025-000007
146	80000000.00	80000000	20008-2025-000001
147	80000000.00	70000000	20008-2025-000002
148	80000000.00	80000000	20008-2025-000003
149	80000000.00	80000000	20008-2025-000004
150	80000000.00	100000000	20008-2025-000005
151	80000000.00	200000	20008-2025-000006
152	80000000.00	90000000	20008-2025-000007
153	80000000.00	80000000	20008-2025-000008
154	80000000.00	90000000	20008-2025-000009
155	80000000.00	90000000	20008-2025-000010
156	80000000.00	9000000	20008-2025-000011
157	80000000.00	9000000	20008-2025-000012
158	300000000.00	1000000000	20008-2025-000013
\.


--
-- Data for Name: pat_3_documents; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.pat_3_documents (id, userid, nama, path_document1, path_document2, upload_date, created_at, updated_at, booking_id) FROM stdin;
1	PAT02	Farras Syauqi	\N	\N	2025-09-03 15:25:26.254592	2025-09-03 15:25:26.254592	2025-09-03 15:25:26.254592	182
2	PAT02	Farras Syauqi	\N	\N	2025-09-06 19:39:49.474691	2025-09-06 19:39:49.474691	2025-09-06 19:39:49.474691	183
3	PAT02	Farras Syauqi	\N	\N	2025-09-07 00:06:09.318464	2025-09-07 00:06:09.318464	2025-09-07 00:06:09.318464	184
4	PAT02	Farras Syauqi	\N	\N	2025-09-07 15:51:54.149616	2025-09-07 15:51:54.149616	2025-09-07 15:51:54.149616	185
5	PAT02	Farras Syauqi	\N	\N	2025-09-07 17:35:26.109197	2025-09-07 17:35:26.109197	2025-09-07 17:35:26.109197	186
6	PAT06	Rasya Indehouse	\N	\N	2025-09-10 02:16:21.216772	2025-09-10 02:16:21.216772	2025-09-10 02:16:21.216772	187
7	PAT06	Rasya Indehouse	\N	\N	2025-09-13 16:38:50.367361	2025-09-13 16:38:50.367361	2025-09-13 16:38:50.367361	188
8	PAT06	Rasya Indehouse	\N	\N	2025-09-17 06:46:26.709007	2025-09-17 06:46:26.709007	2025-09-17 06:46:26.709007	189
9	PAT06	Rasya Indehouse	\N	\N	2025-09-17 19:50:32.20654	2025-09-17 19:50:32.20654	2025-09-17 19:50:32.20654	190
10	PAT06	Rasya Indehouse	\N	\N	2025-09-17 19:52:14.311579	2025-09-17 19:52:14.311579	2025-09-17 19:52:14.311579	191
11	PAT06	Rasya Indehouse	\N	\N	2025-09-18 16:48:13.769391	2025-09-18 16:48:13.769391	2025-09-18 16:48:13.769391	192
12	PAT06	Rasya Indehouse	\N	\N	2025-09-20 01:14:41.579517	2025-09-20 01:14:41.579517	2025-09-20 01:14:41.579517	193
13	PAT06	Rasya Indehouse	\N	\N	2025-09-20 04:33:35.513826	2025-09-20 04:33:35.513826	2025-09-20 04:33:35.513826	194
14	PAT06	Rasya Indehouse	\N	\N	2025-09-20 04:45:10.442119	2025-09-20 04:45:10.442119	2025-09-20 04:45:10.442119	195
15	PAT06	Rasya Indehouse	\N	\N	2025-09-21 05:02:06.589128	2025-09-21 05:02:06.589128	2025-09-21 05:02:06.589128	196
16	PAT06	Rasya Indehouse	\N	\N	2025-09-21 16:55:12.901813	2025-09-21 16:55:12.901813	2025-09-21 16:55:12.901813	197
17	PAT06	Rasya Indehouse	\N	\N	2025-09-21 21:28:22.110627	2025-09-21 21:28:22.110627	2025-09-21 21:28:22.110627	198
18	PAT06	Rasya Indehouse	\N	\N	2025-09-21 22:38:37.550322	2025-09-21 22:38:37.550322	2025-09-21 22:38:37.550322	199
\.


--
-- Data for Name: pat_4_objek_pajak; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.pat_4_objek_pajak (id, letaktanahdanbangunan, rt_rwobjekpajak, status_kepemilikan, keterangan, nomor_sertifikat, tanggal_perolehan, tanggal_pembayaran, nomor_bukti_pembayaran, nobooking, harga_transaksi, kelurahandesalp, kecamatanlp, jenis_perolehan) FROM stdin;
99	Letak	0011	Milik Pribadi	Keterangan ini mah	Girik	20-02-2024	20-08-2026	1093048930	20002-2025-000003	2000000000	Kelurahan	Kecamatan	12
100	Tanah	008/002	Milik Pribadi	keterangan ini masuk ke dokumen validasi	GIRIK SI	20-10-2020	20-12-2025	191203104138	20002-2025-000004	100000000	Kelurahan	Kecamanan	01
101	Tanah Yanah	005/002	Milik Pribadi	Keterangan	Girik Kali	31-12-2025	20-12-2024	239094038493804	20002-2025-000005	1000000000	Kelurahan	Kecamatan	01
102	Tanah Sih ini	3000	Milik Pribadi	Keterangan	GIRIK	20-12-2020	20-12-2025	1000000	20002-2025-000006	4000000	Kelurahan	Kecamatan	02
103	Letak Tanah	008	Milik Pribadi	Keterangan ini	Girik	23-12-2002	20-12-2024	100000000000	20002-2025-000007	20000000000	Kelurahan	Kecamatan	02
104	Tanah	002/004	Milik Pribadi	Keterangan ini	Girik Tanah	22-08-2012	20-12-2025	41344143414	20008-2025-000001	200000000	Kelurahan	Kecamatan	01
105	tANAH INI	002/006	Milik Pribadi	Keterangan ini	HIRIK	23-01-2025	02-05-2025	348304839480	20008-2025-000002	40000000	Kelurahan	Kecamatan	01
106	Tanah	008/002	Milik Pribadi	Keterangan	GIRIK	30-01-2024	23-12-2025	2090909220000	20008-2025-000003	2000000000	Kelurahan	Kecamatan	02
107	Tanah	004/002	Milik Pribadi	keterangan	LIKIK	22-12-2018	20-08-2025	100000000	20008-2025-000004	1000000	Kelurahan	kecamatan	02
108	Tanah	009/002	Milik Pribadi	KETERANGAN	393403480	22-01-2002	20-10-2025	KETERANGAN	20008-2025-000005	2000000000	KETERANGAN	KETERANGAN	11
109	Alamak	008/003	Milik Pribadi	KETERANGAN NIH	220 GIRIK KALIK YA	10-12-2014	20-12-2020	INI BUKTINYA	20008-2025-000006	2000000	LURAH	CAMANAT	01
110	Farras	008/002	Milik Pribadi	Keterangan	GIRIK TANAH	20-10-2024	30-02-2050	10000000	20008-2025-000007	1000000000	LURAH	KECAMATAN	01
111	letak TANAH	008	Milik Pribadi	KETERANGAN	gIRI	08-10-2025	09-09-2025	VEBFEFEWFW	20008-2025-000008	34808439084	LURAH	CAMAT	01
112	LETAK	001/002	Milik Pribadi	K	GITIK	31-08-2025	19-12-2005	41344143414	20008-2025-000009	1000000000	L	L	02
113	tanah	002	Milik Pribadi	ket	22932	20-12-2025	10-12-2024		20008-2025-000010	20000	Lura	CAm	01
114	JANGAN	002	Milik Pribadi	KETERANGAN	220249	20-09-2020	02-09-2022	200000000	20008-2025-000011	2000000000	LURAH	KECAMATAN	02
115	D	002/002	Milik Pribadi	KETERANGAN	GIRIK	02-09-2025	02-02-2004	10193003	20008-2025-000012	2000000000	LURAH	KECAMATAN	10
116	TANAG	20	Milik Pribadi	KTERANGAN	10	20-02-2025	20-01-2024	41344143414	20008-2025-000013	2000000000	K	K	04
\.


--
-- Data for Name: pat_5_penghitungan_njop; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.pat_5_penghitungan_njop (id, nobooking, luas_tanah, njop_tanah, luas_bangunan, njop_bangunan, created_at, updated_at, total_njoppbb) FROM stdin;
51	20002-2025-000001	300.00	202000.00	20020.00	202000.00	2025-05-16 09:03:52.648751+07	2025-05-16 09:03:52.648751+07	\N
52	20002-2025-000002	10.00	10.00	1010.00	1000000.00	2025-05-20 06:48:13.807064+07	2025-05-20 06:48:13.807064+07	\N
67	20002-2025-000003	20000.00	15.00	20000.00	1000.00	2025-09-03 15:25:26.254592+07	2025-09-03 15:25:26.254592+07	\N
68	20002-2025-000004	200000.00	200.00	200000.00	100.00	2025-09-06 19:39:49.474691+07	2025-09-06 19:39:49.474691+07	\N
69	20002-2025-000005	10000.00	10000.00	10000.00	10000.00	2025-09-07 00:06:09.318464+07	2025-09-07 00:06:09.318464+07	\N
70	20002-2025-000006	20000.00	200.00	20000.00	200.00	2025-09-07 15:51:54.149616+07	2025-09-07 15:51:54.149616+07	\N
71	20002-2025-000007	200000.00	2000.00	200000.00	2000.00	2025-09-07 17:35:26.109197+07	2025-09-07 17:35:26.109197+07	\N
72	20008-2025-000001	2000.00	20.00	2000.00	10.00	2025-09-10 02:16:21.216772+07	2025-09-10 02:16:21.216772+07	\N
73	20008-2025-000002	30000.00	200.00	20000.00	100.00	2025-09-13 16:38:50.367361+07	2025-09-13 16:38:50.367361+07	\N
74	20008-2025-000003	40000.00	200.00	40000.00	150.00	2025-09-17 06:46:26.709007+07	2025-09-17 06:46:26.709007+07	\N
75	20008-2025-000004	40000.00	30.00	200.00	20.00	2025-09-17 19:50:32.20654+07	2025-09-17 19:50:32.20654+07	\N
76	20008-2025-000005	3000.00	2000.00	202000.00	10.00	2025-09-17 19:52:14.311579+07	2025-09-17 19:52:14.311579+07	\N
77	20008-2025-000006	900.00	20000.00	10000.00	20000.00	2025-09-18 16:48:13.769391+07	2025-09-18 16:48:13.769391+07	\N
78	20008-2025-000007	1000000.00	200.00	1000000.00	180.00	2025-09-20 01:14:41.579517+07	2025-09-20 01:14:41.579517+07	\N
79	20008-2025-000008	100.00	200.00	200.00	200.00	2025-09-20 04:33:35.513826+07	2025-09-20 04:33:35.513826+07	\N
80	20008-2025-000009	4000.00	200000.00	2000.00	600000.00	2025-09-20 04:45:10.442119+07	2025-09-20 04:45:10.442119+07	\N
81	20008-2025-000010	20000.00	200.00	20000.00	200.00	2025-09-21 05:02:06.589128+07	2025-09-21 05:02:06.589128+07	\N
82	20008-2025-000011	290.50	10000000.00	4000.00	20000000.00	2025-09-21 16:55:12.901813+07	2025-09-21 16:55:12.901813+07	\N
83	20008-2025-000012	400.23	100000.00	289.25	200000.00	2025-09-21 21:28:22.110627+07	2025-09-21 21:28:22.110627+07	\N
84	20008-2025-000013	100000.00	20000.00	200000.00	100000.00	2025-09-21 22:38:37.550322+07	2025-09-21 22:38:37.550322+07	\N
\.


--
-- Data for Name: pat_6_sign; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.pat_6_sign (id, nobooking, userid, nama, path_ttd_ppatk, path_ttd_wp) FROM stdin;
24	20001-2025-000009	PAT01	Arras BUANA	public/folderttd/folderttd_ppatk/20001-2025-000009_1748236991505_signature2.png	public/folderttd/folderttdwp/20001-2025-000009_1748236991503_signature1.png
25	20001-2025-000014	PAT01	Arras BUANA	public/folderttd/folderttd_ppatk/20001-2025-000014_1751445567358_signature2.png	\N
26	20001-2025-000014	PAT01	Arras BUANA	public/folderttd/folderttd_ppatk/20001-2025-000014_1751445916834_signature2.png	\N
27	20002-2025-000003	PAT02	Farras Syauqi	\N	\N
28	20002-2025-000004	PAT02	Farras Syauqi	\N	\N
29	20002-2025-000005	PAT02	Farras Syauqi	\N	\N
30	20002-2025-000007	PAT02	Farras Syauqi	/penting_F_simpan/folderttd/folderttd_ppatk/ttd-PAT02.jpg	\N
31	20008-2025-000001	PAT06	Rasya Indehouse	/penting_F_simpan/folderttd/ppat_sign/ttd-PAT06.png	C:/Users/USER/Downloads/Folder-Farras_bappenda_TA/public/penting_F_simpan/folderttd/folderttdwp/20008-2025-000001_1757588939503_signature1.png
32	20008-2025-000002	PAT06	Rasya Indehouse	/penting_F_simpan/folderttd/ppat_sign/ttd-PAT06.png	\N
33	20008-2025-000003	PAT06	Rasya Indehouse	/penting_F_simpan/folderttd/ppat_sign/ttd-PAT06.png	\N
34	20008-2025-000004	PAT06	Rasya Indehouse	/penting_F_simpan/folderttd/ppat_sign/ttd-PAT06.png	\N
35	20008-2025-000005	PAT06	Rasya Indehouse	/penting_F_simpan/folderttd/ppat_sign/ttd-PAT06.png	\N
36	20008-2025-000006	PAT06	Rasya Indehouse	/penting_F_simpan/folderttd/ppat_sign/ttd-PAT06.png	\N
37	20008-2025-000007	PAT06	Rasya Indehouse	/penting_F_simpan/folderttd/ppat_sign/ttd-PAT06.png	\N
38	20008-2025-000008	PAT06	Rasya Indehouse	/penting_F_simpan/folderttd/ppat_sign/ttd-PAT06.png	\N
39	20008-2025-000009	PAT06	Rasya Indehouse	/penting_F_simpan/folderttd/ppat_sign/ttd-PAT06.png	\N
40	20008-2025-000010	PAT06	Rasya Indehouse	/penting_F_simpan/folderttd/ppat_sign/ttd-PAT06.png	\N
41	20008-2025-000011	PAT06	Rasya Indehouse	/penting_F_simpan/folderttd/ppat_sign/ttd-PAT06.png	\N
42	20008-2025-000012	PAT06	Rasya Indehouse	/penting_F_simpan/folderttd/ppat_sign/ttd-PAT06.png	\N
43	20008-2025-000013	PAT06	Rasya Indehouse	/penting_F_simpan/folderttd/ppat_sign/ttd-PAT06.png	\N
\.


--
-- Data for Name: pat_7_validasi_surat; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.pat_7_validasi_surat (id, nomor_validasi, nama_pemohon, alamat_pemohon, no_telepon, tanggal_validasi, tanggal_dibuat, status, userid, created_at, nobooking, pemparaf, status_tertampil) FROM stdin;
1	00604K9-AMU	Farras Syauqi	Jl. Palayu Raya no. 57, Kota Bogor, Jawa Barat	087726101813	2025-05-17 16:10:27+07	2025-05-17 16:10:27.842167	unused	\N	2025-05-19 08:05:53.535799+07	\N	\N	\N
15	9639XH7-6HW	s	s	1234567891012	2025-05-19 08:08:50+07	2025-05-19 08:08:50.367119	unused	\N	2025-05-19 08:08:50.367119+07	\N	\N	\N
17	ON62SF2X-72C	Rasya Indehouse	Jalan Baru	483094839410	2025-09-14 00:47:30.734115+07	2025-09-14 00:47:30.734115	unused	PAT06	2025-09-14 00:47:30.734115+07	20008-2025-000002	\N	Menunggu
18	JRXG60R1-K3J	Rasya Indehouse	ALAMAT	483094839410	2025-09-17 06:56:12.071166+07	2025-09-17 06:56:12.071166	unused	PAT06	2025-09-17 06:56:12.071166+07	20008-2025-000003	\N	Menunggu
19	15U1O7U7-XPI	Rasya Indehouse	KETERANGAN	483094839410	2025-09-17 19:56:01.653916+07	2025-09-17 19:56:01.653916	unused	PAT06	2025-09-17 19:56:01.653916+07	20008-2025-000004	\N	Menunggu
20	J7MDZOXJ-5AD	Rasya Indehouse	KETERANGAN	483094839410	2025-09-17 21:08:38.265955+07	2025-09-17 21:08:38.265955	unused	PAT06	2025-09-17 21:08:38.265955+07	20008-2025-000005	\N	Menunggu
21	FSADQ30O-O5N	Rasya Indehouse	ALAMAT	483094839410	2025-09-18 20:54:11.171826+07	2025-09-18 20:54:11.171826	unused	PAT06	2025-09-18 20:54:11.171826+07	20008-2025-000006	P01	Menunggu
22	6EEWC4WH-URT	Rasya Indehouse	JANGAN	483094839410	2025-09-21 18:50:44.849783+07	2025-09-21 18:50:44.849783	unused	PAT06	2025-09-21 18:50:44.849783+07	20008-2025-000011	\N	Menunggu
23	TEVP4058-I8M	Rasya Indehouse	B	483094839410	2025-09-21 21:32:21.062846+07	2025-09-21 21:32:21.062846	unused	PAT06	2025-09-21 21:32:21.062846+07	20008-2025-000012	\N	Menunggu
24	W9SIH8KE-A4A	Rasya Indehouse	J	483094839410	2025-09-22 00:06:05.191625+07	2025-09-22 00:06:05.191625	unused	PAT06	2025-09-22 00:06:05.191625+07	20008-2025-000013	\N	Menunggu
\.


--
-- Data for Name: pat_8_validasi_tambahan; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.pat_8_validasi_tambahan (id, nobooking, kampungop, kelurahanop, kecamatanopj, alamat_pemohon, created_at, updated_at) FROM stdin;
1	20001-2025-000003	kampung	kelurahan	kecamatan	-	2025-05-22 14:28:08.898979	2025-05-22 21:28:08.898979
2	20001-2025-000004	KAMPUNG	KELURAHAN OBJEK	KECAMATAN OBJEK PAJAK	ALAMAT PEMOHON	2025-05-24 02:00:23.077882	2025-05-24 09:00:23.077882
3	20001-2025-000007	\N	\N	\N	\N	2025-05-26 02:47:50.473753	2025-05-26 09:47:50.473753
4	20001-2025-000007	kampoeng	DESA	\N	TEst	2025-05-26 03:34:05.310852	2025-05-26 10:34:05.310852
5	20001-2025-000008	Kampoeng	Lurah	Kcamta	Jl. Palayu Raya no. 57, Kota Bogor, Jawa Barat	2025-05-26 03:40:09.931763	2025-05-26 11:02:59.209838
6	20001-2025-000009	Kampoeng	DESA KALI	Kecamatan kecamatan	Jl. Palayu Raya no. 57, Kota Bogor, Jawa Barat	2025-05-26 04:20:52.417326	2025-05-26 11:33:55.695505
7	20001-2025-000010	Kampoeng	Kelurahan Desa	Tegal Gundil	Jl. Palayu Raya no. 57, Kota Bogor, Jawa Barat	2025-05-27 00:49:01.662724	2025-05-27 07:49:44.925469
8	20001-2025-000011	Kampoeng	Kelurahan Desa	Kecamatan	Jl. Palayu Raya no. 57, Kota Bogor, Jawa Barat	2025-05-27 04:09:09.114549	2025-05-27 11:14:00.083762
9	20001-2025-000012	Kampoeng	Kelurahan	Kecamatan	Jalan Jalan Jalan	2025-06-05 15:56:55.8942	2025-06-05 23:03:36.376744
10	20001-2025-000013	kampung	lurah	camat	jalan	2025-06-28 04:03:45.583854	2025-06-28 11:04:58.363681
11	20001-2025-000014	kampung	desa	camat	alamat	2025-07-02 07:59:09.383621	2025-07-02 15:02:02.171948
12	20001-2025-000015	-	-	-	-	2025-08-01 13:39:49.425661	2025-08-15 22:34:17.678653
13	20002-2025-000003	Kampung	Kelurahan	Kecamatan	ini alamat	2025-09-03 08:25:26.254592	2025-09-03 20:50:09.874759
14	20002-2025-000004	Kampung	Kelurahan	Kecamatan	Alamat Pemohon	2025-09-06 12:39:49.474691	2025-09-06 19:43:11.994902
15	20002-2025-000005	\N	\N	\N	\N	2025-09-06 17:06:09.318464	2025-09-07 00:06:09.318464
16	20002-2025-000006	\N	\N	\N	\N	2025-09-07 08:51:54.149616	2025-09-07 15:51:54.149616
17	20002-2025-000007	Kampung mana	Kelurahan Mana	Kecamatan mana	Dimana aja	2025-09-07 10:35:26.109197	2025-09-07 19:41:40.912375
18	20008-2025-000001	Kampung	K	K	alamat pemohon	2025-09-09 19:16:21.216772	2025-09-11 20:42:27.059066
19	20008-2025-000002	Kampung	Kelurahan	Kecamatannnnn	Jalan Baru	2025-09-13 09:38:50.367361	2025-09-13 16:42:07.294722
20	20008-2025-000003	Kampung	Kelurahan	Kecamatan	ALAMAT	2025-09-16 23:46:26.709007	2025-09-17 06:47:18.353906
21	20008-2025-000004	KETERANGAN	KETERANGAN	KETERANGAN	KETERANGAN	2025-09-17 12:50:32.20654	2025-09-17 19:52:40.909404
22	20008-2025-000005	KETERANGAN	KETERANGAN	KETERANGAN	KETERANGAN	2025-09-17 12:52:14.311579	2025-09-17 19:52:57.558426
23	20008-2025-000006	Kampank	Kelurahan	Kecamatan	ALAMAT	2025-09-18 09:48:13.769391	2025-09-18 16:50:07.376422
24	20008-2025-000007	Kampung	Kelurahan	Kecamatan	ALAMAK	2025-09-19 18:14:41.579517	2025-09-20 01:15:08.248664
25	20008-2025-000008	K	K	K	K	2025-09-19 21:33:35.513826	2025-09-20 04:34:00.353088
26	20008-2025-000009	SAYANG	SAYANG	SAYANG	SAYANG	2025-09-19 21:45:10.442119	2025-09-20 04:45:28.370107
27	20008-2025-000010	k	k	k	k	2025-09-20 22:02:06.589128	2025-09-21 05:02:21.042639
28	20008-2025-000011	JANGAN	JANGAN	JANGAN	JANGAN	2025-09-21 09:55:12.901813	2025-09-21 16:55:29.216649
29	20008-2025-000012	B	B	B	B	2025-09-21 14:28:22.110627	2025-09-21 21:28:42.459393
30	20008-2025-000013	J	J	J	J	2025-09-21 15:38:37.550322	2025-09-21 22:39:39.840988
\.


--
-- Data for Name: pv_1_debug_log; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.pv_1_debug_log (id, no_validasi, old_status, new_status, updated_by, updated_at) FROM stdin;
2	15U1O7U7-XPI	Dianalisis	Divalidasi	postgres	2025-09-17 23:06:40.302984+07
3	15U1O7U7-XPI	Divalidasi	Divalidasi	postgres	2025-09-17 23:39:43.613756+07
4	JRXG60R1-K3J	Dianalisis	Divalidasi	postgres	2025-09-18 01:07:24.90276+07
5	FSADQ30O-O5N	Dianalisis	Dianalisis	postgres	2025-09-18 22:17:50.245596+07
6	TEVP4058-I8M	Dianalisis	Divalidasi	postgres	2025-09-21 21:33:16.140582+07
7	W9SIH8KE-A4A	Dianalisis	Divalidasi	postgres	2025-09-22 01:16:45.014485+07
\.


--
-- Data for Name: pv_1_paraf_validate; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.pv_1_paraf_validate (nobooking, userid, namawajibpajak, namapemilikobjekpajak, status, trackstatus, keterangan, no_validasi, pemverifikasi, pemparaf, status_tertampil, no_registrasi, id, updated_at, tanda_tangan_validasi_path) FROM stdin;
20001-2025-000012	PAT01	Farras	Syauqi	Dianalisis	Terverifikasi	Dikirim oleh: A Loket Terima Berkas	B9XCPNOT-SZ0	\N	\N	\N	\N	1	2025-09-17 03:59:35.090809+07	\N
20001-2025-000013	PAT01	test	KARL	Dianalisis	Terverifikasi	\N	PC9MQPEJ-3VX	\N	\N	\N	\N	2	2025-09-17 03:59:35.090809+07	\N
20008-2025-000002	PAT06	Farras Syauqi	Syauqi Muharam	Dianalisis	Terverifikasi	\N	ON62SF2X-72C	P01	\N	Menunggu	2025O00002	6	2025-09-17 03:59:35.090809+07	\N
20008-2025-000011	PAT06	ALAS KAKI	OH GITU	Dianalisis	Terverifikasi	\N	6EEWC4WH-URT	P01	\N	Menunggu	2025O00010	12	2025-09-21 18:50:44.849783+07	\N
20008-2025-000012	PAT06	S	S	Divalidasi	Dibaca	Sudah diparaf	TEVP4058-I8M	P01	\N	Sudah Divalidasi	2025O00011	13	2025-09-21 21:33:16.140582+07	/penting_F_simpan/folderttd/parafv_sign/ttd-PV01.png
20008-2025-000013	PAT06	L	L	Divalidasi	Dibaca	Sudah diparaf	W9SIH8KE-A4A	P01	\N	Sudah Divalidasi	2025O00012	14	2025-09-22 01:16:45.014485+07	/penting_F_simpan/folderttd/parafv_sign/ttd-PV01.png
20008-2025-000005	PAT06	KETERANGAN	KETERANGAN	Divalidasi	Dibaca	\N	J7MDZOXJ-5AD	P01	\N	Sudah Divalidasi	2025O00005	9	2025-09-17 21:08:38.265955+07	\N
20008-2025-000004	PAT06	Mayendar	Mugann	Divalidasi	Dibaca	Sudah diparaf	15U1O7U7-XPI	P01	\N	Sudah Divalidasi	2025O00004	8	2025-09-17 23:39:43.613756+07	/penting_F_simpan/folderttd/parafv_sign/ttd-PV01.png
20008-2025-000003	PAT06	Farras Syau	Syauqi Muharam	Divalidasi	Dibaca	Sudah diparaf	JRXG60R1-K3J	P01	\N	Sudah Divalidasi	2025O00003	7	2025-09-18 01:07:24.90276+07	/penting_F_simpan/folderttd/parafv_sign/ttd-PV01.png
20008-2025-000006	PAT06	DEMIN	SEMI	Dianalisis	Terverifikasi	\N	FSADQ30O-O5N	P01	P01	Menunggu	2025O00006	10	2025-09-18 20:54:11.171826+07	\N
\.


--
-- Data for Name: pv_2_signing_requests; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.pv_2_signing_requests (id, document_id, signer_userid, signer_role, bsre_request_id, status, appearance_json, order_index, signed_at, failure_reason, usage_code, password_attempts, created_at, updated_at, nobooking, no_validasi, source_pdf_path, pdf_sha256, signed_pdf_path, verification_report_json, signature_level, qr_payload, qr_image_path, qr_sig, qr_alg, approved_by, approved_at) FROM stdin;
2	189	PV01	Peneliti Validasi	MOCK-886e58688456629585fddf48	Signed	\N	0	2025-09-17 06:57:38.33894+07	\N	\N	0	2025-09-17 06:56:12.071166+07	2025-09-18 23:36:00.527437+07	20008-2025-000003	JRXG60R1-K3J	/validasi/20008-2025-000003-Tervalidasi.pdf	1354605b525a0d67dc13dfbe1ed670b9227f94fcec4edcd0e6e0270abdd3683c	/validasi/20008-2025-000003-Tervalidasi-signed.pdf	{"policy": "PAdES-mock", "isValid": true, "timestamp": "2025-09-17T18:07:22.489Z"}	\N	3218301223/18-09-2025/Ini ST. ESTE. MT//E-BPHTB BAPPENDA KAB BOGOR	/qrcode/qr_JRXG60R1-K3J.png	b459d084026fd57b5bcd585092946f3d2b0134640a07edda38a8c4998103f7a7	HMAC-SHA256	PV01	2025-09-18 01:07:24.90276
8	199	PV01	Peneliti Validasi	\N	Signed	\N	0	2025-09-22 01:16:25.794071+07	\N	\N	0	2025-09-22 00:06:05.191625+07	2025-09-22 01:54:20.203921+07	20008-2025-000013	W9SIH8KE-A4A	/validasi/20008-2025-000013-Tervalidasi.pdf	72e5996b6e269c7c2acfebea5d5a3bd1ae8d832c4b73c64dbbea072c17d18b5d	/validasi/20008-2025-000013-Tervalidasi-signed.pdf	{"policy": "PAdES-mock", "isValid": true, "timestamp": "2025-09-21T18:48:36.934Z"}	\N	3218301223/22-09-2025/Ini ST. ESTE. MT//E-BPHTB BAPPENDA KAB BOGOR	/qrcode/qr_W9SIH8KE-A4A.png	dcd733184997e78df7e13fd93b373aef87cbab7bfea02e494c8d8e44d4d7ea2d	HMAC-SHA256	PV01	2025-09-22 01:16:45.014485
4	191	PV01	Peneliti Validasi	\N	Signed	\N	0	2025-09-17 21:10:37.729519+07	\N	\N	0	2025-09-17 21:08:38.265955+07	2025-09-18 17:35:00.86465+07	20008-2025-000005	J7MDZOXJ-5AD	/validasi/20008-2025-000005-Tervalidasi.pdf	f952551ddc7fa2a9d2d9ac760319c2dedd7b042e85caca7dad25e3a0b5480459	/validasi/20008-2025-000005-Tervalidasi-signed.pdf	{"policy": "PAdES-mock", "isValid": true, "timestamp": "2025-09-17T14:29:44.087Z"}	\N	3218301223/17-09-2025/Ini ST. ESTE. MT//E-BPHTB BAPPENDA KAB BOGOR	/qrcode/qr_J7MDZOXJ-5AD.png	bc10e5de01b74e710f3fe7495bc4ff9f821c6bd23a638613b986af8085417697	HMAC-SHA256	\N	\N
1	188	PV01	Peneliti Validasi	MOCK-4d5f591de3e4c9d137535964	Signed	\N	0	2025-09-17 06:42:02.379326+07	\N	\N	0	2025-09-14 00:47:30.734115+07	2025-09-18 23:36:02.616948+07	20008-2025-000002	ON62SF2X-72C	/validasi/20008-2025-000002-Tervalidasi.pdf	5cce0c86d849f26c0dbd701c494f2b697640a34989a9255e5b69d4669295f6ba	/validasi/20008-2025-000002-Tervalidasi-signed.pdf	{"policy": "PAdES-mock", "isValid": true, "timestamp": "2025-09-17T12:22:43.915Z"}	\N	3218301223/18-09-2025/Ini ST. ESTE. MT//E-BPHTB BAPPENDA KAB BOGOR	/qrcode/qr_ON62SF2X-72C.png	b459d084026fd57b5bcd585092946f3d2b0134640a07edda38a8c4998103f7a7	HMAC-SHA256	\N	\N
3	190	PV01	Peneliti Validasi	\N	Signed	\N	0	2025-09-17 20:04:53.277083+07	\N	\N	0	2025-09-17 19:56:01.653916+07	2025-09-18 23:37:03.769462+07	20008-2025-000004	15U1O7U7-XPI	/validasi/20008-2025-000004-Tervalidasi.pdf	61d12e8b9f2e9a6bd82a9ba792ce7b94547c130e438453a2c2b2ad33fc3fc30d	/validasi/20008-2025-000004-Tervalidasi-signed.pdf	{"policy": "PAdES-mock", "isValid": true, "timestamp": "2025-09-17T16:39:41.231Z"}	\N	3218301223/17-09-2025/Ini ST. ESTE. MT//E-BPHTB BAPPENDA KAB BOGOR	/qrcode/qr_15U1O7U7-XPI.png	bc10e5de01b74e710f3fe7495bc4ff9f821c6bd23a638613b986af8085417697	HMAC-SHA256	PV01	2025-09-17 23:39:43.613756
6	197	\N	Peneliti Validasi	\N	Pending	\N	0	\N	\N	\N	0	2025-09-21 18:50:44.849783+07	2025-09-21 18:50:44.849783+07	20008-2025-000011	6EEWC4WH-URT	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
7	198	PV01	Peneliti Validasi	\N	Signed	\N	0	2025-09-21 21:33:11.799283+07	\N	\N	0	2025-09-21 21:32:21.062846+07	2025-09-21 21:33:25.668817+07	20008-2025-000012	TEVP4058-I8M	/validasi/20008-2025-000012-Tervalidasi.pdf	34d4e330e5cdddbf13bcb5e2d72b1d951ef04ae8c8776040480b675c51786a06	/validasi/20008-2025-000012-Tervalidasi-signed.pdf	{"policy": "PAdES-mock", "isValid": true, "timestamp": "2025-09-21T14:33:11.803Z"}	\N	3218301223/21-09-2025/Ini ST. ESTE. MT//E-BPHTB BAPPENDA KAB BOGOR	/qrcode/qr_TEVP4058-I8M.png	9d0574f7e6edb29598b2a393f481b5cfcb971515da4c74865f8e016542561bca	HMAC-SHA256	PV01	2025-09-21 21:33:16.140582
5	192	PV01	Peneliti Validasi	\N	Pending	\N	0	\N	\N	\N	0	2025-09-18 20:54:11.171826+07	2025-09-18 23:35:01.429962+07	20008-2025-000006	FSADQ30O-O5N	/validasi/20008-2025-000006-Tervalidasi.pdf	d423c2178a5a631c88de7ac9168d1347b3360866e049a539ee6baae3ff2479fb	\N	\N	\N	3218301223/18-09-2025/Ini ST. ESTE. MT//E-BPHTB BAPPENDA KAB BOGOR	/qrcode/qr_FSADQ30O-O5N.png	b459d084026fd57b5bcd585092946f3d2b0134640a07edda38a8c4998103f7a7	HMAC-SHA256	\N	\N
\.


--
-- Data for Name: pv_3_bsre_token_cache; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.pv_3_bsre_token_cache (id, environment, access_token, expires_at, obtained_at, created_at, updated_at) FROM stdin;
3	sandbox	mock-3955736c1eff5189881e67f32adf3b39	2025-09-14 02:43:38.648+07	2025-09-14 01:48:38.649402+07	2025-09-14 01:48:38.649402+07	2025-09-14 01:48:38.649402+07
4	sandbox	mock-3f46e327da2d07d3324dc1a1acae9615	2025-09-15 16:49:07.787+07	2025-09-15 15:54:07.770733+07	2025-09-15 15:54:07.770733+07	2025-09-15 15:54:07.770733+07
5	sandbox	mock-b0c7a2cb004ab5e8eff171268226d91d	2025-09-17 03:33:24.598+07	2025-09-17 02:38:24.580067+07	2025-09-17 02:38:24.580067+07	2025-09-17 02:38:24.580067+07
6	sandbox	mock-2eacecaaf8d8d713bf003a25900761e6	2025-09-17 04:36:12.749+07	2025-09-17 03:41:12.734074+07	2025-09-17 03:41:12.734074+07	2025-09-17 03:41:12.734074+07
7	sandbox	mock-ebde5fbb0cf113c28267afd23f693382	2025-09-17 06:31:03.921+07	2025-09-17 05:36:03.904373+07	2025-09-17 05:36:03.904373+07	2025-09-17 05:36:03.904373+07
8	sandbox	mock-b7166284df9c5c3fb9870c4be202b455	2025-09-17 07:36:58.517+07	2025-09-17 06:41:58.505675+07	2025-09-17 06:41:58.505675+07	2025-09-17 06:41:58.505675+07
\.


--
-- Data for Name: pv_4_signing_audit_event; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.pv_4_signing_audit_event (id, entity_type, entity_id, event_type, payload_json, created_at, no_validasi, signing_request_id, actor_userid, origin, correlation_id) FROM stdin;
1	signing_request	1	created	{"nobooking": "20008-2025-000002", "trackstatus": "Terverifikasi"}	2025-09-14 00:47:30.734115+07	ON62SF2X-72C	1	P01	backend	\N
2	signing_request	1	initiated	{"by": "PV01", "action": "claim"}	2025-09-15 00:39:15.350353+07	ON62SF2X-72C	1	PV01	backend	\N
3	signing_request	1	initiated	{"by": "PV01", "action": "claim"}	2025-09-15 02:27:41.373617+07	ON62SF2X-72C	1	PV01	backend	\N
4	signing_request	1	initiated	{"by": "PV01", "action": "claim"}	2025-09-15 15:40:02.647564+07	ON62SF2X-72C	1	PV01	backend	\N
5	signing_request	1	created	{"action": "document_ready", "nobooking": "20008-2025-000002"}	2025-09-15 15:54:02.64654+07	ON62SF2X-72C	1	PV01	backend	\N
6	signing_request	1	initiated	{"bsreRequestId": "MOCK-8b9c8b1c597bd1282cd0870b"}	2025-09-15 15:54:07.770733+07	ON62SF2X-72C	1	PV01	backend	\N
7	signing_request	1	initiated	{"bsreRequestId": "MOCK-a7dfce9a2a20cd1bf0748f4d"}	2025-09-15 16:08:42.689516+07	ON62SF2X-72C	1	PV01	backend	\N
8	signing_request	1	created	{"action": "document_ready", "nobooking": "20008-2025-000002"}	2025-09-16 06:52:34.520688+07	ON62SF2X-72C	1	PV01	backend	\N
9	signing_request	1	created	{"action": "document_ready", "nobooking": "20008-2025-000002"}	2025-09-16 06:57:37.949489+07	ON62SF2X-72C	1	PV01	backend	\N
10	signing_request	1	created	{"action": "document_ready", "nobooking": "20008-2025-000002"}	2025-09-16 07:08:12.307812+07	ON62SF2X-72C	1	PV01	backend	\N
11	signing_request	1	created	{"action": "document_ready", "nobooking": "20008-2025-000002"}	2025-09-17 02:34:22.102797+07	ON62SF2X-72C	1	PV01	backend	\N
12	signing_request	1	created	{"action": "document_ready", "nobooking": "20008-2025-000002"}	2025-09-17 02:38:22.914679+07	ON62SF2X-72C	1	PV01	backend	\N
13	signing_request	1	initiated	{"bsreRequestId": "MOCK-f79da360e54fc672140205d0"}	2025-09-17 02:38:24.580067+07	ON62SF2X-72C	1	PV01	backend	\N
14	signing_request	1	signed	{"bsreSignatureId": "MOCK-SIG-ff50b944c1a58a88"}	2025-09-17 02:38:28.948945+07	ON62SF2X-72C	1	PV01	backend	\N
15	signing_request	1	verified	{"policy": "PAdES-mock", "isValid": true, "timestamp": "2025-09-16T19:38:37.079Z"}	2025-09-17 02:38:37.078751+07	ON62SF2X-72C	1	PV01	backend	\N
16	signing_request	1	created	{"action": "document_ready", "nobooking": "20008-2025-000002"}	2025-09-17 02:38:41.447496+07	ON62SF2X-72C	1	PV01	backend	\N
17	signing_request	1	initiated	{"by": "PV01", "action": "claim"}	2025-09-17 03:28:14.524621+07	ON62SF2X-72C	1	PV01	backend	\N
18	signing_request	1	created	{"action": "document_ready", "nobooking": "20008-2025-000002"}	2025-09-17 03:41:08.853872+07	ON62SF2X-72C	1	PV01	backend	\N
19	signing_request	1	initiated	{"bsreRequestId": "MOCK-80c9dcfb642709071426fa38"}	2025-09-17 03:41:12.734074+07	ON62SF2X-72C	1	PV01	backend	\N
20	signing_request	1	signed	{"bsreSignatureId": "MOCK-SIG-5449a3cd7ce03d36"}	2025-09-17 03:41:20.646079+07	ON62SF2X-72C	1	PV01	backend	\N
21	signing_request	1	verified	{"policy": "PAdES-mock", "isValid": true, "timestamp": "2025-09-16T20:41:23.350Z"}	2025-09-17 03:41:23.350389+07	ON62SF2X-72C	1	PV01	backend	\N
22	signing_request	1	created	{"action": "document_ready", "nobooking": "20008-2025-000002"}	2025-09-17 03:46:42.506766+07	ON62SF2X-72C	1	PV01	backend	\N
23	signing_request	1	initiated	{"bsreRequestId": "MOCK-d4386752812a571f113ad85b"}	2025-09-17 03:46:43.910386+07	ON62SF2X-72C	1	PV01	backend	\N
24	signing_request	1	signed	{"bsreSignatureId": "MOCK-SIG-4c3111dd249e6673"}	2025-09-17 03:46:51.537453+07	ON62SF2X-72C	1	PV01	backend	\N
25	signing_request	1	verified	{"policy": "PAdES-mock", "isValid": true, "timestamp": "2025-09-16T20:46:53.456Z"}	2025-09-17 03:46:53.457028+07	ON62SF2X-72C	1	PV01	backend	\N
26	signing_request	1	created	{"action": "document_ready", "nobooking": "20008-2025-000002"}	2025-09-17 03:47:35.912134+07	ON62SF2X-72C	1	PV01	backend	\N
27	signing_request	1	initiated	{"bsreRequestId": "MOCK-5b725aef085a5b9f199b60e2"}	2025-09-17 03:47:37.146568+07	ON62SF2X-72C	1	PV01	backend	\N
28	signing_request	1	created	{"action": "document_ready", "nobooking": "20008-2025-000002"}	2025-09-17 05:04:40.225009+07	ON62SF2X-72C	1	PV01	backend	\N
29	signing_request	1	created	{"action": "document_ready", "nobooking": "20008-2025-000002"}	2025-09-17 05:36:02.106887+07	ON62SF2X-72C	1	PV01	backend	\N
30	signing_request	1	initiated	{"bsreRequestId": "MOCK-14a27c0736552535935f4fa3"}	2025-09-17 05:36:03.904373+07	ON62SF2X-72C	1	PV01	backend	\N
31	signing_request	1	signed	{"bsreSignatureId": "MOCK-SIG-c9696b7bb193c08c"}	2025-09-17 05:36:07.622119+07	ON62SF2X-72C	1	PV01	backend	\N
32	signing_request	1	verified	{"policy": "PAdES-mock", "isValid": true, "timestamp": "2025-09-16T22:36:09.513Z"}	2025-09-17 05:36:09.514143+07	ON62SF2X-72C	1	PV01	backend	\N
33	signing_request	1	created	{"action": "document_ready", "nobooking": "20008-2025-000002"}	2025-09-17 06:41:57.123782+07	ON62SF2X-72C	1	PV01	backend	\N
34	signing_request	1	initiated	{"bsreRequestId": "MOCK-4d5f591de3e4c9d137535964"}	2025-09-17 06:41:58.505675+07	ON62SF2X-72C	1	PV01	backend	\N
35	signing_request	1	signed	{"bsreSignatureId": "MOCK-SIG-1bb9cef511e91a96"}	2025-09-17 06:42:02.379326+07	ON62SF2X-72C	1	PV01	backend	\N
36	signing_request	1	verified	{"policy": "PAdES-mock", "isValid": true, "timestamp": "2025-09-16T23:42:03.456Z"}	2025-09-17 06:42:03.45609+07	ON62SF2X-72C	1	PV01	backend	\N
37	signing_request	2	created	{"nobooking": "20008-2025-000003", "trackstatus": "Terverifikasi"}	2025-09-17 06:56:12.071166+07	JRXG60R1-K3J	2	P01	backend	\N
38	signing_request	2	initiated	{"by": "PV01", "action": "claim"}	2025-09-17 06:57:26.322656+07	JRXG60R1-K3J	2	PV01	backend	\N
39	signing_request	2	created	{"action": "document_ready", "nobooking": "20008-2025-000003"}	2025-09-17 06:57:28.766904+07	JRXG60R1-K3J	2	PV01	backend	\N
40	signing_request	2	initiated	{"bsreRequestId": "MOCK-886e58688456629585fddf48"}	2025-09-17 06:57:30.055361+07	JRXG60R1-K3J	2	PV01	backend	\N
41	signing_request	2	signed	{"bsreSignatureId": "MOCK-SIG-cda7cba1ec72064f"}	2025-09-17 06:57:38.33894+07	JRXG60R1-K3J	2	PV01	backend	\N
42	signing_request	2	verified	{"policy": "PAdES-mock", "isValid": true, "timestamp": "2025-09-16T23:57:40.168Z"}	2025-09-17 06:57:40.168059+07	JRXG60R1-K3J	2	PV01	backend	\N
43	signing_request	1	initiated	{"by": "PV01", "action": "claim"}	2025-09-17 15:28:00.280289+07	ON62SF2X-72C	1	PV01	backend	\N
44	signing_request	1	initiated	{"by": "PV01", "action": "claim"}	2025-09-17 15:52:20.924836+07	ON62SF2X-72C	1	PV01	backend	\N
45	signing_request	1	initiated	{"by": "PV01", "action": "claim"}	2025-09-17 15:52:23.55084+07	ON62SF2X-72C	1	PV01	backend	\N
46	signing_request	1	created	{"action": "document_ready", "nobooking": "20008-2025-000002"}	2025-09-17 15:52:23.559759+07	ON62SF2X-72C	1	PV01	backend	\N
47	signing_request	1	verified	{"policy": "PAdES-mock", "isValid": true, "timestamp": "2025-09-17T08:52:23.802Z"}	2025-09-17 15:52:23.802897+07	ON62SF2X-72C	1	PV01	backend	\N
48	signing_request	1	initiated	{"by": "PV01", "action": "claim"}	2025-09-17 17:02:53.093526+07	ON62SF2X-72C	1	PV01	backend	\N
49	signing_request	1	initiated	{"by": "PV01", "action": "claim"}	2025-09-17 17:02:56.393282+07	ON62SF2X-72C	1	PV01	backend	\N
50	signing_request	1	created	{"action": "document_ready", "nobooking": "20008-2025-000002"}	2025-09-17 17:02:56.407164+07	ON62SF2X-72C	1	PV01	backend	\N
51	signing_request	1	verified	{"policy": "PAdES-mock", "isValid": true, "timestamp": "2025-09-17T10:02:56.578Z"}	2025-09-17 17:02:56.577514+07	ON62SF2X-72C	1	PV01	backend	\N
52	signing_request	1	initiated	{"by": "PV01", "action": "claim"}	2025-09-17 17:22:36.439784+07	ON62SF2X-72C	1	PV01	backend	\N
53	signing_request	1	initiated	{"by": "PV01", "action": "claim"}	2025-09-17 17:22:38.892067+07	ON62SF2X-72C	1	PV01	backend	\N
54	signing_request	1	initiated	{"by": "PV01", "action": "claim"}	2025-09-17 17:22:50.097086+07	ON62SF2X-72C	1	PV01	backend	\N
55	signing_request	1	created	{"action": "document_ready", "nobooking": "20008-2025-000002"}	2025-09-17 17:22:50.111255+07	ON62SF2X-72C	1	PV01	backend	\N
56	signing_request	1	verified	{"policy": "PAdES-mock", "isValid": true, "timestamp": "2025-09-17T10:22:50.293Z"}	2025-09-17 17:22:50.293024+07	ON62SF2X-72C	1	PV01	backend	\N
57	signing_request	1	initiated	{"by": "PV01", "action": "claim"}	2025-09-17 17:23:22.303805+07	ON62SF2X-72C	1	PV01	backend	\N
58	signing_request	1	initiated	{"by": "PV01", "action": "claim"}	2025-09-17 17:30:54.938948+07	ON62SF2X-72C	1	PV01	backend	\N
59	signing_request	1	initiated	{"by": "PV01", "action": "claim"}	2025-09-17 17:30:56.493154+07	ON62SF2X-72C	1	PV01	backend	\N
60	signing_request	1	created	{"action": "document_ready", "nobooking": "20008-2025-000002"}	2025-09-17 17:30:56.507923+07	ON62SF2X-72C	1	PV01	backend	\N
61	signing_request	1	verified	{"policy": "PAdES-mock", "isValid": true, "timestamp": "2025-09-17T10:30:56.676Z"}	2025-09-17 17:30:56.676382+07	ON62SF2X-72C	1	PV01	backend	\N
62	signing_request	1	initiated	{"by": "PV01", "action": "claim"}	2025-09-17 17:32:25.450493+07	ON62SF2X-72C	1	PV01	backend	\N
63	signing_request	1	initiated	{"by": "PV01", "action": "claim"}	2025-09-17 17:32:26.847829+07	ON62SF2X-72C	1	PV01	backend	\N
64	signing_request	1	created	{"action": "document_ready", "nobooking": "20008-2025-000002"}	2025-09-17 17:32:26.857619+07	ON62SF2X-72C	1	PV01	backend	\N
65	signing_request	1	verified	{"policy": "PAdES-mock", "isValid": true, "timestamp": "2025-09-17T10:32:26.958Z"}	2025-09-17 17:32:26.959012+07	ON62SF2X-72C	1	PV01	backend	\N
66	signing_request	1	initiated	{"by": "PV01", "action": "claim"}	2025-09-17 17:32:45.899467+07	ON62SF2X-72C	1	PV01	backend	\N
67	signing_request	1	initiated	{"by": "PV01", "action": "claim"}	2025-09-17 17:32:47.548566+07	ON62SF2X-72C	1	PV01	backend	\N
68	signing_request	1	created	{"action": "document_ready", "nobooking": "20008-2025-000002"}	2025-09-17 17:32:47.564332+07	ON62SF2X-72C	1	PV01	backend	\N
69	signing_request	1	verified	{"policy": "PAdES-mock", "isValid": true, "timestamp": "2025-09-17T10:32:47.643Z"}	2025-09-17 17:32:47.643443+07	ON62SF2X-72C	1	PV01	backend	\N
70	signing_request	1	initiated	{"by": "PV01", "action": "claim"}	2025-09-17 17:45:04.489843+07	ON62SF2X-72C	1	PV01	backend	\N
71	signing_request	1	initiated	{"by": "PV01", "action": "claim"}	2025-09-17 17:45:06.567728+07	ON62SF2X-72C	1	PV01	backend	\N
72	signing_request	1	created	{"action": "document_ready", "nobooking": "20008-2025-000002"}	2025-09-17 17:45:06.582448+07	ON62SF2X-72C	1	PV01	backend	\N
73	signing_request	1	verified	{"policy": "PAdES-mock", "isValid": true, "timestamp": "2025-09-17T10:45:06.751Z"}	2025-09-17 17:45:06.750812+07	ON62SF2X-72C	1	PV01	backend	\N
74	signing_request	1	initiated	{"by": "PV01", "action": "claim"}	2025-09-17 18:21:40.177949+07	ON62SF2X-72C	1	PV01	backend	\N
75	signing_request	1	initiated	{"by": "PV01", "action": "claim"}	2025-09-17 18:21:41.582147+07	ON62SF2X-72C	1	PV01	backend	\N
76	signing_request	1	created	{"action": "document_ready", "nobooking": "20008-2025-000002"}	2025-09-17 18:21:41.595995+07	ON62SF2X-72C	1	PV01	backend	\N
77	signing_request	1	verified	{"policy": "PAdES-mock", "isValid": true, "timestamp": "2025-09-17T11:21:41.791Z"}	2025-09-17 18:21:41.791798+07	ON62SF2X-72C	1	PV01	backend	\N
78	signing_request	1	created	{"action": "document_ready", "nobooking": "20008-2025-000002"}	2025-09-17 18:22:23.143188+07	ON62SF2X-72C	1	PV01	backend	\N
79	signing_request	2	initiated	{"by": "PV01", "action": "claim"}	2025-09-17 18:31:51.867925+07	JRXG60R1-K3J	2	PV01	backend	\N
80	signing_request	2	created	{"action": "document_ready", "nobooking": "20008-2025-000003"}	2025-09-17 18:31:53.284329+07	JRXG60R1-K3J	2	PV01	backend	\N
81	signing_request	1	initiated	{"by": "PV01", "action": "claim", "prevSigner": "PV01"}	2025-09-17 18:33:36.549069+07	ON62SF2X-72C	1	PV01	backend	\N
82	signing_request	1	initiated	{"by": "PV01", "action": "claim", "prevSigner": "PV01"}	2025-09-17 18:33:38.008809+07	ON62SF2X-72C	1	PV01	backend	\N
83	signing_request	1	created	{"action": "document_ready", "nobooking": "20008-2025-000002"}	2025-09-17 18:33:38.024473+07	ON62SF2X-72C	1	PV01	backend	\N
84	signing_request	1	verified	{"policy": "PAdES-mock", "isValid": true, "timestamp": "2025-09-17T11:33:38.215Z"}	2025-09-17 18:33:38.214434+07	ON62SF2X-72C	1	PV01	backend	\N
85	signing_request	1	initiated	{"by": "PV01", "action": "claim", "prevSigner": "PV01"}	2025-09-17 18:45:09.104569+07	ON62SF2X-72C	1	PV01	backend	\N
86	signing_request	1	initiated	{"by": "PV01", "action": "claim", "prevSigner": "PV01"}	2025-09-17 18:45:10.662112+07	ON62SF2X-72C	1	PV01	backend	\N
87	signing_request	1	created	{"action": "document_ready", "nobooking": "20008-2025-000002"}	2025-09-17 18:45:10.676209+07	ON62SF2X-72C	1	PV01	backend	\N
88	signing_request	1	verified	{"policy": "PAdES-mock", "isValid": true, "timestamp": "2025-09-17T11:45:10.838Z"}	2025-09-17 18:45:10.838171+07	ON62SF2X-72C	1	PV01	backend	\N
89	signing_request	1	initiated	{"by": "PV01", "action": "claim", "prevSigner": "PV01"}	2025-09-17 18:56:04.68793+07	ON62SF2X-72C	1	PV01	backend	\N
90	signing_request	1	initiated	{"by": "PV01", "action": "claim", "prevSigner": "PV01"}	2025-09-17 18:56:12.785476+07	ON62SF2X-72C	1	PV01	backend	\N
91	signing_request	1	created	{"action": "document_ready", "nobooking": "20008-2025-000002"}	2025-09-17 18:56:12.803732+07	ON62SF2X-72C	1	PV01	backend	\N
92	signing_request	1	verified	{"policy": "PAdES-mock", "isValid": true, "timestamp": "2025-09-17T11:56:12.977Z"}	2025-09-17 18:56:12.977045+07	ON62SF2X-72C	1	PV01	backend	\N
93	signing_request	1	initiated	{"by": "PV01", "action": "claim", "prevSigner": "PV01"}	2025-09-17 18:56:54.667163+07	ON62SF2X-72C	1	PV01	backend	\N
94	signing_request	1	initiated	{"by": "PV01", "action": "claim", "prevSigner": "PV01"}	2025-09-17 18:56:57.110347+07	ON62SF2X-72C	1	PV01	backend	\N
95	signing_request	1	created	{"action": "document_ready", "nobooking": "20008-2025-000002"}	2025-09-17 18:56:57.124793+07	ON62SF2X-72C	1	PV01	backend	\N
96	signing_request	1	verified	{"policy": "PAdES-mock", "isValid": true, "timestamp": "2025-09-17T11:56:57.231Z"}	2025-09-17 18:56:57.230841+07	ON62SF2X-72C	1	PV01	backend	\N
97	signing_request	1	initiated	{"by": "PV01", "action": "claim", "prevSigner": "PV01"}	2025-09-17 19:11:44.090697+07	ON62SF2X-72C	1	PV01	backend	\N
98	signing_request	1	initiated	{"by": "PV01", "action": "claim", "prevSigner": "PV01"}	2025-09-17 19:11:45.30654+07	ON62SF2X-72C	1	PV01	backend	\N
99	signing_request	1	created	{"action": "document_ready", "nobooking": "20008-2025-000002"}	2025-09-17 19:11:45.321308+07	ON62SF2X-72C	1	PV01	backend	\N
100	signing_request	1	verified	{"policy": "PAdES-mock", "isValid": true, "timestamp": "2025-09-17T12:11:45.484Z"}	2025-09-17 19:11:45.48433+07	ON62SF2X-72C	1	PV01	backend	\N
101	signing_request	1	initiated	{"by": "PV01", "action": "claim", "prevSigner": "PV01"}	2025-09-17 19:22:40.692847+07	ON62SF2X-72C	1	PV01	backend	\N
102	signing_request	1	initiated	{"by": "PV01", "action": "claim", "prevSigner": "PV01"}	2025-09-17 19:22:43.745278+07	ON62SF2X-72C	1	PV01	backend	\N
103	signing_request	1	created	{"action": "document_ready", "nobooking": "20008-2025-000002"}	2025-09-17 19:22:43.754711+07	ON62SF2X-72C	1	PV01	backend	\N
104	signing_request	1	verified	{"policy": "PAdES-mock", "isValid": true, "timestamp": "2025-09-17T12:22:43.915Z"}	2025-09-17 19:22:43.914375+07	ON62SF2X-72C	1	PV01	backend	\N
105	signing_request	2	initiated	{"by": "PV01", "action": "claim", "prevSigner": "PV01"}	2025-09-17 19:23:52.305349+07	JRXG60R1-K3J	2	PV01	backend	\N
106	signing_request	3	created	{"nobooking": "20008-2025-000004", "trackstatus": "Terverifikasi"}	2025-09-17 19:56:01.653916+07	15U1O7U7-XPI	3	P01	backend	\N
107	signing_request	3	initiated	{"by": "PV01", "action": "claim", "prevSigner": null}	2025-09-17 19:58:33.90512+07	15U1O7U7-XPI	3	PV01	backend	\N
108	signing_request	3	initiated	{"by": "PV01", "action": "claim", "prevSigner": "PV01"}	2025-09-17 20:04:53.091615+07	15U1O7U7-XPI	3	PV01	backend	\N
109	signing_request	3	created	{"action": "document_ready", "nobooking": "20008-2025-000004"}	2025-09-17 20:04:53.104843+07	15U1O7U7-XPI	3	PV01	backend	\N
110	signing_request	3	verified	{"policy": "PAdES-mock", "isValid": true, "timestamp": "2025-09-17T13:04:53.283Z"}	2025-09-17 20:04:53.277083+07	15U1O7U7-XPI	3	PV01	backend	\N
111	signing_request	3	initiated	{"by": "PV01", "action": "claim", "prevSigner": "PV01"}	2025-09-17 20:11:30.983094+07	15U1O7U7-XPI	3	PV01	backend	\N
112	signing_request	3	initiated	{"by": "PV01", "action": "claim", "prevSigner": "PV01"}	2025-09-17 20:32:52.556516+07	15U1O7U7-XPI	3	PV01	backend	\N
113	signing_request	3	initiated	{"by": "PV01", "action": "claim", "prevSigner": "PV01"}	2025-09-17 20:32:53.728687+07	15U1O7U7-XPI	3	PV01	backend	\N
114	signing_request	3	created	{"action": "document_ready", "nobooking": "20008-2025-000004"}	2025-09-17 20:32:53.743955+07	15U1O7U7-XPI	3	PV01	backend	\N
115	signing_request	3	verified	{"policy": "PAdES-mock", "isValid": true, "timestamp": "2025-09-17T13:32:53.924Z"}	2025-09-17 20:32:53.923899+07	15U1O7U7-XPI	3	PV01	backend	\N
116	signing_request	3	initiated	{"by": "PV01", "action": "claim", "prevSigner": "PV01"}	2025-09-17 20:41:06.254052+07	15U1O7U7-XPI	3	PV01	backend	\N
117	signing_request	3	initiated	{"by": "PV01", "action": "claim", "prevSigner": "PV01"}	2025-09-17 20:41:08.092226+07	15U1O7U7-XPI	3	PV01	backend	\N
118	signing_request	3	created	{"action": "document_ready", "nobooking": "20008-2025-000004"}	2025-09-17 20:41:08.108481+07	15U1O7U7-XPI	3	PV01	backend	\N
119	signing_request	3	verified	{"policy": "PAdES-mock", "isValid": true, "timestamp": "2025-09-17T13:41:08.280Z"}	2025-09-17 20:41:08.27925+07	15U1O7U7-XPI	3	PV01	backend	\N
120	signing_request	3	initiated	{"by": "PV01", "action": "claim", "prevSigner": "PV01"}	2025-09-17 20:54:02.58496+07	15U1O7U7-XPI	3	PV01	backend	\N
121	signing_request	3	initiated	{"by": "PV01", "action": "claim", "prevSigner": "PV01"}	2025-09-17 20:54:03.873414+07	15U1O7U7-XPI	3	PV01	backend	\N
122	signing_request	3	created	{"action": "document_ready", "nobooking": "20008-2025-000004"}	2025-09-17 20:54:03.883724+07	15U1O7U7-XPI	3	PV01	backend	\N
123	signing_request	3	verified	{"policy": "PAdES-mock", "isValid": true, "timestamp": "2025-09-17T13:54:04.055Z"}	2025-09-17 20:54:04.053972+07	15U1O7U7-XPI	3	PV01	backend	\N
124	signing_request	4	created	{"nobooking": "20008-2025-000005", "trackstatus": "Terverifikasi"}	2025-09-17 21:08:38.265955+07	J7MDZOXJ-5AD	4	P01	backend	\N
125	signing_request	4	initiated	{"by": "PV01", "action": "claim", "prevSigner": null}	2025-09-17 21:10:12.817777+07	J7MDZOXJ-5AD	4	PV01	backend	\N
126	signing_request	4	initiated	{"by": "PV01", "action": "claim", "prevSigner": "PV01"}	2025-09-17 21:10:36.051539+07	J7MDZOXJ-5AD	4	PV01	backend	\N
127	signing_request	4	initiated	{"by": "PV01", "action": "claim", "prevSigner": "PV01"}	2025-09-17 21:10:37.563866+07	J7MDZOXJ-5AD	4	PV01	backend	\N
128	signing_request	4	created	{"action": "document_ready", "nobooking": "20008-2025-000005"}	2025-09-17 21:10:37.579092+07	J7MDZOXJ-5AD	4	PV01	backend	\N
129	signing_request	4	verified	{"policy": "PAdES-mock", "isValid": true, "timestamp": "2025-09-17T14:10:37.731Z"}	2025-09-17 21:10:37.729519+07	J7MDZOXJ-5AD	4	PV01	backend	\N
130	signing_request	4	initiated	{"by": "PV01", "action": "claim", "prevSigner": "PV01"}	2025-09-17 21:21:02.439142+07	J7MDZOXJ-5AD	4	PV01	backend	\N
131	signing_request	4	initiated	{"by": "PV01", "action": "claim", "prevSigner": "PV01"}	2025-09-17 21:21:03.82407+07	J7MDZOXJ-5AD	4	PV01	backend	\N
132	signing_request	4	created	{"action": "document_ready", "nobooking": "20008-2025-000005"}	2025-09-17 21:21:03.839532+07	J7MDZOXJ-5AD	4	PV01	backend	\N
133	signing_request	4	verified	{"policy": "PAdES-mock", "isValid": true, "timestamp": "2025-09-17T14:21:04.005Z"}	2025-09-17 21:21:04.004856+07	J7MDZOXJ-5AD	4	PV01	backend	\N
134	signing_request	4	initiated	{"by": "PV01", "action": "claim", "prevSigner": "PV01"}	2025-09-17 21:29:42.493627+07	J7MDZOXJ-5AD	4	PV01	backend	\N
135	signing_request	4	initiated	{"by": "PV01", "action": "claim", "prevSigner": "PV01"}	2025-09-17 21:29:43.899483+07	J7MDZOXJ-5AD	4	PV01	backend	\N
136	signing_request	4	created	{"action": "document_ready", "nobooking": "20008-2025-000005"}	2025-09-17 21:29:43.907392+07	J7MDZOXJ-5AD	4	PV01	backend	\N
137	signing_request	4	verified	{"policy": "PAdES-mock", "isValid": true, "timestamp": "2025-09-17T14:29:44.087Z"}	2025-09-17 21:29:44.086506+07	J7MDZOXJ-5AD	4	PV01	backend	\N
138	signing_request	3	initiated	{"by": "PV01", "action": "claim", "prevSigner": "PV01"}	2025-09-17 21:29:55.183854+07	15U1O7U7-XPI	3	PV01	backend	\N
139	signing_request	3	initiated	{"by": "PV01", "action": "claim", "prevSigner": "PV01"}	2025-09-17 21:29:59.111503+07	15U1O7U7-XPI	3	PV01	backend	\N
140	signing_request	3	created	{"action": "document_ready", "nobooking": "20008-2025-000004"}	2025-09-17 21:29:59.125129+07	15U1O7U7-XPI	3	PV01	backend	\N
141	signing_request	3	verified	{"policy": "PAdES-mock", "isValid": true, "timestamp": "2025-09-17T14:29:59.210Z"}	2025-09-17 21:29:59.208677+07	15U1O7U7-XPI	3	PV01	backend	\N
142	signing_request	3	initiated	{"by": "PV01", "action": "claim", "prevSigner": "PV01"}	2025-09-17 22:05:22.432431+07	15U1O7U7-XPI	3	PV01	backend	\N
143	signing_request	4	initiated	{"by": "PV01", "action": "claim", "prevSigner": "PV01"}	2025-09-17 22:05:36.533913+07	J7MDZOXJ-5AD	4	PV01	backend	\N
144	signing_request	3	initiated	{"by": "PV01", "action": "claim", "prevSigner": "PV01"}	2025-09-17 22:05:38.987732+07	15U1O7U7-XPI	3	PV01	backend	\N
145	signing_request	3	initiated	{"by": "PV01", "action": "claim", "prevSigner": "PV01"}	2025-09-17 22:53:27.188624+07	15U1O7U7-XPI	3	PV01	backend	\N
146	signing_request	3	initiated	{"by": "PV01", "action": "claim", "prevSigner": "PV01"}	2025-09-17 22:53:28.264287+07	15U1O7U7-XPI	3	PV01	backend	\N
147	signing_request	3	created	{"action": "document_ready", "nobooking": "20008-2025-000004"}	2025-09-17 22:53:28.279002+07	15U1O7U7-XPI	3	PV01	backend	\N
148	signing_request	3	verified	{"policy": "PAdES-mock", "isValid": true, "timestamp": "2025-09-17T15:53:28.502Z"}	2025-09-17 22:53:28.500341+07	15U1O7U7-XPI	3	PV01	backend	\N
149	signing_request	3	initiated	{"by": "PV01", "action": "claim", "prevSigner": "PV01"}	2025-09-17 22:55:13.004457+07	15U1O7U7-XPI	3	PV01	backend	\N
150	signing_request	3	created	{"action": "document_ready", "nobooking": "20008-2025-000004"}	2025-09-17 22:55:18.775394+07	15U1O7U7-XPI	3	PV01	backend	\N
151	signing_request	3	verified	{"policy": "PAdES-mock", "isValid": true, "timestamp": "2025-09-17T15:55:19.584Z"}	2025-09-17 22:55:19.583352+07	15U1O7U7-XPI	3	PV01	backend	\N
152	signing_request	3	initiated	{"by": "PV01", "action": "claim", "prevSigner": "PV01"}	2025-09-17 22:56:24.258735+07	15U1O7U7-XPI	3	PV01	backend	\N
153	signing_request	3	initiated	{"by": "PV01", "action": "claim", "prevSigner": "PV01"}	2025-09-17 22:56:25.198673+07	15U1O7U7-XPI	3	PV01	backend	\N
154	signing_request	3	created	{"action": "document_ready", "nobooking": "20008-2025-000004"}	2025-09-17 22:56:25.210261+07	15U1O7U7-XPI	3	PV01	backend	\N
155	signing_request	3	verified	{"policy": "PAdES-mock", "isValid": true, "timestamp": "2025-09-17T15:56:25.372Z"}	2025-09-17 22:56:25.371266+07	15U1O7U7-XPI	3	PV01	backend	\N
156	signing_request	3	initiated	{"by": "PV01", "action": "claim", "prevSigner": "PV01"}	2025-09-17 23:00:48.051586+07	15U1O7U7-XPI	3	PV01	backend	\N
157	signing_request	3	initiated	{"by": "PV01", "action": "claim", "prevSigner": "PV01"}	2025-09-17 23:00:49.854458+07	15U1O7U7-XPI	3	PV01	backend	\N
158	signing_request	3	created	{"action": "document_ready", "nobooking": "20008-2025-000004"}	2025-09-17 23:00:49.867833+07	15U1O7U7-XPI	3	PV01	backend	\N
159	signing_request	3	verified	{"policy": "PAdES-mock", "isValid": true, "timestamp": "2025-09-17T16:00:50.034Z"}	2025-09-17 23:00:50.034301+07	15U1O7U7-XPI	3	PV01	backend	\N
160	signing_request	3	initiated	{"by": "PV01", "action": "claim", "prevSigner": "PV01"}	2025-09-17 23:06:36.823641+07	15U1O7U7-XPI	3	PV01	backend	\N
161	signing_request	3	initiated	{"by": "PV01", "action": "claim", "prevSigner": "PV01"}	2025-09-17 23:06:37.831123+07	15U1O7U7-XPI	3	PV01	backend	\N
162	signing_request	3	created	{"action": "document_ready", "nobooking": "20008-2025-000004"}	2025-09-17 23:06:37.845803+07	15U1O7U7-XPI	3	PV01	backend	\N
163	signing_request	3	verified	{"policy": "PAdES-mock", "isValid": true, "timestamp": "2025-09-17T16:06:38.002Z"}	2025-09-17 23:06:38.001271+07	15U1O7U7-XPI	3	PV01	backend	\N
164	signing_request	3	initiated	{"by": "PV01", "action": "claim", "prevSigner": "PV01"}	2025-09-17 23:26:16.409988+07	15U1O7U7-XPI	3	PV01	backend	\N
165	signing_request	3	initiated	{"by": "PV01", "action": "claim", "prevSigner": "PV01"}	2025-09-17 23:39:39.736215+07	15U1O7U7-XPI	3	PV01	backend	\N
166	signing_request	3	initiated	{"by": "PV01", "action": "claim", "prevSigner": "PV01"}	2025-09-17 23:39:41.023236+07	15U1O7U7-XPI	3	PV01	backend	\N
167	signing_request	3	created	{"action": "document_ready", "nobooking": "20008-2025-000004"}	2025-09-17 23:39:41.037875+07	15U1O7U7-XPI	3	PV01	backend	\N
168	signing_request	3	verified	{"policy": "PAdES-mock", "isValid": true, "timestamp": "2025-09-17T16:39:41.231Z"}	2025-09-17 23:39:41.231238+07	15U1O7U7-XPI	3	PV01	backend	\N
169	signing_request	4	initiated	{"by": "PV01", "action": "claim", "prevSigner": "PV01"}	2025-09-17 23:48:00.399879+07	J7MDZOXJ-5AD	4	PV01	backend	\N
170	signing_request	4	initiated	{"by": "PV01", "action": "claim", "prevSigner": "PV01"}	2025-09-17 23:50:01.543511+07	J7MDZOXJ-5AD	4	PV01	backend	\N
171	signing_request	3	initiated	{"by": "PV01", "action": "claim", "prevSigner": "PV01"}	2025-09-17 23:50:03.573539+07	15U1O7U7-XPI	3	PV01	backend	\N
172	signing_request	3	initiated	{"by": "PV01", "action": "claim", "prevSigner": "PV01"}	2025-09-17 23:55:36.62225+07	15U1O7U7-XPI	3	PV01	backend	\N
173	signing_request	4	initiated	{"by": "PV01", "action": "claim", "prevSigner": "PV01"}	2025-09-17 23:55:38.84193+07	J7MDZOXJ-5AD	4	PV01	backend	\N
174	signing_request	2	initiated	{"by": "PV01", "action": "claim", "prevSigner": "PV01"}	2025-09-18 01:07:18.6477+07	JRXG60R1-K3J	2	PV01	backend	\N
175	signing_request	2	initiated	{"by": "PV01", "action": "claim", "prevSigner": "PV01"}	2025-09-18 01:07:22.272096+07	JRXG60R1-K3J	2	PV01	backend	\N
176	signing_request	2	created	{"action": "document_ready", "nobooking": "20008-2025-000003"}	2025-09-18 01:07:22.286392+07	JRXG60R1-K3J	2	PV01	backend	\N
177	signing_request	2	verified	{"policy": "PAdES-mock", "isValid": true, "timestamp": "2025-09-17T18:07:22.489Z"}	2025-09-18 01:07:22.487613+07	JRXG60R1-K3J	2	PV01	backend	\N
178	signing_request	2	initiated	{"by": "PV01", "action": "claim", "prevSigner": "PV01"}	2025-09-18 01:07:29.9623+07	JRXG60R1-K3J	2	PV01	backend	\N
179	signing_request	2	created	{"action": "document_ready", "nobooking": "20008-2025-000003"}	2025-09-18 01:07:48.423157+07	JRXG60R1-K3J	2	PV01	backend	\N
180	signing_request	4	initiated	{"by": "PV01", "action": "claim", "prevSigner": "PV01"}	2025-09-18 01:55:02.035285+07	J7MDZOXJ-5AD	4	PV01	backend	\N
181	signing_request	4	initiated	{"by": "PV01", "action": "claim", "prevSigner": "PV01"}	2025-09-18 01:55:04.927229+07	J7MDZOXJ-5AD	4	PV01	backend	\N
182	signing_request	4	initiated	{"by": "PV01", "action": "claim", "prevSigner": "PV01"}	2025-09-18 01:55:05.857886+07	J7MDZOXJ-5AD	4	PV01	backend	\N
183	signing_request	4	initiated	{"by": "PV01", "action": "claim", "prevSigner": "PV01"}	2025-09-18 01:55:06.881449+07	J7MDZOXJ-5AD	4	PV01	backend	\N
184	signing_request	4	initiated	{"by": "PV01", "action": "claim", "prevSigner": "PV01"}	2025-09-18 01:55:07.551991+07	J7MDZOXJ-5AD	4	PV01	backend	\N
185	signing_request	4	initiated	{"by": "PV01", "action": "claim", "prevSigner": "PV01"}	2025-09-18 01:55:34.415476+07	J7MDZOXJ-5AD	4	PV01	backend	\N
186	signing_request	2	initiated	{"by": "PV01", "action": "claim", "prevSigner": "PV01"}	2025-09-18 01:55:38.860343+07	JRXG60R1-K3J	2	PV01	backend	\N
187	signing_request	2	initiated	{"by": "PV01", "action": "claim", "prevSigner": "PV01"}	2025-09-18 01:55:42.549816+07	JRXG60R1-K3J	2	PV01	backend	\N
188	signing_request	2	initiated	{"by": "PV01", "action": "claim", "prevSigner": "PV01"}	2025-09-18 01:55:43.248207+07	JRXG60R1-K3J	2	PV01	backend	\N
189	signing_request	4	initiated	{"by": "PV01", "action": "claim", "prevSigner": "PV01"}	2025-09-18 01:56:06.164846+07	J7MDZOXJ-5AD	4	PV01	backend	\N
190	signing_request	4	initiated	{"by": "PV01", "action": "claim", "prevSigner": "PV01"}	2025-09-18 01:56:11.439478+07	J7MDZOXJ-5AD	4	PV01	backend	\N
191	signing_request	4	initiated	{"by": "PV01", "action": "claim", "prevSigner": "PV01"}	2025-09-18 01:56:33.385762+07	J7MDZOXJ-5AD	4	PV01	backend	\N
192	signing_request	4	initiated	{"by": "PV01", "action": "claim", "prevSigner": "PV01"}	2025-09-18 02:02:18.473996+07	J7MDZOXJ-5AD	4	PV01	backend	\N
193	signing_request	4	initiated	{"by": "PV01", "action": "claim", "prevSigner": "PV01"}	2025-09-18 02:06:32.782295+07	J7MDZOXJ-5AD	4	PV01	backend	\N
194	signing_request	4	initiated	{"by": "PV01", "action": "claim", "prevSigner": "PV01"}	2025-09-18 02:11:07.98717+07	J7MDZOXJ-5AD	4	PV01	backend	\N
195	signing_request	4	initiated	{"by": "PV01", "action": "claim", "prevSigner": "PV01"}	2025-09-18 02:24:21.502914+07	J7MDZOXJ-5AD	4	PV01	backend	\N
196	signing_request	4	initiated	{"by": "PV01", "action": "claim", "prevSigner": "PV01"}	2025-09-18 02:29:30.605751+07	J7MDZOXJ-5AD	4	PV01	backend	\N
197	signing_request	4	initiated	{"by": "PV01", "action": "claim", "prevSigner": "PV01"}	2025-09-18 02:30:23.510906+07	J7MDZOXJ-5AD	4	PV01	backend	\N
198	signing_request	3	initiated	{"by": "PV01", "action": "claim", "prevSigner": "PV01"}	2025-09-18 17:34:59.865475+07	15U1O7U7-XPI	3	PV01	backend	\N
199	signing_request	4	initiated	{"by": "PV01", "action": "claim", "prevSigner": "PV01"}	2025-09-18 17:35:00.86465+07	J7MDZOXJ-5AD	4	PV01	backend	\N
200	signing_request	5	created	{"nobooking": "20008-2025-000006", "trackstatus": "Terverifikasi"}	2025-09-18 20:54:11.171826+07	FSADQ30O-O5N	5	P01	backend	\N
201	signing_request	5	initiated	{"by": "PV01", "action": "claim", "prevSigner": null}	2025-09-18 20:54:36.74978+07	FSADQ30O-O5N	5	PV01	backend	\N
202	signing_request	5	initiated	{"by": "PV01", "action": "claim", "prevSigner": "PV01"}	2025-09-18 23:34:50.043923+07	FSADQ30O-O5N	5	PV01	backend	\N
203	signing_request	5	created	{"action": "document_ready", "nobooking": "20008-2025-000006"}	2025-09-18 23:34:52.091695+07	FSADQ30O-O5N	5	PV01	backend	\N
204	signing_request	5	created	{"action": "document_ready", "nobooking": "20008-2025-000006"}	2025-09-18 23:35:01.429962+07	FSADQ30O-O5N	5	PV01	backend	\N
205	signing_request	2	initiated	{"by": "PV01", "action": "claim", "prevSigner": "PV01"}	2025-09-18 23:36:00.527437+07	JRXG60R1-K3J	2	PV01	backend	\N
206	signing_request	1	initiated	{"by": "PV01", "action": "claim", "prevSigner": "PV01"}	2025-09-18 23:36:01.61821+07	ON62SF2X-72C	1	PV01	backend	\N
207	signing_request	1	created	{"action": "document_ready", "nobooking": "20008-2025-000002"}	2025-09-18 23:36:02.616948+07	ON62SF2X-72C	1	PV01	backend	\N
208	signing_request	3	initiated	{"by": "PV01", "action": "claim", "prevSigner": "PV01"}	2025-09-18 23:37:03.769462+07	15U1O7U7-XPI	3	PV01	backend	\N
209	signing_request	6	created	{"nobooking": "20008-2025-000011", "trackstatus": "Terverifikasi"}	2025-09-21 18:50:44.849783+07	6EEWC4WH-URT	6	P01	backend	\N
210	signing_request	7	created	{"nobooking": "20008-2025-000012", "trackstatus": "Terverifikasi"}	2025-09-21 21:32:21.062846+07	TEVP4058-I8M	7	P01	backend	\N
211	signing_request	7	initiated	{"by": "PV01", "action": "claim", "prevSigner": null}	2025-09-21 21:33:01.828842+07	TEVP4058-I8M	7	PV01	backend	\N
212	signing_request	7	initiated	{"by": "PV01", "action": "claim", "prevSigner": "PV01"}	2025-09-21 21:33:11.552337+07	TEVP4058-I8M	7	PV01	backend	\N
213	signing_request	7	created	{"action": "document_ready", "nobooking": "20008-2025-000012"}	2025-09-21 21:33:11.569463+07	TEVP4058-I8M	7	PV01	backend	\N
214	signing_request	7	verified	{"policy": "PAdES-mock", "isValid": true, "timestamp": "2025-09-21T14:33:11.803Z"}	2025-09-21 21:33:11.799283+07	TEVP4058-I8M	7	PV01	backend	\N
215	signing_request	7	initiated	{"by": "PV01", "action": "claim", "prevSigner": "PV01"}	2025-09-21 21:33:19.517166+07	TEVP4058-I8M	7	PV01	backend	\N
216	signing_request	7	initiated	{"by": "PV01", "action": "claim", "prevSigner": "PV01"}	2025-09-21 21:33:25.668817+07	TEVP4058-I8M	7	PV01	backend	\N
217	signing_request	8	created	{"nobooking": "20008-2025-000013", "trackstatus": "Terverifikasi"}	2025-09-22 00:06:05.191625+07	W9SIH8KE-A4A	8	P01	backend	\N
218	signing_request	8	initiated	{"by": "PV01", "action": "claim", "prevSigner": null}	2025-09-22 00:06:39.950747+07	W9SIH8KE-A4A	8	PV01	backend	\N
219	signing_request	8	created	{"action": "document_ready", "nobooking": "20008-2025-000013"}	2025-09-22 00:07:04.548871+07	W9SIH8KE-A4A	8	PV01	backend	\N
220	signing_request	8	initiated	{"by": "PV01", "action": "claim", "prevSigner": "PV01"}	2025-09-22 00:08:52.876707+07	W9SIH8KE-A4A	8	PV01	backend	\N
221	signing_request	8	initiated	{"by": "PV01", "action": "claim", "prevSigner": "PV01"}	2025-09-22 00:21:18.67459+07	W9SIH8KE-A4A	8	PV01	backend	\N
222	signing_request	8	initiated	{"by": "PV01", "action": "claim", "prevSigner": "PV01"}	2025-09-22 00:24:13.383061+07	W9SIH8KE-A4A	8	PV01	backend	\N
223	signing_request	8	initiated	{"by": "PV01", "action": "claim", "prevSigner": "PV01"}	2025-09-22 00:32:48.108391+07	W9SIH8KE-A4A	8	PV01	backend	\N
224	signing_request	8	created	{"action": "document_ready", "nobooking": "20008-2025-000013"}	2025-09-22 00:32:56.599809+07	W9SIH8KE-A4A	8	PV01	backend	\N
225	signing_request	8	initiated	{"by": "PV01", "action": "claim", "prevSigner": "PV01"}	2025-09-22 00:47:32.606528+07	W9SIH8KE-A4A	8	PV01	backend	\N
226	signing_request	8	initiated	{"by": "PV01", "action": "claim", "prevSigner": "PV01"}	2025-09-22 01:16:18.243208+07	W9SIH8KE-A4A	8	PV01	backend	\N
227	signing_request	8	initiated	{"by": "PV01", "action": "claim", "prevSigner": "PV01"}	2025-09-22 01:16:25.363457+07	W9SIH8KE-A4A	8	PV01	backend	\N
228	signing_request	8	created	{"action": "document_ready", "nobooking": "20008-2025-000013"}	2025-09-22 01:16:25.386679+07	W9SIH8KE-A4A	8	PV01	backend	\N
229	signing_request	8	verified	{"policy": "PAdES-mock", "isValid": true, "timestamp": "2025-09-21T18:16:25.800Z"}	2025-09-22 01:16:25.794071+07	W9SIH8KE-A4A	8	PV01	backend	\N
230	signing_request	8	initiated	{"by": "PV01", "action": "claim", "prevSigner": "PV01"}	2025-09-22 01:16:27.465522+07	W9SIH8KE-A4A	8	PV01	backend	\N
231	signing_request	8	initiated	{"by": "PV01", "action": "claim", "prevSigner": "PV01"}	2025-09-22 01:16:30.368924+07	W9SIH8KE-A4A	8	PV01	backend	\N
232	signing_request	8	initiated	{"by": "PV01", "action": "claim", "prevSigner": "PV01"}	2025-09-22 01:16:33.551346+07	W9SIH8KE-A4A	8	PV01	backend	\N
233	signing_request	8	initiated	{"by": "PV01", "action": "claim", "prevSigner": "PV01"}	2025-09-22 01:16:35.72463+07	W9SIH8KE-A4A	8	PV01	backend	\N
234	signing_request	8	created	{"action": "document_ready", "nobooking": "20008-2025-000013"}	2025-09-22 01:16:35.746588+07	W9SIH8KE-A4A	8	PV01	backend	\N
235	signing_request	8	verified	{"policy": "PAdES-mock", "isValid": true, "timestamp": "2025-09-21T18:16:35.916Z"}	2025-09-22 01:16:35.916098+07	W9SIH8KE-A4A	8	PV01	backend	\N
236	signing_request	8	initiated	{"by": "PV01", "action": "claim", "prevSigner": "PV01"}	2025-09-22 01:16:38.708814+07	W9SIH8KE-A4A	8	PV01	backend	\N
237	signing_request	8	initiated	{"by": "PV01", "action": "claim", "prevSigner": "PV01"}	2025-09-22 01:16:41.526464+07	W9SIH8KE-A4A	8	PV01	backend	\N
238	signing_request	8	created	{"action": "document_ready", "nobooking": "20008-2025-000013"}	2025-09-22 01:16:41.548981+07	W9SIH8KE-A4A	8	PV01	backend	\N
239	signing_request	8	verified	{"policy": "PAdES-mock", "isValid": true, "timestamp": "2025-09-21T18:16:41.725Z"}	2025-09-22 01:16:41.724603+07	W9SIH8KE-A4A	8	PV01	backend	\N
240	signing_request	8	initiated	{"by": "PV01", "action": "claim", "prevSigner": "PV01"}	2025-09-22 01:16:46.994131+07	W9SIH8KE-A4A	8	PV01	backend	\N
241	signing_request	8	initiated	{"by": "PV01", "action": "claim", "prevSigner": "PV01"}	2025-09-22 01:20:49.37134+07	W9SIH8KE-A4A	8	PV01	backend	\N
242	signing_request	8	initiated	{"by": "PV01", "action": "claim", "prevSigner": "PV01"}	2025-09-22 01:22:28.325948+07	W9SIH8KE-A4A	8	PV01	backend	\N
243	signing_request	8	initiated	{"by": "PV01", "action": "claim", "prevSigner": "PV01"}	2025-09-22 01:35:15.504569+07	W9SIH8KE-A4A	8	PV01	backend	\N
244	signing_request	8	initiated	{"by": "PV01", "action": "claim", "prevSigner": "PV01"}	2025-09-22 01:36:39.911403+07	W9SIH8KE-A4A	8	PV01	backend	\N
245	signing_request	8	initiated	{"by": "PV01", "action": "claim", "prevSigner": "PV01"}	2025-09-22 01:39:08.794733+07	W9SIH8KE-A4A	8	PV01	backend	\N
246	signing_request	8	initiated	{"by": "PV01", "action": "claim", "prevSigner": "PV01"}	2025-09-22 01:48:26.591362+07	W9SIH8KE-A4A	8	PV01	backend	\N
247	signing_request	8	initiated	{"by": "PV01", "action": "claim", "prevSigner": "PV01"}	2025-09-22 01:48:36.467389+07	W9SIH8KE-A4A	8	PV01	backend	\N
248	signing_request	8	created	{"action": "document_ready", "nobooking": "20008-2025-000013"}	2025-09-22 01:48:36.484917+07	W9SIH8KE-A4A	8	PV01	backend	\N
249	signing_request	8	verified	{"policy": "PAdES-mock", "isValid": true, "timestamp": "2025-09-21T18:48:36.934Z"}	2025-09-22 01:48:36.932512+07	W9SIH8KE-A4A	8	PV01	backend	\N
250	signing_request	8	initiated	{"by": "PV01", "action": "claim", "prevSigner": "PV01"}	2025-09-22 01:48:38.863366+07	W9SIH8KE-A4A	8	PV01	backend	\N
251	signing_request	8	created	{"action": "document_ready", "nobooking": "20008-2025-000013"}	2025-09-22 01:48:40.556224+07	W9SIH8KE-A4A	8	PV01	backend	\N
252	signing_request	8	initiated	{"by": "PV01", "action": "claim", "prevSigner": "PV01"}	2025-09-22 01:48:46.151953+07	W9SIH8KE-A4A	8	PV01	backend	\N
253	signing_request	8	initiated	{"by": "PV01", "action": "claim", "prevSigner": "PV01"}	2025-09-22 01:51:32.240059+07	W9SIH8KE-A4A	8	PV01	backend	\N
254	signing_request	8	initiated	{"by": "PV01", "action": "claim", "prevSigner": "PV01"}	2025-09-22 01:54:18.028459+07	W9SIH8KE-A4A	8	PV01	backend	\N
255	signing_request	8	created	{"action": "document_ready", "nobooking": "20008-2025-000013"}	2025-09-22 01:54:20.203921+07	W9SIH8KE-A4A	8	PV01	backend	\N
\.


--
-- Data for Name: pv_7_audit_log; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.pv_7_audit_log (id, no_validasi, action, acted_by, reason, created_at) FROM stdin;
1	15U1O7U7-XPI	APPROVE	PV01	\N	2025-09-17 23:06:40.302984
2	15U1O7U7-XPI	APPROVE	PV01	\N	2025-09-17 23:39:43.613756
3	JRXG60R1-K3J	APPROVE	PV01	\N	2025-09-18 01:07:24.90276
4	TEVP4058-I8M	APPROVE	PV01	\N	2025-09-21 21:33:16.140582
5	W9SIH8KE-A4A	APPROVE	PV01	\N	2025-09-22 01:16:45.014485
\.


--
-- Data for Name: pv_local_certs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.pv_local_certs (id, userid, serial_number, subject_cn, subject_email, subject_org, public_key_pem, algorithm, fingerprint_sha256, valid_from, valid_to, status, revoked_at, created_at, passphrase_alg, passphrase_salt, passphrase_hash, passphrase_iters) FROM stdin;
1	PV01	158D386D169FB2FF	Asal	Asal	Asal	-----BEGIN PUBLIC KEY-----\nMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEWxS4oD/49yfCjdd5paETolt0eV/A\nLr0BqTzqRz0+c/b+5fAjKWo5ihG9gvxlYn9WBPkjlkYOBitHONoDivEkBA==\n-----END PUBLIC KEY-----\n	ECDSA-P256	9FF59453B10ABCAE4A689009C1824A7580DAA7D8438E6DD80642AD338F7C3CC3	2025-09-15 03:36:27.101715+07	2026-09-15 03:36:27.101715+07	revoked	2025-09-15 03:47:03.56286+07	2025-09-15 03:36:27.101715+07	\N	\N	\N	\N
2	PV01	6801794D83A8C95D	Asal	Asal	Asal	-----BEGIN PUBLIC KEY-----\nMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEvucRZTpXHCggH+ssYSouhX4w7qon\nF8owE8gBgBRvsp/HuWbNaAgzWu1af7jEKuDVBR01wGEVUolHW50SWVykvg==\n-----END PUBLIC KEY-----\n	ECDSA-P256	E5BD1CB52FE87F777926E9DC559B19BD43EF1F07E8EF19071E7C1B2B8F81B832	2025-09-15 03:43:40.351605+07	2026-09-15 03:43:40.351605+07	revoked	2025-09-15 15:07:37.691105+07	2025-09-15 03:43:40.351605+07	scrypt	5twgY4N+7lgz92rDKlYiZQ==	FglC/xxSYNcig27+RAWVdGFM6d1OwnX5+/gBt8XMVrc=	16384
3	PV01	319BA2F7EF76331A	Sertif baru	farras	Organ	-----BEGIN PUBLIC KEY-----\nMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEkPtu9dwf8bSPAObD5KqkpUIhxXeD\nyy6VTx/iEZe3ENZWS1oCgzEpW22UO02qQusouywLOxbCsPDRQfKH0ElqLA==\n-----END PUBLIC KEY-----\n	ECDSA-P256	B0524C8FEACD7B4DCD5AC617731B3FD72C4DEE56792BAAECBE215E8DB4AA70BD	2025-09-15 15:07:37.691105+07	2026-09-15 15:07:37.691105+07	revoked	2025-09-17 02:33:52.731986+07	2025-09-15 15:07:37.691105+07	scrypt	0WVp2wDDLVHEXyMsCxpeYg==	tvDjs/DAG1soQMBXZl2DkHbdAIhrTqdV9fplyMbSlMk=	16384
4	PV01	A18E6478085F7806	Kepala Bidang Masyarakat	farras_syauqi22803@gmail.com	organisasi	-----BEGIN PUBLIC KEY-----\nMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAErCVhRmdH5ekIlNZpatE68dF3qJqb\nlb5VSsXTYjigiveil9qTyWiHfpx2jGmBq7idHsNB96yXwolMx+hEemKx3A==\n-----END PUBLIC KEY-----\n	ECDSA-P256	0F1026DC4BF425D0B51C8B477B5022DEB7CFC21BEB8588525557D879C85965F0	2025-09-17 02:33:52.731986+07	2026-09-17 02:33:52.731986+07	active	\N	2025-09-17 02:33:52.731986+07	scrypt	8b4Pg0OgLoMsFwgg5M5U/A==	p8eS3ZtJ6PN/TbT0MP5K5mRCBPnlAxHXe8y/16SAbL4=	16384
\.


--
-- Data for Name: sys_notifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sys_notifications (id, recipient_id, recipient_divisi, title, message, booking_id, is_read, created_at, expires_at) FROM stdin;
3	17	Administrator	Booking Baru: 20002-2025-000007	PPAT: Farras Syauqi, Jenis: Badan Usaha, WP: Syauqi, No. PPATK: 20002	186	f	2025-09-07 19:41:45.221921	2025-09-07 19:42:15.221921
4	1	Administrator	Booking Baru: 20002-2025-000007	PPAT: Farras Syauqi, Jenis: Badan Usaha, WP: Syauqi, No. PPATK: 20002	186	f	2025-09-07 19:41:45.232708	2025-09-07 19:42:15.232708
6	42	LTB	Booking Baru: 20002-2025-000007	PPAT: Farras Syauqi (20002) perlu verifikasi awal - WP: Syauqi	186	f	2025-09-07 19:41:45.236057	2025-09-07 19:42:15.236057
9	52	Peneliti	Booking Siap Dicek: 20002-2025-000007	Booking 20002-2025-000007 dari Farras Syauqi sudah difilter LTB dan siap untuk pengecekan menyeluruh	186	f	2025-09-07 23:08:14.065484	2025-09-07 23:08:44.065484
10	53	Peneliti	Booking Siap Dicek: 20002-2025-000007	Booking 20002-2025-000007 dari Farras Syauqi sudah difilter LTB dan siap untuk pengecekan menyeluruh	186	f	2025-09-07 23:08:14.068156	2025-09-07 23:08:44.068156
11	17	Administrator	Booking ke Peneliti: 20002-2025-000007	Booking 20002-2025-000007 telah dikirim LTB ke Peneliti untuk pengecekan menyeluruh	186	f	2025-09-07 23:08:14.070581	2025-09-07 23:08:44.070581
12	1	Administrator	Booking ke Peneliti: 20002-2025-000007	Booking 20002-2025-000007 telah dikirim LTB ke Peneliti untuk pengecekan menyeluruh	186	f	2025-09-07 23:08:14.072093	2025-09-07 23:08:44.072093
14	17	Administrator	Booking Baru: 20008-2025-000001	PPAT: Rasya Indehouse, Jenis: Badan Usaha, WP: Indor, No. PPATK: 20008	187	f	2025-09-11 20:42:36.936865	2025-09-11 20:43:06.936865
15	1	Administrator	Booking Baru: 20008-2025-000001	PPAT: Rasya Indehouse, Jenis: Badan Usaha, WP: Indor, No. PPATK: 20008	187	f	2025-09-11 20:42:36.943384	2025-09-11 20:43:06.943384
17	42	LTB	Booking Baru: 20008-2025-000001	PPAT: Rasya Indehouse (20008) perlu verifikasi awal - WP: Indor	187	f	2025-09-11 20:42:36.947054	2025-09-11 20:43:06.947054
20	52	Peneliti	Booking Siap Dicek: 20008-2025-000001	Booking 20008-2025-000001 dari Rasya Indehouse sudah difilter LTB dan siap untuk pengecekan menyeluruh	187	f	2025-09-11 20:59:21.853107	2025-09-11 20:59:51.853107
21	53	Peneliti	Booking Siap Dicek: 20008-2025-000001	Booking 20008-2025-000001 dari Rasya Indehouse sudah difilter LTB dan siap untuk pengecekan menyeluruh	187	f	2025-09-11 20:59:21.854	2025-09-11 20:59:51.854
22	17	Administrator	Booking ke Peneliti: 20008-2025-000001	Booking 20008-2025-000001 telah dikirim LTB ke Peneliti untuk pengecekan menyeluruh	187	f	2025-09-11 20:59:21.855152	2025-09-11 20:59:51.855152
23	1	Administrator	Booking ke Peneliti: 20008-2025-000001	Booking 20008-2025-000001 telah dikirim LTB ke Peneliti untuk pengecekan menyeluruh	187	f	2025-09-11 20:59:21.855951	2025-09-11 20:59:51.855951
25	17	Administrator	Booking Baru: 20008-2025-000002	PPAT: Rasya Indehouse, Jenis: Badan Usaha, WP: Farras Syauqi, No. PPATK: 20008	188	f	2025-09-13 17:05:43.972333	2025-09-13 17:06:13.972333
26	1	Administrator	Booking Baru: 20008-2025-000002	PPAT: Rasya Indehouse, Jenis: Badan Usaha, WP: Farras Syauqi, No. PPATK: 20008	188	f	2025-09-13 17:05:43.982488	2025-09-13 17:06:13.982488
28	42	LTB	Booking Baru: 20008-2025-000002	PPAT: Rasya Indehouse (20008) perlu verifikasi awal - WP: Farras Syauqi	188	f	2025-09-13 17:05:43.986418	2025-09-13 17:06:13.986418
30	52	Peneliti	Booking Siap Dicek: 20008-2025-000002	Booking 20008-2025-000002 dari Rasya Indehouse sudah difilter LTB dan siap untuk pengecekan menyeluruh	188	f	2025-09-13 17:09:46.129877	2025-09-13 17:10:16.129877
32	53	Peneliti	Booking Siap Dicek: 20008-2025-000002	Booking 20008-2025-000002 dari Rasya Indehouse sudah difilter LTB dan siap untuk pengecekan menyeluruh	188	f	2025-09-13 17:09:46.134203	2025-09-13 17:10:16.134203
33	17	Administrator	Booking ke Peneliti: 20008-2025-000002	Booking 20008-2025-000002 telah dikirim LTB ke Peneliti untuk pengecekan menyeluruh	188	f	2025-09-13 17:09:46.136674	2025-09-13 17:10:16.136674
34	1	Administrator	Booking ke Peneliti: 20008-2025-000002	Booking 20008-2025-000002 telah dikirim LTB ke Peneliti untuk pengecekan menyeluruh	188	f	2025-09-13 17:09:46.137709	2025-09-13 17:10:16.137709
36	17	Administrator	Booking Baru: 20008-2025-000003	PPAT: Rasya Indehouse, Jenis: Badan Usaha, WP: Farras Syau, No. PPATK: 20008	189	f	2025-09-17 06:48:14.960697	2025-09-17 06:48:44.960697
37	1	Administrator	Booking Baru: 20008-2025-000003	PPAT: Rasya Indehouse, Jenis: Badan Usaha, WP: Farras Syau, No. PPATK: 20008	189	f	2025-09-17 06:48:14.9715	2025-09-17 06:48:44.9715
39	42	LTB	Booking Baru: 20008-2025-000003	PPAT: Rasya Indehouse (20008) perlu verifikasi awal - WP: Farras Syau	189	f	2025-09-17 06:48:14.973743	2025-09-17 06:48:44.973743
42	52	Peneliti	Booking Siap Dicek: 20008-2025-000003	Booking 20008-2025-000003 dari Rasya Indehouse sudah difilter LTB dan siap untuk pengecekan menyeluruh	189	f	2025-09-17 06:48:39.265101	2025-09-17 06:49:09.265101
43	53	Peneliti	Booking Siap Dicek: 20008-2025-000003	Booking 20008-2025-000003 dari Rasya Indehouse sudah difilter LTB dan siap untuk pengecekan menyeluruh	189	f	2025-09-17 06:48:39.266781	2025-09-17 06:49:09.266781
44	17	Administrator	Booking ke Peneliti: 20008-2025-000003	Booking 20008-2025-000003 telah dikirim LTB ke Peneliti untuk pengecekan menyeluruh	189	f	2025-09-17 06:48:39.268524	2025-09-17 06:49:09.268524
19	51	Peneliti	Booking Siap Dicek: 20008-2025-000001	Booking 20008-2025-000001 dari Rasya Indehouse sudah difilter LTB dan siap untuk pengecekan menyeluruh	187	t	2025-09-11 20:59:21.84656	2025-09-11 20:59:51.84656
35	2	Administrator	Booking ke Peneliti: 20008-2025-000002	Booking 20008-2025-000002 telah dikirim LTB ke Peneliti untuk pengecekan menyeluruh	188	t	2025-09-13 17:09:46.138765	2025-09-13 17:10:16.138765
40	43	LTB	Booking Baru: 20008-2025-000003	PPAT: Rasya Indehouse (20008) perlu verifikasi awal - WP: Farras Syau	189	t	2025-09-17 06:48:14.974494	2025-09-17 06:48:44.974494
41	51	Peneliti	Booking Siap Dicek: 20008-2025-000003	Booking 20008-2025-000003 dari Rasya Indehouse sudah difilter LTB dan siap untuk pengecekan menyeluruh	189	t	2025-09-17 06:48:39.262089	2025-09-17 06:49:09.262089
27	2	Administrator	Booking Baru: 20008-2025-000002	PPAT: Rasya Indehouse, Jenis: Badan Usaha, WP: Farras Syauqi, No. PPATK: 20008	188	t	2025-09-13 17:05:43.984488	2025-09-13 17:06:13.984488
24	2	Administrator	Booking ke Peneliti: 20008-2025-000001	Booking 20008-2025-000001 telah dikirim LTB ke Peneliti untuk pengecekan menyeluruh	187	t	2025-09-11 20:59:21.856822	2025-09-11 20:59:51.856822
16	2	Administrator	Booking Baru: 20008-2025-000001	PPAT: Rasya Indehouse, Jenis: Badan Usaha, WP: Indor, No. PPATK: 20008	187	t	2025-09-11 20:42:36.94457	2025-09-11 20:43:06.94457
5	2	Administrator	Booking Baru: 20002-2025-000007	PPAT: Farras Syauqi, Jenis: Badan Usaha, WP: Syauqi, No. PPATK: 20002	186	t	2025-09-07 19:41:45.234063	2025-09-07 19:42:15.234063
29	43	LTB	Booking Baru: 20008-2025-000002	PPAT: Rasya Indehouse (20008) perlu verifikasi awal - WP: Farras Syauqi	188	t	2025-09-13 17:05:43.9873	2025-09-13 17:06:13.9873
18	43	LTB	Booking Baru: 20008-2025-000001	PPAT: Rasya Indehouse (20008) perlu verifikasi awal - WP: Indor	187	t	2025-09-11 20:42:36.948503	2025-09-11 20:43:06.948503
7	43	LTB	Booking Baru: 20002-2025-000007	PPAT: Farras Syauqi (20002) perlu verifikasi awal - WP: Syauqi	186	t	2025-09-07 19:41:45.237525	2025-09-07 19:42:15.237525
8	51	Peneliti	Booking Siap Dicek: 20002-2025-000007	Booking 20002-2025-000007 dari Farras Syauqi sudah difilter LTB dan siap untuk pengecekan menyeluruh	186	t	2025-09-07 23:08:14.052034	2025-09-07 23:08:44.052034
45	1	Administrator	Booking ke Peneliti: 20008-2025-000003	Booking 20008-2025-000003 telah dikirim LTB ke Peneliti untuk pengecekan menyeluruh	189	f	2025-09-17 06:48:39.269462	2025-09-17 06:49:09.269462
47	17	Administrator	Booking Baru: 20008-2025-000005	PPAT: Rasya Indehouse, Jenis: Badan Usaha, WP: KETERANGAN, No. PPATK: 20008	191	f	2025-09-17 19:53:41.090423	2025-09-17 19:54:11.090423
48	1	Administrator	Booking Baru: 20008-2025-000005	PPAT: Rasya Indehouse, Jenis: Badan Usaha, WP: KETERANGAN, No. PPATK: 20008	191	f	2025-09-17 19:53:41.096157	2025-09-17 19:54:11.096157
50	42	LTB	Booking Baru: 20008-2025-000005	PPAT: Rasya Indehouse (20008) perlu verifikasi awal - WP: KETERANGAN	191	f	2025-09-17 19:53:41.101031	2025-09-17 19:54:11.101031
52	17	Administrator	Booking Baru: 20008-2025-000004	PPAT: Rasya Indehouse, Jenis: Badan Usaha, WP: Mayendar, No. PPATK: 20008	190	f	2025-09-17 19:53:45.901014	2025-09-17 19:54:15.901014
53	1	Administrator	Booking Baru: 20008-2025-000004	PPAT: Rasya Indehouse, Jenis: Badan Usaha, WP: Mayendar, No. PPATK: 20008	190	f	2025-09-17 19:53:45.902285	2025-09-17 19:54:15.902285
55	42	LTB	Booking Baru: 20008-2025-000004	PPAT: Rasya Indehouse (20008) perlu verifikasi awal - WP: Mayendar	190	f	2025-09-17 19:53:45.90484	2025-09-17 19:54:15.90484
58	52	Peneliti	Booking Siap Dicek: 20008-2025-000004	Booking 20008-2025-000004 dari Rasya Indehouse sudah difilter LTB dan siap untuk pengecekan menyeluruh	190	f	2025-09-17 19:54:18.996044	2025-09-17 19:54:48.996044
59	53	Peneliti	Booking Siap Dicek: 20008-2025-000004	Booking 20008-2025-000004 dari Rasya Indehouse sudah difilter LTB dan siap untuk pengecekan menyeluruh	190	f	2025-09-17 19:54:18.997011	2025-09-17 19:54:48.997011
60	17	Administrator	Booking ke Peneliti: 20008-2025-000004	Booking 20008-2025-000004 telah dikirim LTB ke Peneliti untuk pengecekan menyeluruh	190	f	2025-09-17 19:54:18.998248	2025-09-17 19:54:48.998248
61	1	Administrator	Booking ke Peneliti: 20008-2025-000004	Booking 20008-2025-000004 telah dikirim LTB ke Peneliti untuk pengecekan menyeluruh	190	f	2025-09-17 19:54:18.999064	2025-09-17 19:54:48.999064
64	52	Peneliti	Booking Siap Dicek: 20008-2025-000005	Booking 20008-2025-000005 dari Rasya Indehouse sudah difilter LTB dan siap untuk pengecekan menyeluruh	191	f	2025-09-17 21:03:35.976369	2025-09-17 21:04:05.976369
65	53	Peneliti	Booking Siap Dicek: 20008-2025-000005	Booking 20008-2025-000005 dari Rasya Indehouse sudah difilter LTB dan siap untuk pengecekan menyeluruh	191	f	2025-09-17 21:03:35.977374	2025-09-17 21:04:05.977374
66	17	Administrator	Booking ke Peneliti: 20008-2025-000005	Booking 20008-2025-000005 telah dikirim LTB ke Peneliti untuk pengecekan menyeluruh	191	f	2025-09-17 21:03:35.978668	2025-09-17 21:04:05.978668
67	1	Administrator	Booking ke Peneliti: 20008-2025-000005	Booking 20008-2025-000005 telah dikirim LTB ke Peneliti untuk pengecekan menyeluruh	191	f	2025-09-17 21:03:35.979563	2025-09-17 21:04:05.979563
69	17	Administrator	Booking Baru: 20008-2025-000006	PPAT: Rasya Indehouse, Jenis: Badan Usaha, WP: DEMIN, No. PPATK: 20008	192	f	2025-09-18 19:25:46.391486	2025-09-18 19:26:16.391486
70	1	Administrator	Booking Baru: 20008-2025-000006	PPAT: Rasya Indehouse, Jenis: Badan Usaha, WP: DEMIN, No. PPATK: 20008	192	f	2025-09-18 19:25:46.399922	2025-09-18 19:26:16.399922
72	42	LTB	Booking Baru: 20008-2025-000006	PPAT: Rasya Indehouse (20008) perlu verifikasi awal - WP: DEMIN	192	f	2025-09-18 19:25:46.404442	2025-09-18 19:26:16.404442
75	52	Peneliti	Booking Siap Dicek: 20008-2025-000006	Booking 20008-2025-000006 dari Rasya Indehouse sudah difilter LTB dan siap untuk pengecekan menyeluruh	192	f	2025-09-18 20:29:09.912714	2025-09-18 20:29:39.912714
76	53	Peneliti	Booking Siap Dicek: 20008-2025-000006	Booking 20008-2025-000006 dari Rasya Indehouse sudah difilter LTB dan siap untuk pengecekan menyeluruh	192	f	2025-09-18 20:29:09.913521	2025-09-18 20:29:39.913521
77	17	Administrator	Booking ke Peneliti: 20008-2025-000006	Booking 20008-2025-000006 telah dikirim LTB ke Peneliti untuk pengecekan menyeluruh	192	f	2025-09-18 20:29:09.914707	2025-09-18 20:29:39.914707
78	1	Administrator	Booking ke Peneliti: 20008-2025-000006	Booking 20008-2025-000006 telah dikirim LTB ke Peneliti untuk pengecekan menyeluruh	192	f	2025-09-18 20:29:09.915733	2025-09-18 20:29:39.915733
56	43	LTB	Booking Baru: 20008-2025-000004	PPAT: Rasya Indehouse (20008) perlu verifikasi awal - WP: Mayendar	190	t	2025-09-17 19:53:45.905883	2025-09-17 19:54:15.905883
57	51	Peneliti	Booking Siap Dicek: 20008-2025-000004	Booking 20008-2025-000004 dari Rasya Indehouse sudah difilter LTB dan siap untuk pengecekan menyeluruh	190	t	2025-09-17 19:54:18.992854	2025-09-17 19:54:48.992854
63	51	Peneliti	Booking Siap Dicek: 20008-2025-000005	Booking 20008-2025-000005 dari Rasya Indehouse sudah difilter LTB dan siap untuk pengecekan menyeluruh	191	t	2025-09-17 21:03:35.973201	2025-09-17 21:04:05.973201
31	51	Peneliti	Booking Siap Dicek: 20008-2025-000002	Booking 20008-2025-000002 dari Rasya Indehouse sudah difilter LTB dan siap untuk pengecekan menyeluruh	188	t	2025-09-13 17:09:46.13294	2025-09-13 17:10:16.13294
79	2	Administrator	Booking ke Peneliti: 20008-2025-000006	Booking 20008-2025-000006 telah dikirim LTB ke Peneliti untuk pengecekan menyeluruh	192	t	2025-09-18 20:29:09.916609	2025-09-18 20:29:39.916609
71	2	Administrator	Booking Baru: 20008-2025-000006	PPAT: Rasya Indehouse, Jenis: Badan Usaha, WP: DEMIN, No. PPATK: 20008	192	t	2025-09-18 19:25:46.401987	2025-09-18 19:26:16.401987
68	2	Administrator	Booking ke Peneliti: 20008-2025-000005	Booking 20008-2025-000005 telah dikirim LTB ke Peneliti untuk pengecekan menyeluruh	191	t	2025-09-17 21:03:35.980421	2025-09-17 21:04:05.980421
62	2	Administrator	Booking ke Peneliti: 20008-2025-000004	Booking 20008-2025-000004 telah dikirim LTB ke Peneliti untuk pengecekan menyeluruh	190	t	2025-09-17 19:54:18.999977	2025-09-17 19:54:48.999977
54	2	Administrator	Booking Baru: 20008-2025-000004	PPAT: Rasya Indehouse, Jenis: Badan Usaha, WP: Mayendar, No. PPATK: 20008	190	t	2025-09-17 19:53:45.903225	2025-09-17 19:54:15.903225
49	2	Administrator	Booking Baru: 20008-2025-000005	PPAT: Rasya Indehouse, Jenis: Badan Usaha, WP: KETERANGAN, No. PPATK: 20008	191	t	2025-09-17 19:53:41.098543	2025-09-17 19:54:11.098543
46	2	Administrator	Booking ke Peneliti: 20008-2025-000003	Booking 20008-2025-000003 telah dikirim LTB ke Peneliti untuk pengecekan menyeluruh	189	t	2025-09-17 06:48:39.272843	2025-09-17 06:49:09.272843
38	2	Administrator	Booking Baru: 20008-2025-000003	PPAT: Rasya Indehouse, Jenis: Badan Usaha, WP: Farras Syau, No. PPATK: 20008	189	t	2025-09-17 06:48:14.972522	2025-09-17 06:48:44.972522
13	2	Administrator	Booking ke Peneliti: 20002-2025-000007	Booking 20002-2025-000007 telah dikirim LTB ke Peneliti untuk pengecekan menyeluruh	186	t	2025-09-07 23:08:14.073328	2025-09-07 23:08:44.073328
80	17	Administrator	Booking Baru: 20008-2025-000009	PPAT: Farras ST. MT, Jenis: Badan Usaha, WP: Farras Dulu, No. PPATK: 20008	195	f	2025-09-20 04:46:18.310252	2025-09-20 04:46:48.310252
81	1	Administrator	Booking Baru: 20008-2025-000009	PPAT: Farras ST. MT, Jenis: Badan Usaha, WP: Farras Dulu, No. PPATK: 20008	195	f	2025-09-20 04:46:18.319751	2025-09-20 04:46:48.319751
51	43	LTB	Booking Baru: 20008-2025-000005	PPAT: Rasya Indehouse (20008) perlu verifikasi awal - WP: KETERANGAN	191	t	2025-09-17 19:53:41.102435	2025-09-17 19:54:11.102435
82	2	Administrator	Booking Baru: 20008-2025-000009	PPAT: Farras ST. MT, Jenis: Badan Usaha, WP: Farras Dulu, No. PPATK: 20008	195	t	2025-09-20 04:46:18.32182	2025-09-20 04:46:48.32182
74	51	Peneliti	Booking Siap Dicek: 20008-2025-000006	Booking 20008-2025-000006 dari Rasya Indehouse sudah difilter LTB dan siap untuk pengecekan menyeluruh	192	t	2025-09-18 20:29:09.906007	2025-09-18 20:29:39.906007
83	42	LTB	Booking Baru: 20008-2025-000009	PPAT: Farras ST. MT (20008) perlu verifikasi awal - WP: Farras Dulu	195	f	2025-09-20 04:46:18.324946	2025-09-20 04:46:48.324946
85	17	Administrator	Booking Baru: 20008-2025-000010	PPAT: Farras ST. MT, Jenis: Badan Usaha, WP: Farras, No. PPATK: 20008	196	f	2025-09-21 05:07:02.792832	2025-09-21 05:07:32.792832
86	1	Administrator	Booking Baru: 20008-2025-000010	PPAT: Farras ST. MT, Jenis: Badan Usaha, WP: Farras, No. PPATK: 20008	196	f	2025-09-21 05:07:02.797223	2025-09-21 05:07:32.797223
88	42	LTB	Booking Baru: 20008-2025-000010	PPAT: Farras ST. MT (20008) perlu verifikasi awal - WP: Farras	196	f	2025-09-21 05:07:02.800265	2025-09-21 05:07:32.800265
90	56	BANK	Booking Baru: 20008-2025-000010	PPAT: Farras ST. MT (20008) memerlukan pengecekan transaksi di BANK - WP: Farras	196	f	2025-09-21 05:07:02.803654	2025-09-21 05:07:32.803654
91	55	BANK	Booking Baru: 20008-2025-000010	PPAT: Farras ST. MT (20008) memerlukan pengecekan transaksi di BANK - WP: Farras	196	t	2025-09-21 05:07:02.804854	2025-09-21 05:07:32.804854
97	56	BANK	Booking Baru: 20008-2025-000011	PPAT: Farras ST. MT (20008) memerlukan pengecekan transaksi di BANK - WP: ALAS KAKI	197	f	2025-09-21 16:55:59.862914	2025-09-21 16:56:29.862914
92	17	Administrator	Booking Baru: 20008-2025-000011	PPAT: Farras ST. MT, Jenis: Badan Usaha, WP: ALAS KAKI, No. PPATK: 20008	197	t	2025-09-21 16:55:59.842841	2025-09-21 16:56:29.842841
93	1	Administrator	Booking Baru: 20008-2025-000011	PPAT: Farras ST. MT, Jenis: Badan Usaha, WP: ALAS KAKI, No. PPATK: 20008	197	t	2025-09-21 16:55:59.850771	2025-09-21 16:56:29.850771
94	2	Administrator	Booking Baru: 20008-2025-000011	PPAT: Farras ST. MT, Jenis: Badan Usaha, WP: ALAS KAKI, No. PPATK: 20008	197	t	2025-09-21 16:55:59.853395	2025-09-21 16:56:29.853395
95	42	LTB	Booking Baru: 20008-2025-000011	PPAT: Farras ST. MT (20008) perlu verifikasi awal - WP: ALAS KAKI	197	t	2025-09-21 16:55:59.857143	2025-09-21 16:56:29.857143
98	55	BANK	Booking Baru: 20008-2025-000011	PPAT: Farras ST. MT (20008) memerlukan pengecekan transaksi di BANK - WP: ALAS KAKI	197	t	2025-09-21 16:55:59.864713	2025-09-21 16:56:29.864713
104	56	BANK	Booking Baru: 20008-2025-000012	PPAT: Farras ST. MT (20008) memerlukan pengecekan transaksi di BANK - WP: S	198	f	2025-09-21 21:29:17.066151	2025-09-21 21:29:47.066151
103	43	LTB	Booking Baru: 20008-2025-000012	PPAT: Farras ST. MT (20008) perlu verifikasi awal - WP: S	198	t	2025-09-21 21:29:17.0638	2025-09-21 21:29:47.0638
96	43	LTB	Booking Baru: 20008-2025-000011	PPAT: Farras ST. MT (20008) perlu verifikasi awal - WP: ALAS KAKI	197	t	2025-09-21 16:55:59.859978	2025-09-21 16:56:29.859978
89	43	LTB	Booking Baru: 20008-2025-000010	PPAT: Farras ST. MT (20008) perlu verifikasi awal - WP: Farras	196	t	2025-09-21 05:07:02.801506	2025-09-21 05:07:32.801506
84	43	LTB	Booking Baru: 20008-2025-000009	PPAT: Farras ST. MT (20008) perlu verifikasi awal - WP: Farras Dulu	195	t	2025-09-20 04:46:18.327432	2025-09-20 04:46:48.327432
73	43	LTB	Booking Baru: 20008-2025-000006	PPAT: Rasya Indehouse (20008) perlu verifikasi awal - WP: DEMIN	192	t	2025-09-18 19:25:46.405973	2025-09-18 19:26:16.405973
99	17	Administrator	Booking Baru: 20008-2025-000012	PPAT: Farras ST. MT, Jenis: Badan Usaha, WP: S, No. PPATK: 20008	198	t	2025-09-21 21:29:17.050321	2025-09-21 21:29:47.050321
100	1	Administrator	Booking Baru: 20008-2025-000012	PPAT: Farras ST. MT, Jenis: Badan Usaha, WP: S, No. PPATK: 20008	198	t	2025-09-21 21:29:17.056247	2025-09-21 21:29:47.056247
101	2	Administrator	Booking Baru: 20008-2025-000012	PPAT: Farras ST. MT, Jenis: Badan Usaha, WP: S, No. PPATK: 20008	198	t	2025-09-21 21:29:17.058384	2025-09-21 21:29:47.058384
102	42	LTB	Booking Baru: 20008-2025-000012	PPAT: Farras ST. MT (20008) perlu verifikasi awal - WP: S	198	t	2025-09-21 21:29:17.061897	2025-09-21 21:29:47.061897
105	55	BANK	Booking Baru: 20008-2025-000012	PPAT: Farras ST. MT (20008) memerlukan pengecekan transaksi di BANK - WP: S	198	t	2025-09-21 21:29:17.067417	2025-09-21 21:29:47.067417
107	53	Peneliti	Paraf Kasie: 20008-2025-000012	Booking 20008-2025-000012 dari Farras ST. MT siap diparaf Kasie Verifikasi	198	f	2025-09-21 21:31:58.294995	2025-09-21 21:32:28.294995
108	52	Peneliti	Paraf Kasie: 20008-2025-000012	Booking 20008-2025-000012 dari Farras ST. MT siap diparaf Kasie Verifikasi	198	f	2025-09-21 21:31:58.296118	2025-09-21 21:32:28.296118
109	45	LSB	Booking Terverifikasi: 20008-2025-000012	Booking 20008-2025-000012 dari Farras ST. MT sudah diverifikasi akhir dan siap diproses	198	f	2025-09-21 21:33:25.683578	2025-09-21 21:33:55.683578
87	2	Administrator	Booking Baru: 20008-2025-000010	PPAT: Farras ST. MT, Jenis: Badan Usaha, WP: Farras, No. PPATK: 20008	196	t	2025-09-21 05:07:02.798388	2025-09-21 05:07:32.798388
110	61	LSB	Booking Terverifikasi: 20008-2025-000012	Booking 20008-2025-000012 dari Farras ST. MT sudah diverifikasi akhir dan siap diproses	198	t	2025-09-21 21:33:25.685358	2025-09-21 21:33:55.685358
106	51	Peneliti	Paraf Kasie: 20008-2025-000012	Booking 20008-2025-000012 dari Farras ST. MT siap diparaf Kasie Verifikasi	198	t	2025-09-21 21:31:58.292968	2025-09-21 21:32:28.292968
116	56	BANK	Booking Baru: 20008-2025-000013	PPAT: Farras ST. MT (20008) memerlukan pengecekan transaksi di BANK - WP: L	199	f	2025-09-21 22:40:04.769987	2025-09-21 22:40:34.769987
113	2	Administrator	Booking Baru: 20008-2025-000013	PPAT: Farras ST. MT, Jenis: Badan Usaha, WP: L, No. PPATK: 20008	199	t	2025-09-21 22:40:04.762897	2025-09-21 22:40:34.762897
115	43	LTB	Booking Baru: 20008-2025-000013	PPAT: Farras ST. MT (20008) perlu verifikasi awal - WP: L	199	t	2025-09-21 22:40:04.766907	2025-09-21 22:40:34.766907
111	17	Administrator	Booking Baru: 20008-2025-000013	PPAT: Farras ST. MT, Jenis: Badan Usaha, WP: L, No. PPATK: 20008	199	t	2025-09-21 22:40:04.7512	2025-09-21 22:40:34.7512
112	1	Administrator	Booking Baru: 20008-2025-000013	PPAT: Farras ST. MT, Jenis: Badan Usaha, WP: L, No. PPATK: 20008	199	t	2025-09-21 22:40:04.760063	2025-09-21 22:40:34.760063
114	42	LTB	Booking Baru: 20008-2025-000013	PPAT: Farras ST. MT (20008) perlu verifikasi awal - WP: L	199	t	2025-09-21 22:40:04.765455	2025-09-21 22:40:34.765455
117	55	BANK	Booking Baru: 20008-2025-000013	PPAT: Farras ST. MT (20008) memerlukan pengecekan transaksi di BANK - WP: L	199	t	2025-09-21 22:40:04.77219	2025-09-21 22:40:34.77219
118	53	Peneliti	Paraf Kasie: 20008-2025-000013	Booking 20008-2025-000013 dari Farras ST. MT siap diparaf Kasie Verifikasi	199	f	2025-09-21 22:48:18.344414	2025-09-21 22:48:48.344414
120	52	Peneliti	Paraf Kasie: 20008-2025-000013	Booking 20008-2025-000013 dari Farras ST. MT siap diparaf Kasie Verifikasi	199	f	2025-09-21 22:48:18.34942	2025-09-21 22:48:48.34942
119	51	Peneliti	Paraf Kasie: 20008-2025-000013	Booking 20008-2025-000013 dari Farras ST. MT siap diparaf Kasie Verifikasi	199	t	2025-09-21 22:48:18.347873	2025-09-21 22:48:48.347873
\.


--
-- Data for Name: ttd_paraf_kasie; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.ttd_paraf_kasie (userid, signfile_path, sign_paraf, nobooking, id) FROM stdin;
\.


--
-- Data for Name: user_sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_sessions (sid, sess, expire) FROM stdin;
T3mjRpsrTMhIMpjQk4p9o1kAFwYHlJYH	{"cookie":{"originalMaxAge":86400000,"expires":"2025-09-22T19:14:08.456Z","secure":false,"httpOnly":true,"path":"/"},"user":{"userid":"A01","divisi":"Administrator","nama":"Farras Syauqi","email":"farrassyauqi22803@gmail.com","telepon":"087726101813","fotoprofil":"/penting_F_simpan/profile-photo/A01_fotoProfile.jpg","username":"Farras ja","nip":"1234567899","special_field":null,"special_parafv":null,"pejabat_umum":null,"is_profile_complete":true,"statuspengguna":"offline","tanda_tangan_mime":null,"tanda_tangan_path":null}}	2025-09-23 02:14:45
U3Gc7aRrzBO-aaCWPMEi-bpK4dcocaJ0	{"cookie":{"originalMaxAge":86400000,"expires":"2025-09-20T21:46:38.893Z","secure":false,"httpOnly":true,"path":"/"},"user":{"userid":"BANK01","divisi":"BANK","nama":"arras SPESIALIS","email":"ucok@test.com","telepon":"02932132131","fotoprofil":"penting_F_simpan/profile-photo/default-foto-profile.png","username":"Farras_syauqiKali","nip":"38309483920","special_field":"","special_parafv":"","pejabat_umum":null,"is_profile_complete":true,"statuspengguna":"offline","tanda_tangan_mime":null,"tanda_tangan_path":null}}	2025-09-22 04:46:07
-26BuLvUchMivFnxqyTCVT4wAvhP51JD	{"cookie":{"originalMaxAge":86400000,"expires":"2025-09-22T17:24:05.532Z","secure":false,"httpOnly":true,"path":"/"},"user":{"userid":"PV01","divisi":"Peneliti Validasi","nama":"ini","email":"inie@gmail.com","telepon":"09109","fotoprofil":"penting_F_simpan/profile-photo/default-foto-profile.png","username":"Farras_nich","nip":"3218301223","special_field":"","special_parafv":"Ini ST. ESTE. MT","pejabat_umum":null,"is_profile_complete":true,"statuspengguna":"online","tanda_tangan_mime":"image/png","tanda_tangan_path":"/penting_F_simpan/folderttd/parafv_sign/ttd-PV01.png"},"pv_local_cert":{"serial_number":"A18E6478085F7806","verified_at":1758465173937}}	2025-09-23 02:16:03
\.


--
-- Name: api_idempotency_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.api_idempotency_id_seq', 17, true);


--
-- Name: bank_1_cek_hasil_transaksi_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.bank_1_cek_hasil_transaksi_id_seq', 5, true);


--
-- Name: faqs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.faqs_id_seq', 1, false);


--
-- Name: file_lengkap_tertandatangani_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.file_lengkap_tertandatangani_id_seq', 1, false);


--
-- Name: lsb_serah_berkas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.lsb_serah_berkas_id_seq', 7, true);


--
-- Name: nobooking_daily_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.nobooking_daily_seq', 1, false);


--
-- Name: nobooking_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.nobooking_seq', 3, true);


--
-- Name: notices_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.notices_id_seq', 1, false);


--
-- Name: password_reset_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.password_reset_tokens_id_seq', 7, true);


--
-- Name: peneliteri_clear_to_paraf_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.peneliteri_clear_to_paraf_id_seq', 23, true);


--
-- Name: peneliti_data_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.peneliti_data_id_seq', 48, true);


--
-- Name: peneliti_verif_sign_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.peneliti_verif_sign_id_seq', 12, true);


--
-- Name: ppatk_bookingsspd_bookingid_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.ppatk_bookingsspd_bookingid_seq', 199, true);


--
-- Name: ppatk_bphtb_perhitungan_calculationid_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.ppatk_bphtb_perhitungan_calculationid_seq', 158, true);


--
-- Name: ppatk_documents_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.ppatk_documents_id_seq', 18, true);


--
-- Name: ppatk_objek_pajak_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.ppatk_objek_pajak_id_seq', 116, true);


--
-- Name: ppatk_penghitungan_njop_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.ppatk_penghitungan_njop_id_seq', 84, true);


--
-- Name: ppatk_sign_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.ppatk_sign_id_seq', 43, true);


--
-- Name: ppatk_validasi_surat_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.ppatk_validasi_surat_id_seq', 24, true);


--
-- Name: ppatk_validasi_tambahan_new_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.ppatk_validasi_tambahan_new_id_seq', 30, true);


--
-- Name: pv_1_debug_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.pv_1_debug_log_id_seq', 7, true);


--
-- Name: pv_1_paraf_validate_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.pv_1_paraf_validate_id_seq', 14, true);


--
-- Name: pv_2_signing_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.pv_2_signing_requests_id_seq', 8, true);


--
-- Name: pv_3_bsre_token_cache_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.pv_3_bsre_token_cache_id_seq', 8, true);


--
-- Name: pv_4_signing_audit_event_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.pv_4_signing_audit_event_id_seq', 255, true);


--
-- Name: pv_7_audit_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.pv_7_audit_log_id_seq', 5, true);


--
-- Name: pv_local_certs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.pv_local_certs_id_seq', 4, true);


--
-- Name: sys_notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.sys_notifications_id_seq', 120, true);


--
-- Name: terima_berkas_sspd_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.terima_berkas_sspd_id_seq', 87, true);


--
-- Name: ttd_paraf_kasie_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.ttd_paraf_kasie_id_seq', 16, true);


--
-- Name: unverified_users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.unverified_users_id_seq', 74, true);


--
-- Name: verified_users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.verified_users_id_seq', 61, true);


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
-- Name: daily_counter daily_counter_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_counter
    ADD CONSTRAINT daily_counter_pkey PRIMARY KEY (date);


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
-- Name: a_1_unverified_users unverified_users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.a_1_unverified_users
    ADD CONSTRAINT unverified_users_pkey PRIMARY KEY (id);


--
-- Name: a_2_verified_users verified_users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.a_2_verified_users
    ADD CONSTRAINT verified_users_email_key UNIQUE (email);


--
-- Name: a_2_verified_users verified_users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.a_2_verified_users
    ADD CONSTRAINT verified_users_pkey PRIMARY KEY (id);


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
-- Name: idx_idem_expires; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_idem_expires ON public.api_idempotency USING btree (expires_at);


--
-- Name: idx_notifications_booking; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_booking ON public.sys_notifications USING btree (booking_id);


--
-- Name: idx_notifications_divisi; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_divisi ON public.sys_notifications USING btree (recipient_divisi, is_read);


--
-- Name: idx_notifications_recipient; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_recipient ON public.sys_notifications USING btree (recipient_id, is_read, created_at);


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

