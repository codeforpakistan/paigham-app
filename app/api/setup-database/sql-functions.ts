import { supabase } from '@/lib/supabase';

// Function to create SQL functions in Supabase
export async function createSqlFunctions() {
  try {
    // Create companies table function
    await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE OR REPLACE FUNCTION create_companies_table()
        RETURNS void AS $$
        BEGIN
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
        END;
        $$ LANGUAGE plpgsql;
      `
    });

    // Create company_settings table function
    await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE OR REPLACE FUNCTION create_company_settings_table()
        RETURNS void AS $$
        BEGIN
          CREATE TABLE IF NOT EXISTS company_settings (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
            sendgrid_api_key TEXT,
            default_sender_email TEXT,
            default_sender_name TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        END;
        $$ LANGUAGE plpgsql;
      `
    });

    // Create profiles table function
    await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE OR REPLACE FUNCTION create_profiles_table()
        RETURNS void AS $$
        BEGIN
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
        END;
        $$ LANGUAGE plpgsql;
      `
    });

    // Create email_templates table function
    await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE OR REPLACE FUNCTION create_email_templates_table()
        RETURNS void AS $$
        BEGIN
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
        END;
        $$ LANGUAGE plpgsql;
      `
    });

    // Create sms_templates table function
    await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE OR REPLACE FUNCTION create_sms_templates_table()
        RETURNS void AS $$
        BEGIN
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
        END;
        $$ LANGUAGE plpgsql;
      `
    });

    // Create campaigns table function
    await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE OR REPLACE FUNCTION create_campaigns_table()
        RETURNS void AS $$
        BEGIN
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
        END;
        $$ LANGUAGE plpgsql;
      `
    });

    // Create exec_sql function if it doesn't exist
    await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE OR REPLACE FUNCTION exec_sql(sql_query TEXT)
        RETURNS void AS $$
        BEGIN
          EXECUTE sql_query;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
      `
    });

    return { success: true };
  } catch (error) {
    console.error('Error creating SQL functions:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
} 