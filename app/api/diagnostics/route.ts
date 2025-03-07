import { NextResponse } from 'next/server';
import { supabase, checkDatabaseTables } from '@/lib/supabase';

export async function GET() {
  try {
    // Check Supabase connection
    let connectionStatus = 'connected';
    let connectionError = null;
    
    try {
      // Try to query a non-existent table to test connection
      const { error } = await supabase
        .from('_diagnose')
        .select('*')
        .limit(1);
        
      // If we get a "relation does not exist" error, that's actually good
      // It means we can connect to the database
      if (error && error.code !== '42P01') {
        connectionStatus = 'error';
        connectionError = {
          code: error.code,
          message: error.message,
          details: error.details
        };
      }
    } catch (err) {
      connectionStatus = 'error';
      connectionError = {
        message: err instanceof Error ? err.message : 'Unknown connection error'
      };
    }

    // Check if required tables exist
    const tablesCheck = await checkDatabaseTables();

    // Get Supabase URL (redacted for security)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const redactedUrl = supabaseUrl ? 
      supabaseUrl.replace(/^(https?:\/\/[^.]+).*$/, '$1.xxx.supabase.co') : 
      'Not configured';

    // Check if API key is set (don't return the actual key)
    const hasApiKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    return NextResponse.json({
      supabase: {
        url: redactedUrl,
        hasApiKey,
        connectionStatus,
        connectionError
      },
      tables: tablesCheck,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Diagnostics error:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 