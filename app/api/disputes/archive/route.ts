// /app/api/disputes/archive/route.ts
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  const formData = await req.formData();
  const disputeId = formData.get('dispute_id');

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect('/login');

  await supabase
    .from('disputes')
    .update({ archived: true })
    .eq('id', disputeId)
    .eq('user_id', user.id);

  await supabase.from('dispute_logs').insert({
    dispute_id: disputeId,
    user_id: user.id,
    action: 'archived',
    created_at: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true });
}
