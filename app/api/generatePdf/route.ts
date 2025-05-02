export const runtime = 'nodejs';


import { NextRequest, NextResponse } from 'next/server';
import { generatePDF } from '@/utils/pdfGenerator';

export const runtime = 'edge'; // можно и вовсе не указывать

export async function POST(req: NextRequest) {
  const { disputeId, templateText } = await req.json();

  const pdfBuffer = await generatePDF(templateText, disputeId);

  return new NextResponse(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="Disput_${disputeId}.pdf"`
    }
  });
}
