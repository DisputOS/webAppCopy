import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { user_id, platform_name, purchase_amount, currency, purchase_date, problem_type, description } = req.body;

  try {
    const response = await fetch('https://dzzyasrcofzdryfbmxrg.functions.supabase.co/insert_dispute_with_flag', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
    'cf-ipcountry': Array.isArray(req.headers['cf-ipcountry'])
      ? req.headers['cf-ipcountry'][0]
      : req.headers['cf-ipcountry'] || 'unknown',
  },
  body: JSON.stringify({
    user_id,
    platform_name,
    purchase_amount,
    currency,
    purchase_date,
    problem_type,
    description,
  }),
});


    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error || 'Failed to create dispute' });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Error creating dispute:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
