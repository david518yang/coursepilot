import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEN_AI = new GoogleGenerativeAI(process.env.GEMINI_KEY as string);
const MODEL = GEN_AI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export async function POST(req: NextRequest) {
  const { topic, numQuestions = 1 } = await req.json();
  
  const PROMPT = `Generate ${numQuestions} quiz question(s) and their answers based on the following topic: ${topic}. 
Respond only with a JSON array of objects, each with "question" and "answer" fields. 
Make sure the questions are challenging but clear, and the answers are concise and accurate.`;

  try {
    const completion = await MODEL.generateContent(PROMPT);
    const generatedContent = completion.response.text();
    
    const quizData = JSON.parse(generatedContent);
    console.log(quizData);
    return NextResponse.json(quizData);
  } catch (error) {
    console.error('Error generating quiz:', error);
    return NextResponse.json({ error: 'Failed to generate quiz' }, { status: 500 });
  }
}
