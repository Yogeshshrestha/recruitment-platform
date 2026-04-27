-- ============================================================
-- RECRUITMENT PLATFORM - SUPABASE SCHEMA
-- Run this entire file in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- ─── TABLES ─────────────────────────────────────────────────

-- Profiles (extends auth.users, one row per user)
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role        TEXT        NOT NULL DEFAULT 'candidate' CHECK (role IN ('candidate', 'recruiter')),
  full_name   TEXT,
  bio         TEXT,
  skills      TEXT[]      DEFAULT '{}',
  avatar_url  TEXT,
  resume_url  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Companies (one recruiter can have one company)
CREATE TABLE IF NOT EXISTS companies (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name         TEXT        NOT NULL,
  description  TEXT,
  logo_url     TEXT,
  website      TEXT,
  location     TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Jobs
CREATE TABLE IF NOT EXISTS jobs (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id   UUID        REFERENCES companies(id) ON DELETE SET NULL,
  recruiter_id UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title        TEXT        NOT NULL,
  description  TEXT        NOT NULL,
  location     TEXT,
  salary_range TEXT,
  type         TEXT        DEFAULT 'full-time' CHECK (type IN ('full-time', 'part-time', 'contract', 'remote', 'hybrid')),
  category     TEXT,
  status       TEXT        DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Applications
CREATE TABLE IF NOT EXISTS applications (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id       UUID        NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  candidate_id UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resume_url   TEXT,
  cover_letter TEXT,
  status       TEXT        DEFAULT 'applied' CHECK (status IN ('applied', 'reviewing', 'interviewing', 'rejected', 'hired')),
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (job_id, candidate_id)
);

-- ─── AUTO-CREATE PROFILE ON SIGNUP ──────────────────────────

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (id, role, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'candidate'),
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─── ROW LEVEL SECURITY ─────────────────────────────────────

ALTER TABLE profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies    ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs         ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "profiles_select_all"   ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_own"   ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own"   ON profiles FOR UPDATE USING (auth.uid() = id);

-- Companies policies
CREATE POLICY "companies_select_all"        ON companies FOR SELECT USING (true);
CREATE POLICY "companies_insert_recruiter"  ON companies FOR INSERT WITH CHECK (auth.uid() = recruiter_id);
CREATE POLICY "companies_update_recruiter"  ON companies FOR UPDATE USING (auth.uid() = recruiter_id);
CREATE POLICY "companies_delete_recruiter"  ON companies FOR DELETE USING (auth.uid() = recruiter_id);

-- Jobs policies
CREATE POLICY "jobs_select_open_or_own"  ON jobs FOR SELECT
  USING (status = 'open' OR auth.uid() = recruiter_id);
CREATE POLICY "jobs_insert_recruiter"    ON jobs FOR INSERT
  WITH CHECK (auth.uid() = recruiter_id);
CREATE POLICY "jobs_update_recruiter"    ON jobs FOR UPDATE
  USING (auth.uid() = recruiter_id);
CREATE POLICY "jobs_delete_recruiter"    ON jobs FOR DELETE
  USING (auth.uid() = recruiter_id);

-- Applications policies
CREATE POLICY "applications_select_candidate" ON applications FOR SELECT
  USING (auth.uid() = candidate_id);
CREATE POLICY "applications_select_recruiter" ON applications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM jobs j WHERE j.id = applications.job_id AND j.recruiter_id = auth.uid()
    )
  );
CREATE POLICY "applications_insert_candidate" ON applications FOR INSERT
  WITH CHECK (auth.uid() = candidate_id);
CREATE POLICY "applications_update_recruiter" ON applications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM jobs j WHERE j.id = applications.job_id AND j.recruiter_id = auth.uid()
    )
  );

-- ─── STORAGE BUCKETS ────────────────────────────────────────
-- NOTE: If the INSERT below fails (bucket already exists), safely ignore the error.

INSERT INTO storage.buckets (id, name, public)
  VALUES ('avatars', 'avatars', true)
  ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
  VALUES ('logos', 'logos', true)
  ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
  VALUES ('resumes', 'resumes', false)
  ON CONFLICT (id) DO NOTHING;

-- Storage RLS for avatars
CREATE POLICY "avatars_public_select"  ON storage.objects FOR SELECT  USING (bucket_id = 'avatars');
CREATE POLICY "avatars_owner_insert"   ON storage.objects FOR INSERT  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "avatars_owner_update"   ON storage.objects FOR UPDATE  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "avatars_owner_delete"   ON storage.objects FOR DELETE  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage RLS for logos
CREATE POLICY "logos_public_select"    ON storage.objects FOR SELECT  USING (bucket_id = 'logos');
CREATE POLICY "logos_owner_insert"     ON storage.objects FOR INSERT  WITH CHECK (bucket_id = 'logos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "logos_owner_update"     ON storage.objects FOR UPDATE  USING (bucket_id = 'logos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "logos_owner_delete"     ON storage.objects FOR DELETE  USING (bucket_id = 'logos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage RLS for resumes
CREATE POLICY "resumes_owner_insert"   ON storage.objects FOR INSERT  WITH CHECK (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "resumes_owner_select"   ON storage.objects FOR SELECT  USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "resumes_owner_update"   ON storage.objects FOR UPDATE  USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "resumes_owner_delete"   ON storage.objects FOR DELETE  USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);
-- Recruiters can view resumes of applicants for their jobs
CREATE POLICY "resumes_recruiter_select" ON storage.objects FOR SELECT
  USING (
    bucket_id = 'resumes' AND
    EXISTS (
      SELECT 1 FROM applications a
      JOIN jobs j ON a.job_id = j.id
      WHERE j.recruiter_id = auth.uid()
        AND a.resume_url LIKE '%' || name
    )
  );
