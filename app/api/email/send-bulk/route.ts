import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendEmail } from '@/lib/server/email-provider';

// Use Node.js runtime instead of Edge
export const runtime = 'nodejs';

// Define email interface
interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: any[];
}

export async function POST(request: Request) {
  try {
    const { campaignId, emails, companyId } = await request.json();
    
    if (!campaignId || !emails || !emails.length || !companyId) {
      return NextResponse.json(
        { error: 'Missing required fields: campaignId, emails, or companyId' },
        { status: 400 }
      );
    }

    // Get company settings to check for sender email
    const { data: companySettings, error: settingsError } = await supabase
      .from('company_settings')
      .select('sendgrid_api_key, default_sender_email, default_sender_name')
      .eq('company_id', companyId)
      .single();

    if (settingsError) {
      console.error('Error fetching company settings:', settingsError);
      return NextResponse.json(
        { error: `Failed to fetch company settings: ${settingsError.message}` },
        { status: 500 }
      );
    }

    // Set default sender email if not provided in emails
    const defaultSenderEmail = companySettings?.default_sender_email || process.env.DEFAULT_SENDER_EMAIL || 'noreply@example.com';
    const defaultSenderName = companySettings?.default_sender_name || process.env.DEFAULT_SENDER_NAME || 'Paigham';
    const from = {
      email: defaultSenderEmail,
      name: defaultSenderName
    };

    console.log(`Sending ${emails.length} emails...`);
    console.log('Sample email:', emails[0]);

    // Send emails in batches of 100
    const batchSize = 100;
    let successCount = 0;
    let failedCount = 0;

    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);
      
      for (const email of batch) {
        try {
          await sendEmail({
            to: email.to,
            subject: email.subject,
            html: email.html,
            text: email.text,
            from,
            attachments: email.attachments
          });
          successCount++;
        } catch (error) {
          console.error('Email send error:', error);
          failedCount++;
        }
      }
    }

    // Update campaign status
    await supabase
      .from('campaigns')
      .update({
        status: successCount > 0 ? (failedCount > 0 ? 'partial' : 'sent') : 'failed',
        sent_at: new Date().toISOString(),
        opened_count: 0,
        clicked_count: 0,
        failed_count: failedCount
      })
      .eq('id', campaignId);

    return NextResponse.json({
      success: successCount,
      failed: failedCount,
      total: emails.length
    });
  } catch (error) {
    console.error('Error sending bulk emails:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 