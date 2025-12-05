import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function PUT(
  request: NextRequest,
  { params }: { params: { merchantWallet: string; endpointId: string } }
) {
  try {
    const body = await request.json();
    
    const response = await fetch(
      `${API_BASE_URL}/webhooks/${params.merchantWallet}/endpoints/${params.endpointId}`,
      {
        method: 'PUT',
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
      { error: 'Failed to update endpoint' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { merchantWallet: string; endpointId: string } }
) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/webhooks/${params.merchantWallet}/endpoints/${params.endpointId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': request.headers.get('Authorization') || '',
        },
      }
    );

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete endpoint' },
      { status: 500 }
    );
  }
}