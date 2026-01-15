-- AI Mediator Database Schema
-- Run this in Supabase SQL Editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  decision_question TEXT NOT NULL,
  deadline DATE NOT NULL,
  interview_start TIMESTAMPTZ NOT NULL,
  interview_end TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'collecting', 'memo_ready', 'commitments', 'completed')),
  admin_email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stakeholders table
CREATE TABLE IF NOT EXISTS stakeholders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'invited' CHECK (status IN ('invited', 'scheduled', 'interviewed', 'committed')),
  scheduled_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Interviews table
CREATE TABLE IF NOT EXISTS interviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stakeholder_id UUID NOT NULL REFERENCES stakeholders(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  goals TEXT NOT NULL,
  no_gos TEXT NOT NULL,
  concerns TEXT NOT NULL,
  conditions TEXT NOT NULL,
  additional_notes TEXT,
  call_duration_seconds INTEGER,
  transcript TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Decision Memos table
CREATE TABLE IF NOT EXISTS decision_memos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE UNIQUE,
  options JSONB NOT NULL DEFAULT '[]',
  recommendation TEXT NOT NULL,
  recommendation_rationale TEXT NOT NULL,
  tradeoffs TEXT[] NOT NULL DEFAULT '{}',
  open_questions TEXT[] NOT NULL DEFAULT '{}',
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Commitments table
CREATE TABLE IF NOT EXISTS commitments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stakeholder_id UUID NOT NULL REFERENCES stakeholders(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  decision TEXT NOT NULL CHECK (decision IN ('agree', 'block', 'need_change')),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(stakeholder_id, project_id)
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_stakeholders_project_id ON stakeholders(project_id);
CREATE INDEX IF NOT EXISTS idx_stakeholders_token ON stakeholders(token);
CREATE INDEX IF NOT EXISTS idx_interviews_project_id ON interviews(project_id);
CREATE INDEX IF NOT EXISTS idx_interviews_stakeholder_id ON interviews(stakeholder_id);
CREATE INDEX IF NOT EXISTS idx_commitments_project_id ON commitments(project_id);
CREATE INDEX IF NOT EXISTS idx_commitments_stakeholder_id ON commitments(stakeholder_id);

-- Row Level Security (RLS) Policies
-- For MVP, we'll use permissive policies. In production, add proper authentication.

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE stakeholders ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE decision_memos ENABLE ROW LEVEL SECURITY;
ALTER TABLE commitments ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (MVP mode)
-- In production, replace with proper auth policies

CREATE POLICY "Allow all on projects" ON projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on stakeholders" ON stakeholders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on interviews" ON interviews FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on decision_memos" ON decision_memos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on commitments" ON commitments FOR ALL USING (true) WITH CHECK (true);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_stakeholders_updated_at ON stakeholders;
CREATE TRIGGER update_stakeholders_updated_at
  BEFORE UPDATE ON stakeholders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_decision_memos_updated_at ON decision_memos;
CREATE TRIGGER update_decision_memos_updated_at
  BEFORE UPDATE ON decision_memos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
