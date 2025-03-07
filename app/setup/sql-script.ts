export const setupSqlScript = `
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create companies table
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  logo_url TEXT,
  address TEXT,
  phone TEXT,
  website TEXT,
  industry TEXT,
  credits_balance INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create company_settings table
CREATE TABLE IF NOT EXISTS company_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  sendgrid_api_key TEXT,
  default_sender_email TEXT,
  default_sender_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create email_templates table
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  variables TEXT[] DEFAULT '{}',
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sms_templates table
CREATE TABLE IF NOT EXISTS sms_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  variables TEXT[] DEFAULT '{}',
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('email', 'sms')),
  status TEXT NOT NULL CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'failed')),
  template_id UUID,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  scheduled_for TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  recipient_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  credits_used INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies for tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- Create policies for companies
CREATE POLICY "Users can view their own company"
  ON companies FOR SELECT
  USING (id IN (
    SELECT company_id FROM profiles
    WHERE id = auth.uid()
  ));

-- Create policies for company_settings
CREATE POLICY "Users can view their own company settings"
  ON company_settings FOR SELECT
  USING (company_id IN (
    SELECT company_id FROM profiles
    WHERE id = auth.uid()
  ));

-- Create policies for email_templates
CREATE POLICY "Users can view their own company's email templates"
  ON email_templates FOR SELECT
  USING (company_id IN (
    SELECT company_id FROM profiles
    WHERE id = auth.uid()
  ));

-- Create policies for sms_templates
CREATE POLICY "Users can view their own company's SMS templates"
  ON sms_templates FOR SELECT
  USING (company_id IN (
    SELECT company_id FROM profiles
    WHERE id = auth.uid()
  ));

-- Create policies for campaigns
CREATE POLICY "Users can view their own company's campaigns"
  ON campaigns FOR SELECT
  USING (company_id IN (
    SELECT company_id FROM profiles
    WHERE id = auth.uid()
  ));

-- Create a sample company for testing
INSERT INTO companies (name, credits_balance)
VALUES ('Demo Company', 1000)
ON CONFLICT DO NOTHING;

-- Get the ID of the demo company
DO $$
DECLARE
  demo_company_id UUID;
BEGIN
  SELECT id INTO demo_company_id FROM companies WHERE name = 'Demo Company' LIMIT 1;
  
  -- Create company settings for the demo company
  INSERT INTO company_settings (company_id, default_sender_email, default_sender_name)
  VALUES (demo_company_id, 'demo@example.com', 'Demo Sender')
  ON CONFLICT DO NOTHING;
END $$;
`; 