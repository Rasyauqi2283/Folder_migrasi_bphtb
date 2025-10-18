-- Fix trigger to use MAX sequence instead of COUNT
CREATE OR REPLACE FUNCTION public.generate_nobooking() RETURNS trigger
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

    -- Hitung urutan booking untuk ppatk_khusus dan tahun ini menggunakan MAX
    SELECT COALESCE(MAX(CAST(SUBSTRING(nobooking FROM '^[^-]+-[^-]+-(\d+)$') AS INTEGER)), 0) + 1 
    INTO v_sequence_number
    FROM pat_1_bookingsspd 
    WHERE nobooking LIKE v_ppatk_khusus || '-' || v_current_year || '-%';

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
