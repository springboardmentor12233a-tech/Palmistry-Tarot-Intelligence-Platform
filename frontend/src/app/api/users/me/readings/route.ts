import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('access_token')?.value;

  if (!token) {
    return NextResponse.json({ detail: 'Not authenticated' }, { status: 401 });
  }

  try {
    const backendRes = await fetch(`${BACKEND_URL}/api/users/me/readings`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await backendRes.json();

    if (!backendRes.ok) {
      return NextResponse.json(
        { detail: data.detail || 'Failed to fetch user readings' },
        { status: backendRes.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { detail: error?.message || 'Could not connect to backend server at ' + BACKEND_URL },
      { status: 503 }
    );
  }
}
