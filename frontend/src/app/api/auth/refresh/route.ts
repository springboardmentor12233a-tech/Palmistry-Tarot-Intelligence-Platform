import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get('refresh_token')?.value;

  if (!refreshToken) {
    return NextResponse.json({ detail: 'No refresh token available' }, { status: 401 });
  }

  try {
    const backendRes = await fetch(`${BACKEND_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${refreshToken}`,
      },
    });

    const data = await backendRes.json();

    if (!backendRes.ok) {
      const response = NextResponse.json(
        { detail: data.detail || 'Token refresh failed' },
        { status: backendRes.status }
      );
      response.cookies.delete('access_token');
      response.cookies.delete('refresh_token');
      return response;
    }

    const response = NextResponse.json(data);

    if (data.tokens?.access_token) {
      response.cookies.set('access_token', data.tokens.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: data.tokens.expires_in || 3600,
      });
    }

    if (data.tokens?.refresh_token) {
      response.cookies.set('refresh_token', data.tokens.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 3600 * 24 * 7,
      });
    }

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { detail: error?.message || 'Could not reach backend refresh endpoint' },
      { status: 503 }
    );
  }
}
