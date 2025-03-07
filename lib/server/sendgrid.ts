import sgMail from '@sendgrid/mail';
import { MailDataRequired } from '@sendgrid/mail';
import 'server-only';

// Initialize SendGrid with API key only on the server
let initialized = false;

function initializeSendGrid() {
  if (initialized) return;
  
  if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    initialized = true;
  } else {
    console.error('SENDGRID_API_KEY is not set in environment variables');
    throw new Error('SendGrid API key not configured');
  }
}

export interface EmailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  from?: string | { email: string; name: string };
  attachments?: any[];
}

/**
 * Server-only function to send an email using SendGrid
 */
export async function sendEmail(options: EmailOptions) {
  // Initialize SendGrid if not already done
  initializeSendGrid();

  const defaultSenderEmail = process.env.DEFAULT_SENDER_EMAIL || 'noreply@example.com';
  const defaultSenderName = process.env.DEFAULT_SENDER_NAME || 'Paigham';

  const msg: MailDataRequired = {
    to: options.to,
    from: options.from || {
      email: defaultSenderEmail,
      name: defaultSenderName,
    },
    subject: options.subject,
    html: options.html || options.text || '',
    text: options.text || '',
    attachments: options.attachments,
    trackingSettings: {
      clickTracking: { enable: true },
      openTracking: { enable: true },
    },
  };

  try {
    const response = await sgMail.send(msg);
    return {
      success: true,
      statusCode: response[0].statusCode,
    };
  } catch (error: any) {
    console.error('SendGrid error:', error);
    
    if (error.response && error.response.body) {
      console.error('SendGrid error details:', JSON.stringify(error.response.body, null, 2));
    }
    
    throw error;
  }
} 