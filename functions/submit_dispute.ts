// supabase/functions/submit_dispute.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const supabase = createClient(
    Deno.env.get('NEXT_PUBLIC_SITE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const country = req.headers.get('cf-ipcountry') ?? 'unknown';
  const body = await req.json();

  const { data, error } = await supabase.from('disputes').insert({
    ...body,
    jurisdiction_flag: country,
    user_confirmed_input: true,
    training_permission: false,
    status: 'draft'
  }).select('id').single();

  if (error) {
    console.error('[❌ insert error]', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  }

  return new Response(JSON.stringify({ id: data.id, country }), {
    headers: { 'Content-Type': 'application/json' },
    status: 200
  });
});
