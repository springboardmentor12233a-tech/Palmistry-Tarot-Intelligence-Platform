import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function POST(req: NextRequest) {
  const token = req.cookies.get('access_token')?.value;

  try {
    if (token) {
      await fetch(`${BACKEND_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    }
  } catch {
    // Ignore backend connection error on logout
  }

  const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
  response.cookies.delete('access_token');
  response.cookies.delete('refresh_token');
  return response;
}
