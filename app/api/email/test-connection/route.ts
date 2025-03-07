import { NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { apiKey, from, to } = body;

    // Validate required fields
    if (!apiKey || !from || !to) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Set SendGrid API key
    sgMail.setApiKey(apiKey);

    // Prepare test email
    const msg = {
      to,
      from,
      subject: 'Paigham - Email Configuration Test',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
          <h2 style="color: #4f46e5;">Email Configuration Test</h2>
          <p>This is a test email from Paigham to verify your email configuration.</p>
          <p>If you're receiving this email, your email settings are configured correctly!</p>
          <hr style="border: 1px solid #e5e7eb; margin: 20px 0;" />
          <p style="color: #6b7280; font-size: 14px;">
            This is an automated message, please do not reply to this email.
          </p>
        </div>
      `,
      trackingSettings: {
        clickTracking: { enable: true },
        openTracking: { enable: true },
      }
    };

    // Send test email
    await sgMail.send(msg);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error testing email connection:', error);
    
    // Return appropriate error response
    const status = error.code === 'ECONNREFUSED' ? 503 : 500;
    const message = error.response?.body?.errors?.[0]?.message || error.message || 'Unknown error';
    
    return NextResponse.json(
      { error: message },
      { status }
    );
  }
} 