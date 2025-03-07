-- Enable RLS (Row Level Security)
alter table if exists public.profiles enable row level security;

-- Create companies table
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  logo_url TEXT,
  address TEXT,
  phone TEXT,
  website TEXT,
  industry TEXT,
  credits_balance INTEGER NOT NULL DEFAULT 0
);

-- Create company_settings table
CREATE TABLE IF NOT EXISTS public.company_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  sendgrid_api_key TEXT,
  default_sender_email TEXT,
  default_sender_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(company_id)
);

-- Create profiles table (extends the auth.users table)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  company_id UUID REFERENCES public.companies(id),
  first_name TEXT,
  last_name TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  avatar_url TEXT
);

-- Create email_templates table
CREATE TABLE IF NOT EXISTS public.email_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  variables TEXT[] DEFAULT '{}'::TEXT[]
);

-- Create sms_templates table
CREATE TABLE IF NOT EXISTS public.sms_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  variables TEXT[] DEFAULT '{}'::TEXT[]
);

-- Create contacts table
CREATE TABLE IF NOT EXISTS public.contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT,
  phone TEXT,
  first_name TEXT,
  last_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  custom_fields JSONB DEFAULT '{}'::JSONB
);

-- Create contact_lists table
CREATE TABLE IF NOT EXISTS public.contact_lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  contact_count INTEGER NOT NULL DEFAULT 0
);

-- Create contact_list_memberships table (junction table)
CREATE TABLE IF NOT EXISTS public.contact_list_memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  list_id UUID NOT NULL REFERENCES public.contact_lists(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(contact_id, list_id)
);

-- Create campaigns table
CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('email', 'sms')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'failed')),
  template_id UUID NOT NULL,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  scheduled_for TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  recipient_count INTEGER NOT NULL DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  credits_used INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,
  CONSTRAINT template_id_check CHECK (
    (type = 'email' AND EXISTS (SELECT 1 FROM public.email_templates WHERE id = template_id)) OR
    (type = 'sms' AND EXISTS (SELECT 1 FROM public.sms_templates WHERE id = template_id))
  )
);

-- Create credit_transactions table
CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('purchase', 'usage', 'refund', 'bonus')),
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  reference_id TEXT
);

-- Create campaign_recipients table
CREATE TABLE IF NOT EXISTS public.campaign_recipients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'opened', 'clicked', 'failed')),
  sent_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  UNIQUE(campaign_id, contact_id)
);

-- Create functions and triggers to update contact_count in contact_lists
CREATE OR REPLACE FUNCTION update_contact_list_count() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.contact_lists
    SET contact_count = contact_count + 1
    WHERE id = NEW.list_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.contact_lists
    SET contact_count = contact_count - 1
    WHERE id = OLD.list_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_contact_list_count_trigger
AFTER INSERT OR DELETE ON public.contact_list_memberships
FOR EACH ROW EXECUTE FUNCTION update_contact_list_count();

-- Create function and trigger to update credits_balance in companies
CREATE OR REPLACE FUNCTION update_company_credits() RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.companies
  SET credits_balance = credits_balance + NEW.amount
  WHERE id = NEW.company_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_company_credits_trigger
AFTER INSERT ON public.credit_transactions
FOR EACH ROW EXECUTE FUNCTION update_company_credits();

-- Create function and trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_companies_updated_at
BEFORE UPDATE ON public.companies
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_templates_updated_at
BEFORE UPDATE ON public.email_templates
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sms_templates_updated_at
BEFORE UPDATE ON public.sms_templates
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contacts_updated_at
BEFORE UPDATE ON public.contacts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contact_lists_updated_at
BEFORE UPDATE ON public.contact_lists
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at
BEFORE UPDATE ON public.campaigns
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_settings_updated_at
BEFORE UPDATE ON public.company_settings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create RLS policies
-- Companies: Users can only see their own company
CREATE POLICY "Users can view their own company"
  ON public.companies
  FOR SELECT
  USING (id IN (
    SELECT company_id FROM public.profiles WHERE id = auth.uid()
  ));

-- Company Settings: Users can only see settings for their own company
CREATE POLICY "Users can view settings for their own company"
  ON public.company_settings
  FOR SELECT
  USING (company_id IN (
    SELECT company_id FROM public.profiles WHERE id = auth.uid()
  ));

-- Profiles: Users can only see profiles in their company
CREATE POLICY "Users can view profiles in their company"
  ON public.profiles
  FOR SELECT
  USING (company_id IN (
    SELECT company_id FROM public.profiles WHERE id = auth.uid()
  ));

-- Email Templates: Users can only see templates in their company
CREATE POLICY "Users can view email templates in their company"
  ON public.email_templates
  FOR SELECT
  USING (company_id IN (
    SELECT company_id FROM public.profiles WHERE id = auth.uid()
  ));

-- SMS Templates: Users can only see templates in their company
CREATE POLICY "Users can view sms templates in their company"
  ON public.sms_templates
  FOR SELECT
  USING (company_id IN (
    SELECT company_id FROM public.profiles WHERE id = auth.uid()
  ));

-- Contacts: Users can only see contacts in their company
CREATE POLICY "Users can view contacts in their company"
  ON public.contacts
  FOR SELECT
  USING (company_id IN (
    SELECT company_id FROM public.profiles WHERE id = auth.uid()
  ));

-- Contact Lists: Users can only see lists in their company
CREATE POLICY "Users can view contact lists in their company"
  ON public.contact_lists
  FOR SELECT
  USING (company_id IN (
    SELECT company_id FROM public.profiles WHERE id = auth.uid()
  ));

-- Campaigns: Users can only see campaigns in their company
CREATE POLICY "Users can view campaigns in their company"
  ON public.campaigns
  FOR SELECT
  USING (company_id IN (
    SELECT company_id FROM public.profiles WHERE id = auth.uid()
  ));

-- Credit Transactions: Users can only see transactions in their company
CREATE POLICY "Users can view credit transactions in their company"
  ON public.credit_transactions
  FOR SELECT
  USING (company_id IN (
    SELECT company_id FROM public.profiles WHERE id = auth.uid()
  ));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_company_id ON public.profiles(company_id);
CREATE INDEX IF NOT EXISTS idx_email_templates_company_id ON public.email_templates(company_id);
CREATE INDEX IF NOT EXISTS idx_sms_templates_company_id ON public.sms_templates(company_id);
CREATE INDEX IF NOT EXISTS idx_contacts_company_id ON public.contacts(company_id);
CREATE INDEX IF NOT EXISTS idx_contact_lists_company_id ON public.contact_lists(company_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_company_id ON public.campaigns(company_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_company_id ON public.credit_transactions(company_id);
CREATE INDEX IF NOT EXISTS idx_campaign_recipients_campaign_id ON public.campaign_recipients(campaign_id);
CREATE INDEX IF NOT EXISTS idx_contact_list_memberships_list_id ON public.contact_list_memberships(list_id);
CREATE INDEX IF NOT EXISTS idx_contact_list_memberships_contact_id ON public.contact_list_memberships(contact_id);
CREATE INDEX IF NOT EXISTS idx_company_settings_company_id ON public.company_settings(company_id); 