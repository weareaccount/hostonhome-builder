import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Schema validazione per creazione sito
const createSiteSchema = z.object({
  name: z.string().min(1).max(100),
  layoutType: z.enum(['ELEGANTE', 'MEDIO', 'ESSENZIALE']),
  theme: z.object({
    accent: z.enum(['BLUE', 'GREEN', 'RED', 'AMBER', 'VIOLET']),
    font: z.enum(['INTER', 'POPPINS', 'MONTSERRAT', 'WORKSANS', 'DMSANS', 'NUNITO', 'ROBOTO', 'LATO', 'LORA', 'PLAYFAIR']),
  }),
  logo: z.any().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Skip during build
    if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return NextResponse.json(
        { success: false, error: 'Supabase non configurato' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const validatedData = createSiteSchema.parse(body);

    // TODO: Get user from auth session
    const userId = 'mock-user-id'; // Replace with actual user ID from auth
    const tenantId = 'mock-tenant-id'; // Replace with actual tenant ID

    // Mock response for now
    return NextResponse.json({
      success: true,
      data: {
        id: 'mock-site-id',
        name: validatedData.name,
        layoutType: validatedData.layoutType,
        theme: validatedData.theme,
        // ... other fields
      },
    });

  } catch (error) {
    console.error('Error creating site:', error);
    
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

export async function GET(request: NextRequest) {
  try {
    // Skip during build
    if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return NextResponse.json(
        { success: false, error: 'Supabase non configurato' },
        { status: 500 }
      );
    }

    // TODO: Get user from auth session
    const userId = 'mock-user-id'; // Replace with actual user ID from auth
    const tenantId = 'mock-tenant-id'; // Replace with actual tenant ID

    // Mock response for now
    return NextResponse.json({
      success: true,
      data: [],
    });

  } catch (error) {
    console.error('Error fetching sites:', error);
    return NextResponse.json(
      { success: false, error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}
