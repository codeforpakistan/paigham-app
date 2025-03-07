import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  try {
    // Check for required environment variables
    const config = {
      sendgridApiKey: !!process.env.SENDGRID_API_KEY,
      defaultSenderEmail: process.env.DEFAULT_SENDER_EMAIL || null,
      defaultSenderName: process.env.DEFAULT_SENDER_NAME || null,
    };
    
    return NextResponse.json({
      success: true,
      config,
      isConfigured: config.sendgridApiKey,
    });
  } catch (error) {
    console.error('Error checking email configuration:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      },
      { status: 500 }
    );
  }
} 