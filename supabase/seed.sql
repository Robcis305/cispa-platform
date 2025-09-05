-- CISPA Seed Data for Development
-- Creates sample data for testing and development

-- Insert sample questions for the core assessment
INSERT INTO questions (question_text, question_type, dimension, module, weight) VALUES 
-- Financial Dimension
('What is your annual recurring revenue (ARR)?', 'number', 'Financial', 'core', 2.0),
('What is your gross margin percentage?', 'number', 'Financial', 'core', 1.8),
('How many months of runway do you have?', 'number', 'Financial', 'core', 1.5),
('Do you have audited financial statements?', 'multiple_choice', 'Financial', 'core', 1.2),

-- Operational Dimension
('How would you describe your key operational processes?', 'text', 'Operational', 'core', 1.5),
('Do you have documented standard operating procedures?', 'multiple_choice', 'Operational', 'core', 1.3),
('What is your customer acquisition cost (CAC)?', 'number', 'Operational', 'core', 1.8),
('What is your customer lifetime value (LTV)?', 'number', 'Operational', 'core', 1.8),

-- Strategic Dimension
('What is your primary competitive advantage?', 'text', 'Strategic', 'core', 2.0),
('How do you differentiate from competitors?', 'text', 'Strategic', 'core', 1.7),
('What is your go-to-market strategy?', 'text', 'Strategic', 'core', 1.6),
('Do you have intellectual property protection?', 'multiple_choice', 'Strategic', 'core', 1.4),

-- Technology Dimension
('How would you describe your technology stack?', 'text', 'Technology', 'core', 1.5),
('Do you have documented technical architecture?', 'multiple_choice', 'Technology', 'core', 1.3),
('What is your approach to data security?', 'text', 'Technology', 'core', 1.8),
('Do you have disaster recovery procedures?', 'multiple_choice', 'Technology', 'core', 1.4),

-- Human Capital Dimension
('How many full-time employees do you have?', 'number', 'Human Capital', 'core', 1.2),
('Do you have documented employee handbooks?', 'multiple_choice', 'Human Capital', 'core', 1.1),
('What is your employee retention rate?', 'number', 'Human Capital', 'core', 1.5),
('Do you have key person insurance?', 'multiple_choice', 'Human Capital', 'core', 1.3),

-- Market Position Dimension
('What is your total addressable market (TAM)?', 'number', 'Market Position', 'core', 1.8),
('What market share do you currently hold?', 'number', 'Market Position', 'core', 1.6),
('Who are your primary customer segments?', 'text', 'Market Position', 'core', 1.7),
('How do you measure customer satisfaction?', 'text', 'Market Position', 'core', 1.4);

-- Insert additional questions for optional modules

-- Marketing Module Questions
INSERT INTO questions (question_text, question_type, dimension, module, weight) VALUES 
('What is your customer acquisition strategy?', 'text', 'Strategic', 'marketing', 1.5),
('What are your primary marketing channels?', 'text', 'Strategic', 'marketing', 1.4),
('Do you track marketing ROI by channel?', 'multiple_choice', 'Strategic', 'marketing', 1.6),
('What is your brand recognition in the market?', 'text', 'Market Position', 'marketing', 1.3);

-- Technology Module Questions  
INSERT INTO questions (question_text, question_type, dimension, module, weight) VALUES 
('Do you have a dedicated CTO or technical lead?', 'multiple_choice', 'Human Capital', 'technology', 1.4),
('What is your technology development methodology?', 'text', 'Technology', 'technology', 1.5),
('Do you have automated testing procedures?', 'multiple_choice', 'Technology', 'technology', 1.3),
('How do you handle software updates and deployments?', 'text', 'Technology', 'technology', 1.4);

-- Investor Module Questions
INSERT INTO questions (question_text, question_type, dimension, module, weight) VALUES 
('What type of investor are you seeking?', 'multiple_choice', 'Strategic', 'investor', 1.6),
('What is your preferred investment structure?', 'text', 'Financial', 'investor', 1.5),
('Are you open to strategic investors?', 'multiple_choice', 'Strategic', 'investor', 1.4),
('What level of investor involvement do you want?', 'text', 'Strategic', 'investor', 1.3);

-- Insert sample investors for the matching system
INSERT INTO investors (fund_name, investment_focus, check_size_min, check_size_max, geographic_focus, contact_info) VALUES 
('Acme Ventures', 
 '{"sectors": ["SaaS", "FinTech", "HealthTech"], "stages": ["Series A", "Series B"], "focus": "B2B software"}',
 1000000, 10000000, 
 '["United States", "Canada"]',
 '{"email": "info@acmeventures.com", "website": "https://acmeventures.com"}'),

('TechGrowth Capital', 
 '{"sectors": ["AI/ML", "Enterprise Software", "Cybersecurity"], "stages": ["Seed", "Series A"], "focus": "Technology-first companies"}',
 500000, 5000000,
 '["United States", "Europe"]',
 '{"email": "investments@techgrowth.com", "website": "https://techgrowth.com"}'),

('Strategic Partners Fund', 
 '{"sectors": ["Healthcare", "Education", "Manufacturing"], "stages": ["Series A", "Series B", "Growth"], "focus": "Market-leading companies"}',
 2000000, 25000000,
 '["North America"]',
 '{"email": "partners@spfund.com", "website": "https://strategicpartners.com"}'),

('Early Stage Ventures', 
 '{"sectors": ["Consumer", "Mobile", "E-commerce"], "stages": ["Pre-Seed", "Seed"], "focus": "Consumer-focused startups"}',
 100000, 2000000,
 '["United States", "Latin America"]',
 '{"email": "hello@earlystage.vc", "website": "https://earlystage.vc"}'),

('Global Growth Partners', 
 '{"sectors": ["SaaS", "Infrastructure", "DevTools"], "stages": ["Series B", "Series C", "Growth"], "focus": "Scaling technology companies"}',
 5000000, 50000000,
 '["Global"]',
 '{"email": "team@globalgrowth.com", "website": "https://globalgrowth.com"}');

-- Create a sample admin user (this would normally be created through Supabase Auth)
-- Note: In production, users are created through Supabase Auth, not directly in the users table
-- This is just for development testing
INSERT INTO users (id, email, role, company_name, subscription_tier) VALUES 
('00000000-0000-0000-0000-000000000001', 'admin@cispa.com', 'admin', 'CISPA Platform', 'enterprise'),
('00000000-0000-0000-0000-000000000002', 'advisor@test.com', 'advisor', 'Test Advisory Firm', 'pro'),
('00000000-0000-0000-0000-000000000003', 'founder@startup.com', 'founder', 'Startup Inc', 'free');

-- Create a sample assessment for testing
INSERT INTO assessments (id, company_name, advisor_id, founder_id, status) VALUES 
('10000000-0000-0000-0000-000000000001', 'Demo Company', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', 'in_progress');