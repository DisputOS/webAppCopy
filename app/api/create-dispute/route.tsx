// app/api/create-dispute/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      user_id,
      platform_name,
      purchase_amount,
      currency,
      purchase_date,
      problem_type,
      description,
      service_usage,
      tracking_info,
    } = body;

    const cfCountry = req.headers.get('cf-ipcountry') || 'unknown';

    const response = await fetch('https://dzzyasrcofzdryfbmxrg.functions.supabase.co/insert_dispute_with_flag', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
        'cf-ipcountry': cfCountry,
      },
      body: JSON.stringify({
  user_id,
  platform_name,
  purchase_amount,
  currency,
  purchase_date,
  problem_type,
  description,
  service_usage,
  tracking_info,

  // 👇 обязательные
  user_plan: 'free',
  status: 'draft',
  user_confirmed_input: true,
  archived: false
}),

    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data.error || 'Failed to create dispute' }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error('[create-dispute] ❌', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
