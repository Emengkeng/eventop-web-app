import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ merchantWallet: string }> }
) {
  try {
    const { merchantWallet } = await params;
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    
    const response = await fetch(
      `${API_BASE_URL}/webhooks/${merchantWallet}/logs${queryString ? `?${queryString}` : ''}`,
      {
        headers: {
          'Authorization': request.headers.get('Authorization') || '',
        },
      }
    );

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch logs' },
      { status: 500 }
    );
  }
}