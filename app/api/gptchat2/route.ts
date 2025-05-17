import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const disputeSchema = {
  name: "create_dispute",
  description: `
    You are an assistant whose sole job is to gather all necessary details for a dispute.

    🧠 Rules:
    - Match the user’s language.
    - Use context before asking.
    - Ask clearly if anything is missing.
    - Max 2–3 questions per turn.
    - Stay on-topic.
    - After you collected all information just call for your function!
  `,
  parameters: {
    type: "object",
    properties: {
      dispute_name: {
        type: "string",
        description: "Optional short name or label for this dispute (e.g. 'Spotify Refund Case'), define by yourself based on conversatoin",
      },
      problem_type: {
        type: "string",
        description: "Top-level category of dispute, e.g., 'saas_subscription', 'non_delivery', 'unauthorized_transaction'",
      },
      problem_subtype: {
        type: "string",
        description: "Subcategory of the dispute (e.g., 'auto_renewal', 'delivery_damaged')",
      },
      description: {
        type: "string",
        description: "Description of the dispute in user's own words",
      },
      purchase_amount: {
        type: "number",
        description: "Exact amount spent",
      },
      currency: {
        type: "string",
        description: "Currency used (e.g. USD, EUR)",
      },
      user_contact_platform: {
        type: "string",
        enum: ["yes", "no"],
        description: "Has user contacted the platform? If yes, user_contact_desc is required.",
      },
      user_contact_desc: {
        type: "string",
        description: "Description of user's contact with the platform",
      },
      training_permission: {
        type: "string",
        enum: ["yes", "no"],
        description: "Ask: 'May we anonymously use this dispute (without personal data) to improve Disput.ai?'",
      },
    },
    required: [
      "problem_type",
      "problem_subtype",
      "description",
      "purchase_amount",
      "currency",
      "user_contact_platform"
    ],
  },
};

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  const completion = await openai.chat.completions.create({
    model: "gpt-4-turbo",
    messages,
    functions: [disputeSchema],
    function_call: "auto",
  });

  const response = completion.choices[0].message;

  if (response.function_call) {
    return NextResponse.json({ function_call: response.function_call });
  }

  return NextResponse.json({ reply: response.content });
}