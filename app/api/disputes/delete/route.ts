import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  const formData = await req.formData();
  const disputeId = formData.get('dispute_id');

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session || !disputeId) return NextResponse.redirect('/login');

  const userId = session.user.id;

  // 🛡 Optional: ensure dispute not submitted
  const { data: dispute } = await supabase
    .from('disputes')
    .select('used_in_contest')
    .eq('id', disputeId)
    .eq('user_id', userId)
    .single();

  if (dispute?.used_in_contest) {
    return NextResponse.json({ error: 'Dispute already submitted. Cannot delete.' }, { status: 403 });
  }

  // 🗑 Delete dispute
  await supabase
    .from('disputes')
    .delete()
    .eq('id', disputeId)
    .eq('user_id', userId);

  // 🧾 Log deletion
  await supabase.from('dispute_logs').insert({
    dispute_id: disputeId,
    user_id: userId,
    action: 'deleted',
    created_at: new Date().toISOString(),
  });

  return NextResponse.redirect(new URL('/cases', req.url));
}
