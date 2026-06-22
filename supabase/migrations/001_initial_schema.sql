-- ===========================================================
-- ECS — Election Campaign System
-- Migration 001: Initial Schema
-- ===========================================================
-- Run this once in the Supabase SQL Editor (or via CLI).
-- All statements are idempotent (IF NOT EXISTS / OR REPLACE).
-- ===========================================================

-- ===========================================================
-- EXTENSIONS
-- ===========================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";    -- fuzzy / trigram search


-- ===========================================================
-- SHARED HELPER: updated_at auto-stamp
-- ===========================================================
CREATE OR REPLACE FUNCTION public.trigger_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


-- ===========================================================
-- TABLE 1: profiles  (extends auth.users)
-- ===========================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT,
  email       TEXT,
  phone       TEXT,
  role        TEXT        NOT NULL DEFAULT 'Viewer'
                          CHECK (role IN ('Admin', 'Manager', 'Data Entry Operator', 'Viewer')),
  avatar_url  TEXT,
  is_active   BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();


-- ===========================================================
-- TABLE 2: members  (main data table)
-- ===========================================================
CREATE TABLE IF NOT EXISTS public.members (
  id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  serial_number       BIGINT      NOT NULL UNIQUE,
  name                TEXT        NOT NULL,
  father_name         TEXT,
  gender              TEXT        CHECK (gender IN ('Male', 'Female', 'Other')),
  dob                 DATE,
  -- birth_year is auto-populated from dob via trigger; can also be set independently
  birth_year          INTEGER,
  address             TEXT,
  area                TEXT,
  city                TEXT        NOT NULL DEFAULT 'Sialkot',
  phone_number        TEXT,
  request_member_bar  TEXT,
  registration_date   DATE        NOT NULL DEFAULT CURRENT_DATE,
  remarks             TEXT,
  created_by          UUID        REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_by          UUID        REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Stored full-text vector (name + father_name + address)
  search_vector       TSVECTOR    GENERATED ALWAYS AS (
    to_tsvector('simple',
      COALESCE(name, '') || ' ' ||
      COALESCE(father_name, '') || ' ' ||
      COALESCE(address, '')
    )
  ) STORED
);

-- Auto-stamp updated_at
DROP TRIGGER IF EXISTS trg_members_updated_at ON public.members;
CREATE TRIGGER trg_members_updated_at
  BEFORE UPDATE ON public.members
  FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();

-- Auto-derive birth_year from dob when birth_year not supplied
CREATE OR REPLACE FUNCTION public.sync_birth_year()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.dob IS NOT NULL AND NEW.birth_year IS NULL THEN
    NEW.birth_year := EXTRACT(YEAR FROM NEW.dob)::INTEGER;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_members_birth_year ON public.members;
CREATE TRIGGER trg_members_birth_year
  BEFORE INSERT OR UPDATE ON public.members
  FOR EACH ROW EXECUTE FUNCTION public.sync_birth_year();


-- ===========================================================
-- TABLE 3: activity_logs
-- ===========================================================
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID        REFERENCES public.profiles(id) ON DELETE SET NULL,
  action      TEXT        NOT NULL
                          CHECK (action IN (
                            'LOGIN', 'LOGOUT',
                            'CREATE_MEMBER', 'UPDATE_MEMBER', 'DELETE_MEMBER',
                            'IMPORT_EXCEL', 'EXPORT_DATA'
                          )),
  table_name  TEXT,
  record_id   UUID,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ===========================================================
-- TABLE 4: import_history
-- ===========================================================
CREATE TABLE IF NOT EXISTS public.import_history (
  id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  file_name           TEXT        NOT NULL,
  total_records       INTEGER     NOT NULL DEFAULT 0,
  successful_records  INTEGER     NOT NULL DEFAULT 0,
  failed_records      INTEGER     NOT NULL DEFAULT 0,
  imported_by         UUID        REFERENCES public.profiles(id) ON DELETE SET NULL,
  status              TEXT        NOT NULL DEFAULT 'Processing'
                                  CHECK (status IN ('Processing', 'Completed', 'Failed')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ===========================================================
-- TABLE 5: saved_searches
-- ===========================================================
CREATE TABLE IF NOT EXISTS public.saved_searches (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  search_name TEXT        NOT NULL,
  filters     JSONB       NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ===========================================================
-- TABLE 6: dashboard_stats_cache
-- ===========================================================
CREATE TABLE IF NOT EXISTS public.dashboard_stats_cache (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  stat_key      TEXT        NOT NULL UNIQUE,
  stat_value    JSONB       NOT NULL DEFAULT '{}',
  last_updated  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ===========================================================
-- INDEXES — members
-- ===========================================================
CREATE INDEX IF NOT EXISTS idx_members_serial_number       ON public.members (serial_number);
CREATE INDEX IF NOT EXISTS idx_members_name                ON public.members (name);
CREATE INDEX IF NOT EXISTS idx_members_father_name         ON public.members (father_name);
CREATE INDEX IF NOT EXISTS idx_members_gender              ON public.members (gender);
CREATE INDEX IF NOT EXISTS idx_members_birth_year          ON public.members (birth_year);
CREATE INDEX IF NOT EXISTS idx_members_area                ON public.members (area);
CREATE INDEX IF NOT EXISTS idx_members_phone_number        ON public.members (phone_number);
CREATE INDEX IF NOT EXISTS idx_members_request_member_bar  ON public.members (request_member_bar);
CREATE INDEX IF NOT EXISTS idx_members_registration_date   ON public.members (registration_date);
CREATE INDEX IF NOT EXISTS idx_members_created_at          ON public.members (created_at DESC);

-- Composite indexes for the most common filter combinations
CREATE INDEX IF NOT EXISTS idx_members_area_birth_year         ON public.members (area, birth_year);
CREATE INDEX IF NOT EXISTS idx_members_area_reg_date           ON public.members (area, registration_date);
CREATE INDEX IF NOT EXISTS idx_members_rmb_reg_date            ON public.members (request_member_bar, registration_date);

-- Trigram indexes for ILIKE / partial-match searches
CREATE INDEX IF NOT EXISTS idx_members_name_trgm               ON public.members USING GIN (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_members_father_name_trgm        ON public.members USING GIN (father_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_members_area_trgm               ON public.members USING GIN (area gin_trgm_ops);

-- GIN index for full-text search vector
CREATE INDEX IF NOT EXISTS idx_members_search_vector           ON public.members USING GIN (search_vector);

-- INDEXES — other tables
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id    ON public.activity_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action     ON public.activity_logs (action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_record_id  ON public.activity_logs (record_id);

CREATE INDEX IF NOT EXISTS idx_import_history_imported_by ON public.import_history (imported_by);
CREATE INDEX IF NOT EXISTS idx_import_history_status      ON public.import_history (status);
CREATE INDEX IF NOT EXISTS idx_import_history_created_at  ON public.import_history (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_saved_searches_user_id    ON public.saved_searches (user_id);

CREATE INDEX IF NOT EXISTS idx_dashboard_stats_key       ON public.dashboard_stats_cache (stat_key);


-- ===========================================================
-- VIEWS
-- ===========================================================

-- Overall member statistics (used by the Dashboard)
CREATE OR REPLACE VIEW public.member_statistics_view AS
SELECT
  COUNT(*)                                                          AS total_members,
  COUNT(*) FILTER (WHERE gender = 'Male')                           AS male_members,
  COUNT(*) FILTER (WHERE gender = 'Female')                         AS female_members,
  COUNT(*) FILTER (WHERE registration_date = CURRENT_DATE)          AS today_registrations,
  COUNT(*) FILTER (
    WHERE DATE_TRUNC('month', registration_date)
          = DATE_TRUNC('month', CURRENT_DATE)
  )                                                                 AS current_month_registrations
FROM public.members;

-- Per-area breakdown (used by Analytics)
CREATE OR REPLACE VIEW public.area_statistics_view AS
SELECT
  area,
  COUNT(*)                                          AS total_members,
  COUNT(*) FILTER (WHERE gender = 'Male')           AS male_count,
  COUNT(*) FILTER (WHERE gender = 'Female')         AS female_count,
  COUNT(*) FILTER (WHERE gender = 'Other')          AS other_count
FROM public.members
WHERE area IS NOT NULL
GROUP BY area
ORDER BY total_members DESC;


-- ===========================================================
-- ROW LEVEL SECURITY
-- ===========================================================
ALTER TABLE public.profiles              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_history        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_searches        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_stats_cache ENABLE ROW LEVEL SECURITY;

-- Helper: get the current user's role without calling profiles repeatedly
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT LANGUAGE SQL SECURITY DEFINER STABLE AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- ── profiles ──────────────────────────────────────────────
DROP POLICY IF EXISTS "profiles_select"  ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert"  ON public.profiles;
DROP POLICY IF EXISTS "profiles_update"  ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete"  ON public.profiles;

CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT USING (
    id = auth.uid()
    OR public.get_user_role() IN ('Admin', 'Manager')
  );

-- Self-insert is allowed so the auth trigger can create the row;
-- Admins can also insert.
CREATE POLICY "profiles_insert" ON public.profiles
  FOR INSERT WITH CHECK (
    id = auth.uid()
    OR public.get_user_role() = 'Admin'
  );

CREATE POLICY "profiles_update" ON public.profiles
  FOR UPDATE USING (
    id = auth.uid()
    OR public.get_user_role() = 'Admin'
  );

CREATE POLICY "profiles_delete" ON public.profiles
  FOR DELETE USING (
    public.get_user_role() = 'Admin'
    AND id <> auth.uid()   -- prevent self-deletion
  );

-- ── members ───────────────────────────────────────────────
DROP POLICY IF EXISTS "members_select"  ON public.members;
DROP POLICY IF EXISTS "members_insert"  ON public.members;
DROP POLICY IF EXISTS "members_update"  ON public.members;
DROP POLICY IF EXISTS "members_delete"  ON public.members;

-- All authenticated users can read members
CREATE POLICY "members_select" ON public.members
  FOR SELECT USING (auth.role() = 'authenticated');

-- Admin / Manager / Data Entry Operator can create
CREATE POLICY "members_insert" ON public.members
  FOR INSERT WITH CHECK (
    public.get_user_role() IN ('Admin', 'Manager', 'Data Entry Operator')
  );

-- Admin / Manager / Data Entry Operator can update
CREATE POLICY "members_update" ON public.members
  FOR UPDATE USING (
    public.get_user_role() IN ('Admin', 'Manager', 'Data Entry Operator')
  );

-- Only Admin can delete
CREATE POLICY "members_delete" ON public.members
  FOR DELETE USING (public.get_user_role() = 'Admin');

-- ── activity_logs ─────────────────────────────────────────
DROP POLICY IF EXISTS "activity_logs_select"  ON public.activity_logs;
DROP POLICY IF EXISTS "activity_logs_insert"  ON public.activity_logs;
DROP POLICY IF EXISTS "activity_logs_update"  ON public.activity_logs;
DROP POLICY IF EXISTS "activity_logs_delete"  ON public.activity_logs;

CREATE POLICY "activity_logs_select" ON public.activity_logs
  FOR SELECT USING (
    user_id = auth.uid()
    OR public.get_user_role() IN ('Admin', 'Manager')
  );

-- Authenticated users insert their own log entries; SECURITY DEFINER
-- trigger function bypasses this for server-side audit inserts.
CREATE POLICY "activity_logs_insert" ON public.activity_logs
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    OR public.get_user_role() = 'Admin'
  );

CREATE POLICY "activity_logs_update" ON public.activity_logs
  FOR UPDATE USING (public.get_user_role() = 'Admin');

CREATE POLICY "activity_logs_delete" ON public.activity_logs
  FOR DELETE USING (public.get_user_role() = 'Admin');

-- ── import_history ────────────────────────────────────────
DROP POLICY IF EXISTS "import_history_select"  ON public.import_history;
DROP POLICY IF EXISTS "import_history_insert"  ON public.import_history;
DROP POLICY IF EXISTS "import_history_update"  ON public.import_history;
DROP POLICY IF EXISTS "import_history_delete"  ON public.import_history;

CREATE POLICY "import_history_select" ON public.import_history
  FOR SELECT USING (
    imported_by = auth.uid()
    OR public.get_user_role() IN ('Admin', 'Manager')
  );

CREATE POLICY "import_history_insert" ON public.import_history
  FOR INSERT WITH CHECK (
    public.get_user_role() IN ('Admin', 'Manager', 'Data Entry Operator')
  );

CREATE POLICY "import_history_update" ON public.import_history
  FOR UPDATE USING (
    public.get_user_role() IN ('Admin', 'Manager')
  );

CREATE POLICY "import_history_delete" ON public.import_history
  FOR DELETE USING (public.get_user_role() = 'Admin');

-- ── saved_searches ────────────────────────────────────────
DROP POLICY IF EXISTS "saved_searches_select"  ON public.saved_searches;
DROP POLICY IF EXISTS "saved_searches_insert"  ON public.saved_searches;
DROP POLICY IF EXISTS "saved_searches_update"  ON public.saved_searches;
DROP POLICY IF EXISTS "saved_searches_delete"  ON public.saved_searches;

-- Users own their saved searches exclusively
CREATE POLICY "saved_searches_select" ON public.saved_searches
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "saved_searches_insert" ON public.saved_searches
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "saved_searches_update" ON public.saved_searches
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "saved_searches_delete" ON public.saved_searches
  FOR DELETE USING (user_id = auth.uid());

-- ── dashboard_stats_cache ─────────────────────────────────
DROP POLICY IF EXISTS "stats_cache_select"  ON public.dashboard_stats_cache;
DROP POLICY IF EXISTS "stats_cache_upsert"  ON public.dashboard_stats_cache;
DROP POLICY IF EXISTS "stats_cache_delete"  ON public.dashboard_stats_cache;

CREATE POLICY "stats_cache_select" ON public.dashboard_stats_cache
  FOR SELECT USING (auth.role() = 'authenticated');

-- Only Admins write stats cache (or a service-role key from backend)
CREATE POLICY "stats_cache_upsert" ON public.dashboard_stats_cache
  FOR ALL USING (public.get_user_role() = 'Admin');


-- ===========================================================
-- TRIGGER: auto-create profile row when a new auth user signs up
-- ===========================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'Viewer')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ===========================================================
-- TRIGGER: audit log for member INSERT / UPDATE / DELETE
-- ===========================================================
CREATE OR REPLACE FUNCTION public.log_member_changes()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_action      TEXT;
  v_description TEXT;
  v_record_id   UUID;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_action      := 'CREATE_MEMBER';
    v_description := 'Created: ' || NEW.name || ' (serial ' || NEW.serial_number || ')';
    v_record_id   := NEW.id;
  ELSIF TG_OP = 'UPDATE' THEN
    v_action      := 'UPDATE_MEMBER';
    v_description := 'Updated: ' || NEW.name || ' (serial ' || NEW.serial_number || ')';
    v_record_id   := NEW.id;
  ELSIF TG_OP = 'DELETE' THEN
    v_action      := 'DELETE_MEMBER';
    v_description := 'Deleted: ' || OLD.name || ' (serial ' || OLD.serial_number || ')';
    v_record_id   := OLD.id;
  END IF;

  INSERT INTO public.activity_logs (user_id, action, table_name, record_id, description)
  VALUES (auth.uid(), v_action, 'members', v_record_id, v_description);

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_members_audit ON public.members;
CREATE TRIGGER trg_members_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.members
  FOR EACH ROW EXECUTE FUNCTION public.log_member_changes();


-- ===========================================================
-- UTILITY FUNCTIONS
-- ===========================================================

-- Returns the next available serial number
CREATE OR REPLACE FUNCTION public.get_next_serial_number()
RETURNS BIGINT LANGUAGE SQL SECURITY DEFINER STABLE AS $$
  SELECT COALESCE(MAX(serial_number), 0) + 1 FROM public.members;
$$;

-- Parameterised member search used by the Advanced Search page
CREATE OR REPLACE FUNCTION public.search_members(
  p_query         TEXT    DEFAULT NULL,
  p_gender        TEXT    DEFAULT NULL,
  p_area          TEXT    DEFAULT NULL,
  p_birth_year    INTEGER DEFAULT NULL,
  p_reg_date_from DATE    DEFAULT NULL,
  p_reg_date_to   DATE    DEFAULT NULL,
  p_rmb           TEXT    DEFAULT NULL,
  p_limit         INTEGER DEFAULT 50,
  p_offset        INTEGER DEFAULT 0
)
RETURNS SETOF public.members LANGUAGE plpgsql SECURITY DEFINER STABLE AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM  public.members
  WHERE
    -- full-text search OR trigram fallback for partial matches
    (p_query IS NULL
      OR search_vector @@ plainto_tsquery('simple', p_query)
      OR name        ILIKE '%' || p_query || '%'
      OR father_name ILIKE '%' || p_query || '%')
    AND (p_gender        IS NULL OR gender              = p_gender)
    AND (p_area          IS NULL OR area ILIKE '%' || p_area || '%')
    AND (p_birth_year    IS NULL OR birth_year           = p_birth_year)
    AND (p_reg_date_from IS NULL OR registration_date   >= p_reg_date_from)
    AND (p_reg_date_to   IS NULL OR registration_date   <= p_reg_date_to)
    AND (p_rmb           IS NULL OR request_member_bar   = p_rmb)
  ORDER BY serial_number ASC
  LIMIT  p_limit
  OFFSET p_offset;
END;
$$;

-- Total count variant for pagination (same filters, no LIMIT/OFFSET)
CREATE OR REPLACE FUNCTION public.count_members(
  p_query         TEXT    DEFAULT NULL,
  p_gender        TEXT    DEFAULT NULL,
  p_area          TEXT    DEFAULT NULL,
  p_birth_year    INTEGER DEFAULT NULL,
  p_reg_date_from DATE    DEFAULT NULL,
  p_reg_date_to   DATE    DEFAULT NULL,
  p_rmb           TEXT    DEFAULT NULL
)
RETURNS BIGINT LANGUAGE plpgsql SECURITY DEFINER STABLE AS $$
DECLARE
  v_count BIGINT;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM  public.members
  WHERE
    (p_query IS NULL
      OR search_vector @@ plainto_tsquery('simple', p_query)
      OR name        ILIKE '%' || p_query || '%'
      OR father_name ILIKE '%' || p_query || '%')
    AND (p_gender        IS NULL OR gender              = p_gender)
    AND (p_area          IS NULL OR area ILIKE '%' || p_area || '%')
    AND (p_birth_year    IS NULL OR birth_year           = p_birth_year)
    AND (p_reg_date_from IS NULL OR registration_date   >= p_reg_date_from)
    AND (p_reg_date_to   IS NULL OR registration_date   <= p_reg_date_to)
    AND (p_rmb           IS NULL OR request_member_bar   = p_rmb);
  RETURN v_count;
END;
$$;
