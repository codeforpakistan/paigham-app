import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/server/email-provider';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const { to, subject, content } = await request.json();
    
    if (!to || !subject || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, or content' },
        { status: 400 }
      );
    }

    console.log('Sending test email to:', to);
    
    // Send email using the server-only wrapper
    const result = await sendEmail({
      to,
      subject,
      html: content,
    });
    
    console.log('SendGrid response:', result);
    
    return NextResponse.json({
      message: 'Test email sent successfully',
      statusCode: result.statusCode,
    });
  } catch (error: any) {
    console.error('Error sending test email:', error);
    
    return NextResponse.json(
      { 
        error: `Failed to send test email: ${error.message || 'Unknown error'}`,
        details: error.response?.body?.errors || []
      },
      { status: 500 }
    );
  }
} 