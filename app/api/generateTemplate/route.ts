export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/openaiClient';
import { calculateRisk } from '@/utils/riskEngine';

// Тип из OpenAI SDK v4
type ChatCompletionMessageParam = {
  role: 'user' | 'assistant' | 'system';
  content: string;
  name?: string;
};

export async function POST(req: NextRequest) {
  const { disputeId } = await req.json();
  const description = 'Sample description';
  const risk = calculateRisk(description);

  const messages: ChatCompletionMessageParam[] = [
    { role: 'system', content: 'You are a Ukrainian legal assistant.' },
    { role: 'user', content: description }
  ];

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages,
    temperature: 0.7
  });

  const template = completion.choices[0].message.content;
  return NextResponse.json({ template, confidence: risk > 70 ? 0.6 : 0.9 });
}
