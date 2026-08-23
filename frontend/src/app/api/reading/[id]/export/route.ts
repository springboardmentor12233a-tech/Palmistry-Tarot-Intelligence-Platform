import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const searchParams = req.nextUrl.searchParams;
  const format = searchParams.get('format') || 'pdf';
  const token = req.cookies.get('access_token')?.value;

  try {
    const backendRes = await fetch(`${BACKEND_URL}/api/reading/${id}/export?format=${format}`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!backendRes.ok) {
      return NextResponse.json(
        { detail: 'Failed to export reading from backend server' },
        { status: backendRes.status }
      );
    }

    const buffer = await backendRes.arrayBuffer();
    const contentType =
      format === 'pdf'
        ? 'application/pdf'
        : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="reading-${id}.${format === 'pdf' ? 'pdf' : 'xlsx'}"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { detail: error?.message || 'Could not connect to export service at ' + BACKEND_URL },
      { status: 503 }
    );
  }
}
