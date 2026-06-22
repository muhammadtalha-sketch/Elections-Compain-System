-- ===========================================================
-- Migration 005: Extract area from address for lawyer records
-- ===========================================================
-- All 2,543 lawyer records were inserted with area = NULL.
-- This migration derives a normalised area from the address.
--
-- Safe to re-run: only touches rows where area IS NULL.
-- ===========================================================

-- ── Step 1: Disable the broken birth_year trigger ─────────
-- The trigger references NEW.dob but the actual column is DOB
-- (case-sensitive). Drop it before the UPDATE to avoid the error.
DROP TRIGGER IF EXISTS trg_members_birth_year ON public.members;

-- ── Step 2: Fix the trigger function for your column name ──
CREATE OR REPLACE FUNCTION public.sync_birth_year()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  dob_val DATE;
BEGIN
  -- Try both casing variants so this works regardless of how the
  -- column was originally created (dob vs DOB).
  BEGIN
    dob_val := NEW."DOB";
  EXCEPTION WHEN undefined_column THEN
    BEGIN dob_val := NEW.dob; EXCEPTION WHEN undefined_column THEN dob_val := NULL; END;
  END;

  IF dob_val IS NOT NULL AND NEW.birth_year IS NULL THEN
    NEW.birth_year := EXTRACT(YEAR FROM dob_val)::INTEGER;
  END IF;
  RETURN NEW;
END;
$$;

-- Recreate trigger with fixed function
CREATE TRIGGER trg_members_birth_year
  BEFORE INSERT OR UPDATE ON public.members
  FOR EACH ROW EXECUTE FUNCTION public.sync_birth_year();

-- ── Step 3: Set area from address patterns ─────────────────
UPDATE public.members
SET area = CASE
  -- Sialkot Cantonment (most common)
  WHEN address ILIKE '%CANTT%'                                          THEN 'Sialkot Cantt'

  -- Named residential / commercial areas
  WHEN address ILIKE '%MODEL TOWN%'                                     THEN 'Model Town'
  WHEN address ILIKE '%HAJI PURA%'  OR address ILIKE '%HAJIPURA%'       THEN 'Hajipura'
  WHEN address ILIKE '%DEFENCE ROAD%'                                   THEN 'Defence Road'
  WHEN address ILIKE '%RANGPURA%'                                       THEN 'Rangpura'
  WHEN address ILIKE '%PARIS ROAD%'                                     THEN 'Paris Road'
  WHEN address ILIKE '%KUTCHERY ROAD%'                                  THEN 'Kutchery Road'
  WHEN address ILIKE '%PASRUR ROAD%'                                    THEN 'Pasrur Road'
  WHEN address ILIKE '%KASHMIR ROAD%'                                   THEN 'Kashmir Road'
  WHEN address ILIKE '%ISLAMPURA%'                                      THEN 'Islampura'
  WHEN address ILIKE '%MUSLIM TOWN%'                                    THEN 'Muslim Town'
  WHEN address ILIKE '%HUNTER PURA%'                                    THEN 'Hunter Pura'
  WHEN address ILIKE '%GARDEN TOWN%'                                    THEN 'Garden Town'
  WHEN address ILIKE '%SADAR BAZAR%' OR address ILIKE '%SADDAR BAZAR%' THEN 'Sadar Bazar'
  WHEN address ILIKE '%DASKA ROAD%'                                     THEN 'Daska Road'
  WHEN address ILIKE '%WAZIRABAD ROAD%'                                 THEN 'Wazirabad Road'
  WHEN address ILIKE '%AIRPORT ROAD%'                                   THEN 'Airport Road'
  WHEN address ILIKE '%SHAHABPURA%'  OR address ILIKE '%SHAHAB PURA%'  THEN 'Shahabpura'
  WHEN address ILIKE '%FIRDOOS%'     OR address ILIKE '%FIRDOUS%'      THEN 'Firdoos Pura'
  WHEN address ILIKE '%ZAFAR ALI ROAD%'                                 THEN 'Zafar Ali Road'
  WHEN address ILIKE '%KHALID ROAD%'                                    THEN 'Khalid Road'
  WHEN address ILIKE '%NISHAT PARK%'                                    THEN 'Nishat Park'
  WHEN address ILIKE '%KOTLI LOHARAN%'                                  THEN 'Kotli Loharan'
  WHEN address ILIKE '%SIALKOT CITY%'                                   THEN 'Sialkot City'

  -- Institutions
  WHEN address ILIKE '%DISTRICT BAR ASSOCIATION%'
    OR address ILIKE '%DISTT BAR%'
    OR address ILIKE '%D.B.A%'
    OR address ILIKE '%DBA%'
    OR address ILIKE '%BAR ASSOCIATION%'                                THEN 'District Bar Association'

  WHEN address ILIKE '%DISTRICT COURT%'
    OR address ILIKE '%DISTT COURT%'
    OR address ILIKE '%DISTT: COURT%'                                   THEN 'District Courts'

  WHEN address ILIKE '%LAWYERS INN%'
    OR address ILIKE '%LAWYERS, INN%'                                   THEN 'Lawyers Inn'

  -- Villages / rural
  WHEN address ILIKE '%VILL%'
    OR address ILIKE '% P.O%'
    OR address ILIKE '% P/O%'
    OR address ILIKE '%MOHALL%'
    OR address ILIKE '%TEH %'
    OR address ILIKE '%TEHSIL%'                                         THEN 'Rural / Village'

  ELSE 'Sialkot City'
END
WHERE area IS NULL;

-- ── Step 4: Verify results ─────────────────────────────────
SELECT area, COUNT(*) AS members
FROM public.members
GROUP BY area
ORDER BY members DESC;
