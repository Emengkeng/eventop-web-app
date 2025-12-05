import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ merchantWallet: string }> }
) {
  try {
    const { merchantWallet } = await params;
    
    const response = await fetch(
      `${API_BASE_URL}/webhooks/${merchantWallet}/endpoints`,
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
      { error: 'Failed to fetch endpoints' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ merchantWallet: string }> }
) {
  try {
    const { merchantWallet } = await params;
    const body = await request.json();
    
    const response = await fetch(
      `${API_BASE_URL}/webhooks/${merchantWallet}/endpoints`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': request.headers.get('Authorization') || '',
        },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create endpoint' },
      { status: 500 }
    );
  }
}