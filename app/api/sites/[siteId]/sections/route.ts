import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Schema validazione per sezione
const sectionSchema = z.object({
  type: z.enum(['HERO', 'ABOUT', 'SERVICES', 'GALLERY', 'TESTIMONIALS', 'CONTACT']),
  order: z.number().min(0).max(12),
  isActive: z.boolean(),
  props: z.record(z.any()),
});

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
    const body = await request.json();
    const validatedData = sectionSchema.parse(body);

    // TODO: Get user from auth session and verify ownership
    const tenantId = 'mock-tenant-id'; // Replace with actual tenant ID

    // Mock response for now
    return NextResponse.json({
      success: true,
      data: {
        id: 'mock-section-id',
        type: validatedData.type,
        order: validatedData.order,
        isActive: validatedData.isActive,
        props: validatedData.props,
      },
    });

  } catch (error) {
    console.error('Error creating section:', error);
    
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
      data: [],
    });

  } catch (error) {
    console.error('Error fetching sections:', error);
    return NextResponse.json(
      { success: false, error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}
