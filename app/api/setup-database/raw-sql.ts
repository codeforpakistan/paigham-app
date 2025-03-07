import { supabase } from '@/lib/supabase';

// Function to create tables using raw SQL queries via REST API
export async function createTablesWithRawSql() {
  try {
    // Create a helper function to execute SQL
    const executeSql = async (sql: string) => {
      try {
        // Try using the REST API
        const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''}`,
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            query: sql
          })
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`SQL execution failed: ${errorText}`);
        }
        
        return { success: true };
      } catch (error) {
        console.error('SQL execution error:', error);
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        };
      }
    };

    // Create tables using the helper function
    const results = {
      uuid: await executeSql(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`),
      
      companies: await executeSql(`
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
      `),
      
      companySettings: await executeSql(`
        CREATE TABLE IF NOT EXISTS company_settings (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
          sendgrid_api_key TEXT,
          default_sender_email TEXT,
          default_sender_name TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `),
      
      profiles: await executeSql(`
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
      `),
      
      emailTemplates: await executeSql(`
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
      `),
      
      smsTemplates: await executeSql(`
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
      `),
      
      campaigns: await executeSql(`
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
      `)
    };

    // Check if any of the operations failed
    const failures = Object.entries(results).filter(([_, result]) => !result.success);
    
    if (failures.length > 0) {
      return { 
        success: false, 
        error: `Failed to create tables: ${failures.map(([table]) => table).join(', ')}`,
        details: failures.map(([table, result]) => ({ table, error: (result as any).error }))
      };
    }

    return { 
      success: true,
      results
    };
  } catch (error) {
    console.error('Error creating tables with raw SQL:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
} 