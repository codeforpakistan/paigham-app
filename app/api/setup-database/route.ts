import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createSqlFunctions } from './sql-functions';
import { createTablesDirectly } from './direct-sql';
import { createTablesWithRawSql } from './raw-sql';

export async function POST() {
  try {
    // Try the raw SQL approach first
    console.log('Attempting to create tables using raw SQL...');
    const rawSqlResult = await createTablesWithRawSql();
    
    if (rawSqlResult.success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Database tables created successfully using raw SQL' 
      });
    }
    
    console.log('Raw SQL approach failed:', rawSqlResult.error);
    console.log('Trying direct SQL approach...');
    
    // Try the direct SQL approach next
    const directResult = await createTablesDirectly();
    
    if (directResult.success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Database tables created successfully using direct SQL' 
      });
    }
    
    console.log('Direct SQL approach failed, trying stored procedures approach...');
    
    // If direct approach fails, try the stored procedures approach
    const functionsResult = await createSqlFunctions();
    if (!functionsResult.success) {
      return NextResponse.json({ 
        error: `Failed to create SQL functions: ${functionsResult.error}` 
      }, { status: 500 });
    }

    // Create companies table
    const { error: companiesError } = await supabase.rpc('create_companies_table');
    if (companiesError && !companiesError.message.includes('already exists')) {
      return NextResponse.json({ error: `Failed to create companies table: ${companiesError.message}` }, { status: 500 });
    }

    // Create company_settings table
    const { error: settingsError } = await supabase.rpc('create_company_settings_table');
    if (settingsError && !settingsError.message.includes('already exists')) {
      return NextResponse.json({ error: `Failed to create company_settings table: ${settingsError.message}` }, { status: 500 });
    }

    // Create profiles table
    const { error: profilesError } = await supabase.rpc('create_profiles_table');
    if (profilesError && !profilesError.message.includes('already exists')) {
      return NextResponse.json({ error: `Failed to create profiles table: ${profilesError.message}` }, { status: 500 });
    }

    // Create email_templates table
    const { error: emailTemplatesError } = await supabase.rpc('create_email_templates_table');
    if (emailTemplatesError && !emailTemplatesError.message.includes('already exists')) {
      return NextResponse.json({ error: `Failed to create email_templates table: ${emailTemplatesError.message}` }, { status: 500 });
    }

    // Create sms_templates table
    const { error: smsTemplatesError } = await supabase.rpc('create_sms_templates_table');
    if (smsTemplatesError && !smsTemplatesError.message.includes('already exists')) {
      return NextResponse.json({ error: `Failed to create sms_templates table: ${smsTemplatesError.message}` }, { status: 500 });
    }

    // Create campaigns table
    const { error: campaignsError } = await supabase.rpc('create_campaigns_table');
    if (campaignsError && !campaignsError.message.includes('already exists')) {
      return NextResponse.json({ error: `Failed to create campaigns table: ${campaignsError.message}` }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Database tables created successfully using stored procedures' });
  } catch (error) {
    console.error('Error setting up database:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 