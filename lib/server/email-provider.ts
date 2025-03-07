import 'server-only';

export interface EmailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  from?: string | { email: string; name: string };
  attachments?: any[];
}

/**
 * Server-only function to send an email using SendGrid API directly
 * This avoids using the SendGrid SDK which has Node.js dependencies
 */
export async function sendEmail(options: EmailOptions) {
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) {
    throw new Error('SendGrid API key not configured');
  }

  const defaultSenderEmail = process.env.DEFAULT_SENDER_EMAIL || 'noreply@example.com';
  const defaultSenderName = process.env.DEFAULT_SENDER_NAME || 'Paigham';

  // Format the from field
  let from: any;
  if (!options.from) {
    from = {
      email: defaultSenderEmail,
      name: defaultSenderName,
    };
  } else if (typeof options.from === 'string') {
    from = { email: options.from };
  } else {
    from = options.from;
  }

  // Prepare the request payload
  const payload: any = {
    personalizations: [
      {
        to: [{ email: options.to }],
      },
    ],
    from,
    subject: options.subject,
    content: [
      {
        type: 'text/html',
        value: options.html || options.text || '',
      },
    ],
    tracking_settings: {
      click_tracking: { enable: true },
      open_tracking: { enable: true },
    },
  };

  // If text content is provided, add it
  if (options.text) {
    payload.content.push({
      type: 'text/plain',
      value: options.text,
    });
  }

  // Add attachments if provided
  if (options.attachments && options.attachments.length > 0) {
    payload.attachments = options.attachments;
  }

  try {
    // Make a direct API call to SendGrid
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('SendGrid API error:', errorData);
      throw new Error(`SendGrid API error: ${response.status} ${response.statusText}`);
    }

    return {
      success: true,
      statusCode: response.status,
    };
  } catch (error: any) {
    console.error('Error sending email:', error);
    throw error;
  }
} 