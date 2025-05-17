import { NextRequest } from 'next/server';

export function GET(req: NextRequest) {
  const country = req.headers.get('cf-ipcountry') || 'XX';
  return new Response(JSON.stringify({ country }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}