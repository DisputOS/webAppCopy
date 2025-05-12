import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const disputeSchema = {
  name: "create_dispute",
 description: "Collect dispute information from the user understanding the context and by explicitly asking for each required field needed. Never assume or guess values unless it can be understood from a context. Ask the user directly if a value is missing. Ask no more then 2-3 questions each time, provide questions in a table format.",
  parameters: {
    type: "object",
    properties: {
      platform_name: { type: "string", description: "Platform name (e.g., Amazon)" },
      purchase_amount: { type: "number", description: "Amount spent" },
      currency: { type: "string", description: "Currency used (e.g., USD, EUR)" },
      purchase_date: { type: "string", description: "Date of purchase (YYYY-MM-DD), REMEMBER, today is 12 may 2025, ALWAYS ask for a date!" },
      problem_type: { type: "string", description: "Type of problem encountered" },
      description: { type: "string", description: "Description of the dispute" },
      service_usage: { type: "string", enum: ["yes", "no"] },
proof_description: { type: "string" },
      user_contact_platform: {
        type: "string",
        enum: ["yes", "no"],
        description: "if selected yes,'user_contact_desc' should be 100% in the database, if selected no, you should not ask it ",
      },
      user_contact_desc: { type: "string" },
      training_permission: {
        type: "string",
        enum: ["yes", "no"],
        description: "you SHOULD ALWAYS ask 'May we anonymously use this dispute (without personal data) to improve Disput.ai?'",
      },
    },
    required: [
      "platform_name",
      "purchase_amount",
      "currency",
      "user_contact_platform",
      "purchase_date",
      "problem_type",
      "description",
      "training_permission"
    ],
  },
};

const uploadProofFunction = {
  name: "user_upload_proof",
  description: "Ask the user to upload proof files and specify the evidence type",
  parameters: {
    type: "object",
    properties: {},
  },
};

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  const completion = await openai.chat.completions.create({
    model: "gpt-4-turbo",
    messages,
    functions: [disputeSchema, uploadProofFunction],
    function_call: "auto",
  });

  const response = completion.choices[0].message;

  if (response.function_call) {
    // просто возвращаем то, что есть → клиент сам решит, что делать
    return NextResponse.json({ function_call: response.function_call });
  }

  return NextResponse.json({ reply: response.content });
}
