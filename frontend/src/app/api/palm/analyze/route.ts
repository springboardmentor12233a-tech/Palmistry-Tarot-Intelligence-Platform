import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const token = req.cookies.get('access_token')?.value;

    const backendRes = await fetch(`${BACKEND_URL}/api/palm/analyze`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    const data = await backendRes.json();

    if (!backendRes.ok) {
      return NextResponse.json(
        { detail: data.detail || 'Palm analysis failed' },
        { status: backendRes.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { detail: error?.message || 'Could not connect to palm analysis service at ' + BACKEND_URL },
      { status: 503 }
    );
  }
}
