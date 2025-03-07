import { createClient } from '@supabase/supabase-js';

// These environment variables need to be set in your .env.local file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Log configuration for debugging
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase configuration error: Missing environment variables');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Set' : 'Missing');
}

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Log a successful initialization
console.log('Supabase client initialized with URL:', supabaseUrl);

// Utility function to check if required tables exist
export async function checkDatabaseTables() {
  try {
    console.log('Checking database tables...');
    
    // Check if email_templates table exists
    const { data: emailTemplates, error: emailTemplatesError } = await supabase
      .from('email_templates')
      .select('id')
      .limit(1);
      
    if (emailTemplatesError) {
      console.error('Error checking email_templates table:', emailTemplatesError);
      return { 
        success: false, 
        errors: [{ table: 'email_templates', error: emailTemplatesError.message }] 
      };
    }
    
    // Check if campaigns table exists
    const { data: campaigns, error: campaignsError } = await supabase
      .from('campaigns')
      .select('id')
      .limit(1);
      
    if (campaignsError) {
      console.error('Error checking campaigns table:', campaignsError);
      return { 
        success: false, 
        errors: [{ table: 'campaigns', error: campaignsError.message }] 
      };
    }
    
    // Check if company_settings table exists
    const { data: companySettings, error: companySettingsError } = await supabase
      .from('company_settings')
      .select('id')
      .limit(1);
      
    if (companySettingsError) {
      console.error('Error checking company_settings table:', companySettingsError);
      return { 
        success: false, 
        errors: [{ table: 'company_settings', error: companySettingsError.message }] 
      };
    }
    
    console.log('All required tables exist');
    return { success: true };
  } catch (error) {
    console.error('Error checking database tables:', error);
    return { 
      success: false, 
      errors: [{ table: 'general', error: error instanceof Error ? error.message : 'Unknown error' }] 
    };
  }
}

// Types for our database tables
export type Company = {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  logo_url?: string;
  address?: string;
  phone?: string;
  website?: string;
  industry?: string;
  credits_balance: number;
};

export type CompanySettings = {
  id: string;
  company_id: string;
  sendgrid_api_key?: string;
  default_sender_email?: string;
  default_sender_name?: string;
  created_at: string;
  updated_at: string;
};

export type User = {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
  company_id: string;
  first_name?: string;
  last_name?: string;
  role: 'admin' | 'user';
  avatar_url?: string;
};

export type EmailTemplate = {
  id: string;
  name: string;
  subject: string;
  content: string;
  created_at: string;
  updated_at: string;
  company_id: string;
  created_by: string;
  variables: string[];
};

export type SmsTemplate = {
  id: string;
  name: string;
  content: string;
  created_at: string;
  updated_at: string;
  company_id: string;
  created_by: string;
  variables: string[];
};

export type Contact = {
  id: string;
  email?: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
  created_at: string;
  updated_at: string;
  company_id: string;
  custom_fields?: Record<string, string>;
};

export type ContactList = {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  company_id: string;
  contact_count: number;
};

export type ContactListMembership = {
  id: string;
  contact_id: string;
  list_id: string;
  created_at: string;
};

export type Campaign = {
  id: string;
  name: string;
  type: 'email' | 'sms';
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
  template_id: string;
  company_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  scheduled_for?: string;
  sent_at?: string;
  recipient_count: number;
  opened_count?: number;
  clicked_count?: number;
  failed_count?: number;
  credits_used: number;
  error_message?: string;
};

export type CreditTransaction = {
  id: string;
  company_id: string;
  amount: number;
  type: 'purchase' | 'usage' | 'refund' | 'bonus';
  description: string;
  created_at: string;
  campaign_id?: string;
  reference_id?: string;
}; 