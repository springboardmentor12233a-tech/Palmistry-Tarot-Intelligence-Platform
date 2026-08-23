import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('access_token')?.value;

  try {
    const backendRes = await fetch(`${BACKEND_URL}/api/notifications`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    const data = await backendRes.json();

    if (!backendRes.ok) {
      return NextResponse.json(
        { detail: data.detail || 'Failed to fetch notifications' },
        { status: backendRes.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { detail: error?.message || 'Could not connect to notification service at ' + BACKEND_URL },
      { status: 503 }
    );
  }
}
