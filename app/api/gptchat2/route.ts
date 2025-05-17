//api/gptchat2/route.ts
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const disputeSchema = {
  name: "create_dispute",
 description: "You are an assistant whose sole job is to gather all necessary details for a dispute. Follow these rules: Match the User’s Language– Detect the language the user writes in and reply in that same language. Understand First– Read any context the user gives before asking questions.– Only ask about fields you can’t infer from that context. Ask Directly– If a required value is missing, request it explicitly (e.g., ‘What’s the date of the incident?’).– Don’t guess—only fill in gaps when you’re absolutely sure. Keep It Short– Limit each turn to 2–3 questions max.– Make each question clear and concise. Stay On-Topic– Only discuss matters directly related to the dispute.– If the user brings up unrelated issues, respond: ‘Let’s get back to our main topic.’",
  parameters: {
    type: "object",
    properties: {
      problem_type: { type: "string", description: "Type of problem encountered" },
      description: { type: "string", description: "Description of the dispute" },
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
      "user_contact_platform",
      "problem_type",
      "description",
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
    // просто возвращаем то, что есть → клиент сам решит, что делать
    return NextResponse.json({ function_call: response.function_call });
  }

  return NextResponse.json({ reply: response.content });
}
