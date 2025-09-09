import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { siteId: string } }
) {
  try {
    // Skip during build
    if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return NextResponse.json(
        { success: false, error: 'Supabase non configurato' },
        { status: 500 }
      );
    }

    const { siteId } = params;

    // TODO: Get user from auth session and verify ownership
    const tenantId = 'mock-tenant-id'; // Replace with actual tenant ID

    // Mock response for now
    return NextResponse.json({
      success: true,
      data: {
        id: siteId,
        isPublished: true,
        publishedAt: new Date().toISOString(),
      },
      message: 'Sito pubblicato con successo',
    });

  } catch (error) {
    console.error('Error publishing site:', error);
    return NextResponse.json(
      { success: false, error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { siteId: string } }
) {
  try {
    // Skip during build
    if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return NextResponse.json(
        { success: false, error: 'Supabase non configurato' },
        { status: 500 }
      );
    }

    const { siteId } = params;

    // TODO: Get user from auth session and verify ownership
    const tenantId = 'mock-tenant-id'; // Replace with actual tenant ID

    // Mock response for now
    return NextResponse.json({
      success: true,
      data: {
        id: siteId,
        isPublished: false,
        publishedAt: null,
      },
      message: 'Sito rimosso dalla pubblicazione',
    });

  } catch (error) {
    console.error('Error unpublishing site:', error);
    return NextResponse.json(
      { success: false, error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}
