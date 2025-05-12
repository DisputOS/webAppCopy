import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const disputeSchema = {
  name: "create_dispute",
  description: "Collect dispute information from the user.",
  parameters: {
    type: "object",
    properties: {
      platform_name: { type: "string", description: "Platform name (e.g., Amazon)" },
      purchase_amount: { type: "number", description: "Amount spent" },
      currency: { type: "string", description: "Currency used (e.g., USD, EUR)" },
      purchase_date: { type: "string", description: "Date of purchase (YYYY-MM-DD)" },
      problem_type: { type: "string", description: "Type of problem encountered" },
      description: { type: "string", description: "Description of the dispute" },
      service_usage: { type: "string", enum: ["yes", "no"] },
      user_contact_platform: { type: "string", enum: ["yes", "no"] },
      user_contact_description: { type: "string" },
      training_permission: { type: "string", enum: ["yes", "no"] },
    },
    required: ["platform_name", "purchase_amount", "currency", "purchase_date", "problem_type", "description"]
  }
};

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  const completion = await openai.chat.completions.create({
    model: "gpt-4-turbo",
    messages,
    functions: [disputeSchema],
    function_call: "auto"
  });

  const response = completion.choices[0].message;

  if (response.function_call) {
    const fields = JSON.parse(response.function_call.arguments);
    return NextResponse.json({ fields });
  } else {
    return NextResponse.json({ reply: response.content });
  }
}
