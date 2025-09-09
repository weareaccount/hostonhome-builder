import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Schema validazione per aggiornamento sito
const updateSiteSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  theme: z.object({
    accent: z.enum(['BLUE', 'GREEN', 'RED', 'AMBER', 'VIOLET']),
    font: z.enum(['INTER', 'POPPINS', 'MONTSERRAT', 'WORKSANS', 'DMSANS', 'NUNITO', 'ROBOTO', 'LATO', 'LORA', 'PLAYFAIR']),
  }).optional(),
  logo: z.any().optional(),
});

export async function GET(
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
        name: 'Mock Site',
        // ... other fields
      },
    });

  } catch (error) {
    console.error('Error fetching site:', error);
    return NextResponse.json(
      { success: false, error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

export async function PUT(
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
    const body = await request.json();
    const validatedData = updateSiteSchema.parse(body);

    // TODO: Get user from auth session and verify ownership
    const tenantId = 'mock-tenant-id'; // Replace with actual tenant ID

    // Mock response for now
    return NextResponse.json({
      success: true,
      data: {
        id: siteId,
        ...validatedData,
      },
    });

  } catch (error) {
    console.error('Error updating site:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Dati non validi', details: error.errors },
        { status: 400 }
      );
    }

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
      message: 'Sito eliminato con successo',
    });

  } catch (error) {
    console.error('Error deleting site:', error);
    return NextResponse.json(
      { success: false, error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}
