import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEN_AI = new GoogleGenerativeAI(process.env.GEMINI_KEY as string);
const MODEL = GEN_AI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export async function POST(req: NextRequest) {
  const { subject, topic, numQuestions, formats } = await req.json();
  const question_formats = formats
    .map((format: string, index: number) => (index === formats.length - 1 ? format : `${format}, `))
    .join('');
  const PROMPT = `Generate ${numQuestions} quiz question(s) in the formats ${question_formats} and their answers based for the topic ${topic} within the subject ${subject}. 
Respond with a JSON array of objects ONLY, no other text, each with "question", "answers", and "correct_answer", and "format" fields. 
Make sure the questions capture the topic within the subject thoroughly, and that the questions are challenging but clear, and the answers are concise and accurate.`;

  try {
    const completion = await MODEL.generateContent(PROMPT);
    const generatedContent = completion.response.text();
    console.log(generatedContent);
    const parsedContent = JSON.parse(generatedContent);

    const quizData = parsedContent.map((item: any) => ({
      question: item.question,
      answers: item.answers,
      correct_answer: item.correct_answer,
      format: item.format,
    }));

    if (quizData.length !== numQuestions) {
      throw new Error(`Expected ${numQuestions} questions, but received ${quizData.length}`);
    }
    console.log(quizData);
    return NextResponse.json(quizData);
  } catch (error) {
    console.error('Error generating quiz:', error);
    return NextResponse.json({ error: 'Failed to generate quiz' }, { status: 500 });
  }
}
