-- Fix trigger to use MAX sequence instead of COUNT
CREATE OR REPLACE FUNCTION public.generate_nobooking() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_ppat_khusus text;
    v_current_year text;
    v_sequence_number integer;
    v_nobooking text;
BEGIN
    -- Dapatkan ppat_khusus dari verified users
    SELECT ppat_khusus 
    INTO v_ppat_khusus
    FROM a_2_verified_users 
    WHERE userid = NEW.userid;

    -- Jika tidak ditemukan user, beri error
    IF NOT FOUND THEN
        RAISE EXCEPTION 'User ID % not found in a_2_verified_users', NEW.userid;
    END IF;

    -- Pastikan ppat_khusus tidak null
    IF v_ppat_khusus IS NULL THEN
        RAISE EXCEPTION 'ppat_khusus is NULL for user ID %', NEW.userid;
    END IF;

    -- Dapatkan tahun sekarang
    v_current_year := EXTRACT(YEAR FROM CURRENT_DATE)::text;

    -- Hitung urutan booking untuk ppat_khusus dan tahun ini menggunakan MAX
    SELECT COALESCE(MAX(CAST(SUBSTRING(nobooking FROM '^[^-]+-[^-]+-(\d+)$') AS INTEGER)), 0) + 1 
    INTO v_sequence_number
    FROM pat_1_bookingsspd 
    WHERE nobooking LIKE v_ppat_khusus || '-' || v_current_year || '-%';

    -- Format urutan dengan 6 digit
    v_nobooking := v_ppat_khusus || '-' || v_current_year || '-' || 
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
