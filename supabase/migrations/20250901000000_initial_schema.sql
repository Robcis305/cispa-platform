-- CISPA Database Schema
-- Based on architecture document

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table with role-based access
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('advisor', 'founder', 'admin')),
  company_name TEXT,
  profile_data JSONB DEFAULT '{}',
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assessments with comprehensive tracking
CREATE TABLE assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  advisor_id UUID REFERENCES users(id) NOT NULL,
  founder_id UUID REFERENCES users(id),
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'archived')),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  overall_readiness_score NUMERIC(5,2),
  dimension_scores JSONB DEFAULT '{}',
  recommendations JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Questions with dynamic branching
CREATE TABLE questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('text', 'number', 'multiple_choice', 'file_upload')),
  dimension TEXT NOT NULL,
  module TEXT DEFAULT 'core' CHECK (module IN ('core', 'marketing', 'technology', 'investor')),
  weight NUMERIC(3,2) DEFAULT 1.0,
  branching_conditions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Answers with full audit trail
CREATE TABLE answers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES questions(id) NOT NULL,
  answer_value TEXT NOT NULL,
  answer_metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(assessment_id, question_id)
);

-- Reports with version tracking
CREATE TABLE reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE NOT NULL,
  report_type TEXT NOT NULL CHECK (report_type IN ('pdf', 'powerpoint')),
  file_path TEXT NOT NULL,
  generated_by UUID REFERENCES users(id) NOT NULL,
  report_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Secure sharing with expiration
CREATE TABLE shares (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID REFERENCES reports(id) ON DELETE CASCADE NOT NULL,
  shared_by UUID REFERENCES users(id) NOT NULL,
  share_token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'base64'),
  permissions TEXT DEFAULT 'view' CHECK (permissions IN ('view', 'download')),
  expiration_date TIMESTAMP WITH TIME ZONE,
  email_restrictions JSONB DEFAULT '[]',
  access_count INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  revoked_at TIMESTAMP WITH TIME ZONE
);

-- Investor database for matching
CREATE TABLE investors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  fund_name TEXT NOT NULL,
  investment_focus JSONB DEFAULT '{}',
  check_size_min NUMERIC(12,2),
  check_size_max NUMERIC(12,2),
  geographic_focus JSONB DEFAULT '[]',
  contact_info JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Background job tracking
CREATE TABLE jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_type TEXT NOT NULL,
  status TEXT DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed')),
  input_data JSONB DEFAULT '{}',
  output_data JSONB DEFAULT '{}',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for performance
CREATE INDEX idx_assessments_advisor_id ON assessments(advisor_id);
CREATE INDEX idx_assessments_status ON assessments(status);
CREATE INDEX idx_answers_assessment_id ON answers(assessment_id);
CREATE INDEX idx_reports_assessment_id ON reports(assessment_id);
CREATE INDEX idx_shares_token ON shares(share_token) WHERE revoked_at IS NULL;
CREATE INDEX idx_jobs_status ON jobs(status);

-- Update trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add update triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assessments_updated_at BEFORE UPDATE ON assessments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON questions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_answers_updated_at BEFORE UPDATE ON answers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_investors_updated_at BEFORE UPDATE ON investors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();