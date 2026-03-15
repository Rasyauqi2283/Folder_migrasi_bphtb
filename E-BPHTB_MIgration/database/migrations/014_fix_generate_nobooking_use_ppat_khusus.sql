-- Fix trigger generate_nobooking: pakai kolom ppat_khusus (bukan ppatk_khusus).
-- Jalankan setelah migration 006 (rename ppatk_khusus -> ppat_khusus).

CREATE OR REPLACE FUNCTION generate_nobooking()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;
