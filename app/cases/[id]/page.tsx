import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import TabbedDisputeDetail from '@/components/TabbedDisputeDetail';

export const dynamic = 'force-dynamic';

export default async function DisputeDetail({ params }: { params: { id: string } }) {
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: dispute, error } = await supabase
    .from('disputes')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single();
  if (error || !dispute) notFound();

  const { data: proofs, count: rawCount } = await supabase
    .from('proof_bundle')
    .select('*', { count: 'exact' })
    .eq('dispute_id', params.id)
    .eq('user_id', user.id);

  const proofCount: number = rawCount ?? 0;

  return (
    <TabbedDisputeDetail
      dispute={dispute}
      proofs={proofs || []}
      proofCount={proofCount}
    />
  );
}
