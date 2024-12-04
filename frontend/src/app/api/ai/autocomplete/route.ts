import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEN_AI = new GoogleGenerativeAI(process.env.GEMINI_KEY as string);
const MODEL = GEN_AI.getGenerativeModel({ model: 'gemini-1.5-flash' });
const PROMPT = `Complete the following sentence, and return only the text missing from the current prefix under 10 words.

  Do not attempt to do any other formatting.
  If the content seems already complete, return the empty string.
  Otherwise, make an attempt.

  For example, if the prompt is: "The current prefix is: It can even finish sen",
  the response should be: "tences for you."
  
  The current prefix is: `;

export async function POST(req: NextRequest) {
  const { prefix } = await req.json();
  const completion = await MODEL.generateContent(`${PROMPT}${prefix}`);
  return NextResponse.json({ text: completion.response.text() });
}
