import { supabase } from '@/lib/supabase';

// Function to create tables directly with SQL
export async function createTablesDirectly() {
  try {
    // Enable UUID extension if not already enabled
    await supabase.from('_exec_sql').insert({
      query: `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`
    });

    // Create companies table
    await supabase.from('_exec_sql').insert({
      query: `
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
      `
    });

    // Create company_settings table
    await supabase.from('_exec_sql').insert({
      query: `
        CREATE TABLE IF NOT EXISTS company_settings (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
          sendgrid_api_key TEXT,
          default_sender_email TEXT,
          default_sender_name TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    // Create profiles table
    await supabase.from('_exec_sql').insert({
      query: `
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
      `
    });

    // Create email_templates table
    await supabase.from('_exec_sql').insert({
      query: `
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
      `
    });

    // Create sms_templates table
    await supabase.from('_exec_sql').insert({
      query: `
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
      `
    });

    // Create campaigns table
    await supabase.from('_exec_sql').insert({
      query: `
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
      `
    });

    return { success: true };
  } catch (error) {
    console.error('Error creating tables directly:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
} 