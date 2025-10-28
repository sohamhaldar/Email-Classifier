import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";

const ClassifiedEmailSchema = z.object({
  subject: z.string().describe("The email subject line"),
  from: z.string().describe("The sender's email address or name"),
  category: z.enum(["Important", "Promotions", "Social", "Marketing", "Spam", "General"])
    .describe("The classification category for the email"),
});

const ClassifiedEmailsArraySchema = z.array(ClassifiedEmailSchema);

export async function POST(req: NextRequest) {
  const { emails, apiKey } = await req.json();
  
  if (!apiKey) {
    return NextResponse.json({ error: "API key is required" }, { status: 400 });
  }

  const openai = new OpenAI({
    apiKey: apiKey,
    // baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
  });

  const prompt = `
You are an email classification assistant. 
Classify each email into one of these categories: Important, Promotions, Social, Marketing, Spam, or General.

Guidelines:
- Important: Security alerts, account notifications, important updates
- Promotions: Sales, offers, promotional content
- Social: Social media notifications, friend requests
- Marketing: Job opportunities, newsletters, recruitment emails
- Spam: Suspicious or unwanted emails
- General: Everything else

Return ONLY a valid JSON array of objects with this exact structure:
[
  {
    "subject": "email subject",
    "from": "sender email or name",
    "category": "one of: Important, Promotions, Social, Marketing, Spam, General"
  }
]

Do not include any markdown formatting, explanations, or code blocks. Only return the JSON array.

Emails to classify:
${emails.map((e: any) => `Subject: ${e.subject}\nFrom: ${e.from}\nSnippet: ${e.snippet}`).join("\n---\n")}
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0,
    });

    const text = completion.choices[0].message?.content?.trim() || "[]";
    console.log("GPT Response:", text);
    
    let jsonText = text;
    if (text.startsWith("```json")) {
      jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    } else if (text.startsWith("```")) {
      jsonText = text.replace(/```\n?/g, '').trim();
    }

    const parsed = JSON.parse(jsonText);
    const validated = ClassifiedEmailsArraySchema.parse(parsed);
    
    console.log("Validated emails:", validated);
    return NextResponse.json(validated);
  } catch (err: any) {
    console.error("Error classifying emails:", err);
    if (err instanceof z.ZodError) {
      return NextResponse.json({ 
        error: "Invalid response format from AI", 
        details: err.issues 
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      error: "Failed to classify emails", 
      details: err.message 
    }, { status: 500 });
  }
}
