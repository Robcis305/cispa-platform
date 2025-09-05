-- Row Level Security Policies for CISPA
-- Implements security model from architecture document

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE investors ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Helper function to get user role
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS TEXT AS $$
BEGIN
  RETURN (SELECT role FROM users WHERE id = user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get current user's role
CREATE OR REPLACE FUNCTION current_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN get_user_role(auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Users table policies
-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (id = auth.uid());

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (id = auth.uid());

-- Admins can view all users
CREATE POLICY "Admins can view all users" ON users
  FOR ALL USING (current_user_role() = 'admin');

-- Assessments table policies
-- Advisors can access their own assessments
CREATE POLICY "Advisors can access own assessments" ON assessments
  FOR ALL USING (advisor_id = auth.uid());

-- Founders can view assessments they're associated with
CREATE POLICY "Founders can view assigned assessments" ON assessments
  FOR SELECT USING (founder_id = auth.uid());

-- Admins can view all assessments
CREATE POLICY "Admins can view all assessments" ON assessments
  FOR SELECT USING (current_user_role() = 'admin');

-- Answers table policies
-- Users can access answers for assessments they have access to
CREATE POLICY "Users can access answers for their assessments" ON answers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM assessments 
      WHERE assessments.id = answers.assessment_id 
      AND (assessments.advisor_id = auth.uid() OR assessments.founder_id = auth.uid())
    )
  );

-- Reports table policies
-- Users can access reports for assessments they have access to
CREATE POLICY "Users can access reports for their assessments" ON reports
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM assessments 
      WHERE assessments.id = reports.assessment_id 
      AND (assessments.advisor_id = auth.uid() OR assessments.founder_id = auth.uid())
    )
  );

-- Shares table policies
-- Users who created the share can manage it
CREATE POLICY "Share creators can manage shares" ON shares
  FOR ALL USING (shared_by = auth.uid());

-- Users can view shares for reports they have access to
CREATE POLICY "Users can view shares for accessible reports" ON shares
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM reports
      JOIN assessments ON reports.assessment_id = assessments.id
      WHERE reports.id = shares.report_id 
      AND (assessments.advisor_id = auth.uid() OR assessments.founder_id = auth.uid())
    )
  );

-- Investors table policies (read-only for most users)
-- All authenticated users can view investors
CREATE POLICY "Authenticated users can view investors" ON investors
  FOR SELECT TO authenticated USING (true);

-- Only admins can modify investors
CREATE POLICY "Only admins can modify investors" ON investors
  FOR ALL USING (current_user_role() = 'admin');

-- Jobs table policies
-- Users can only see their own jobs
CREATE POLICY "Users can view their own jobs" ON jobs
  FOR SELECT USING (
    input_data->>'user_id' = auth.uid()::text
  );

-- Only system can create/update jobs (this will be handled by Edge Functions)
-- Questions table - read-only for all authenticated users
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view questions" ON questions
  FOR SELECT TO authenticated USING (true);

-- Only admins can modify questions
CREATE POLICY "Only admins can modify questions" ON questions
  FOR ALL USING (current_user_role() = 'admin');

-- Function to check if user can access shared report
CREATE OR REPLACE FUNCTION can_access_shared_report(token TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  share_record RECORD;
BEGIN
  SELECT * INTO share_record FROM shares 
  WHERE share_token = token 
    AND revoked_at IS NULL 
    AND (expiration_date IS NULL OR expiration_date > NOW());
    
  RETURN share_record.id IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policy for accessing shared reports via token
CREATE POLICY "Public can access valid shared reports" ON shares
  FOR SELECT USING (can_access_shared_report(share_token));