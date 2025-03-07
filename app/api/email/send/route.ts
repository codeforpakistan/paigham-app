import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/server/email-provider';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const { to, subject, html, text, from } = await request.json();
    
    if (!to || !subject || (!html && !text)) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, or content (html/text)' },
        { status: 400 }
      );
    }

    console.log('Sending email to:', to);
    
    // Send email using the server-only wrapper
    const result = await sendEmail({
      to,
      subject,
      html,
      text,
      from
    });
    
    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      statusCode: result.statusCode
    });
  } catch (error: any) {
    console.error('Error sending email:', error);
    
    return NextResponse.json(
      { 
        error: `Failed to send email: ${error.message || 'Unknown error'}`,
        details: error.response?.body?.errors || []
      },
      { status: 500 }
    );
  }
} 