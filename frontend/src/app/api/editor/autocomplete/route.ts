import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEN_AI = new GoogleGenerativeAI(process.env.GEMINI_KEY as string);
const MODEL = GEN_AI.getGenerativeModel({ model: 'gemini-1.5-flash' });
const PROMPT =
  'Complete the following sentence, and return only the text missing from the current prefix. Formatting may be done using html tags. For example, wrap the completed text in <li></li> to add another item to a list if you think it should be a list item, or use markdown syntax for headings. If the content seems already complete, return the empty string. Otherwise, make an attempt. The current prefix is: ';

export async function POST(req: NextRequest) {
  const { prefix } = await req.json();
  const completion = await MODEL.generateContent(`${PROMPT}${prefix}`);
  return NextResponse.json({ text: completion.response.text() });
}
