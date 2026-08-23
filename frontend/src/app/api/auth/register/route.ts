import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const backendRes = await fetch(`${BACKEND_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await backendRes.json();

    if (!backendRes.ok) {
      return NextResponse.json(
        { detail: data.detail || data.message || 'Registration failed' },
        { status: backendRes.status }
      );
    }

    const response = NextResponse.json(data);

    if (data.tokens?.access_token) {
      response.cookies.set('access_token', data.tokens.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: data.tokens.expires_in || 3600 * 24,
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
      { detail: error?.message || 'Could not connect to backend server at ' + BACKEND_URL },
      { status: 503 }
    );
  }
}
