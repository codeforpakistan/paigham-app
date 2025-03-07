import sgMail from '@sendgrid/mail';
import { supabase } from './supabase';

export interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: any[];
  from?: string;
}

export interface SendResult {
  success: number;
  failed: number;
  failures: Array<{
    email: string;
    error: string;
  }>;
}

/**
 * Personalizes an email template with contact data
 */
export function personalizeEmail(template: string, data: Record<string, string>) {
  let result = template;
  
  // Replace all variables in the format {variable_name}
  Object.entries(data).forEach(([key, value]) => {
    const regex = new RegExp(`{${key}}`, 'g');
    result = result.replace(regex, value || '');
  });
  
  return result;
}

/**
 * Sends a single email using the SendGrid API
 */
export async function sendEmail(emailData: EmailData): Promise<boolean> {
  try {
    // Use the API route instead of direct SendGrid call
    const response = await fetch('/api/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text,
        from: emailData.from
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

/**
 * Sends multiple emails in bulk using SendGrid
 */
export async function sendBulkEmails(
  campaignId: string,
  emails: EmailData[],
  companyId: string
): Promise<{
  success: number;
  failed: number;
  total?: number;
  error?: string;
}> {
  try {
    // Call the API route for sending bulk emails
    const response = await fetch('/api/email/send-bulk', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        campaignId,
        emails,
        companyId
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    return {
      success: result.success || 0,
      failed: result.failed || 0,
      total: result.total || emails.length
    };
  } catch (error) {
    console.error('Error sending bulk emails:', error);
    
    // Update campaign status to failed
    await supabase
      .from('campaigns')
      .update({
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown error'
      })
      .eq('id', campaignId);
      
    return {
      success: 0,
      failed: emails.length,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
} 