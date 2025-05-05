import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  const formData = await req.formData();
  const disputeId = formData.get('dispute_id');

  const {
    data: { user },
  } = await supabase.auth.getUser(); // ✅ secure
  if (!user || !disputeId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = user.id;

  // Optional: prevent deleting submitted disputes
  const { data: dispute } = await supabase
    .from('disputes')
    .select('used_in_contest')
    .eq('id', disputeId)
    .eq('user_id', userId)
    .single();

  if (dispute?.used_in_contest) {
    return NextResponse.json({ error: 'Dispute already submitted. Cannot delete.' }, { status: 403 });
  }

  // Delete dispute
  await supabase
    .from('disputes')
    .delete()
    .eq('id', disputeId)
    .eq('user_id', userId);

  // Log action
  await supabase.from('dispute_logs').insert({
    dispute_id: disputeId,
    user_id: userId,
    action: 'deleted',
    created_at: new Date().toISOString(),
  });

  // ✅ Return JSON instead of redirect
  return NextResponse.json({ success: true });
}
