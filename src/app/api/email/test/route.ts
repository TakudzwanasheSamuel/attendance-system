import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { emailService } from '@/lib/email-service';

export async function POST(request: NextRequest) {
  try {
    // Get the current user from the auth token
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify the token and get user info
    const userPayload = verifyToken(token);
    
    if (!userPayload || userPayload.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Access denied. Admin role required.' },
        { status: 403 }
      );
    }

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email address is required' },
        { status: 400 }
      );
    }

    // Test email connection first
    const connectionTest = await emailService.testConnection();
    if (!connectionTest) {
      return NextResponse.json(
        { success: false, error: 'Email service connection failed. Please check your email configuration.' },
        { status: 500 }
      );
    }

    // Send test email
    const emailSent = await emailService.sendTestEmail(email);

    if (emailSent) {
      return NextResponse.json({
        success: true,
        message: `Test email sent successfully to ${email}`
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to send test email' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error in email test API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
