import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEN_AI = new GoogleGenerativeAI(process.env.GEMINI_KEY as string);
const MODEL = GEN_AI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export async function POST(req: NextRequest) {
  const { subject, topic, numQuestions, formats } = await req.json();
  const formatBool: Record<string, boolean> = {};
  const formatInfo = formats.map((format: string, index: number) => {
    formatBool[format] = true;
    return {
      format: format,
      isLast: index === formats.length - 1,
      position: index + 1,
      formattedString: index === formats.length - 1 ? format : `${format}, `,
    };
  });

  const question_formats = formatInfo.map((info: { formattedString: string }) => info.formattedString).join('');
  const formatSpecificPrompts = {
    'multiple choice': formatBool['multiple choice']
      ? 'For multiple choice questions, provide 4 options. Example: {"question": "What is the capital of France?", "answers": ["Paris", "London", "Berlin", "Madrid"], "correct_answer": "Paris", "format": "multiple choice"}'
      : '',
    'true false': formatBool['true false']
      ? 'For true/false questions, ensure a mix of true and false statements. Example: {"question": "The Earth is flat.", "correct_answer": "False", "format": "true false"}'
      : '',
    'short answer': formatBool['short answer']
      ? 'For short answer questions, keep answers concise, ideally 1-3 words. Example: {"question": "Who wrote Romeo and Juliet?", "answer": ["William Shakespeare"], "correct_answer": "William Shakespeare", "format": "short answer"}'
      : '',
    'fill in the blank': formatBool['fill in the blank']
      ? 'For fill-in-the-blank questions, use underscores to indicate the blank space. Example: {"question": "The largest planet in our solar system is _____.", "answers": ["Jupiter"], "correct_answers": ["Jupiter", "jupiter", "JUPITER"], "format": "fill in the blank"}'
      : '',
    ['matching']: formatBool['matching']
      ? 'For matching questions, provide terms or definitions and their corresponding descriptions. Example: {"question": "Match the terms to their descriptions", "answers": {"terms": ["Photosynthesis", "Mitosis", "Osmosis"], "descriptions": ["Process by which plants use sunlight to produce energy", "Cell division resulting in two identical daughter cells", "Movement of water molecules across a semipermeable membrane"]}, "correct_answer": {"Photosynthesis": "Process by which plants use sunlight to produce energy", "Mitosis": "Cell division resulting in two identical daughter cells", "Osmosis": "Movement of water molecules across a semipermeable membrane"}, "format": "matching"}'
      : '',
    'select all': formatBool['select all']
      ? 'For select-all questions, include 4-6 options with 2-5 correct answers. Example: {"question": "Which of the following are primary colors?", "answers": ["Red", "Green", "Blue", "Yellow", "Orange"], "correct_answers": ["Red", "Blue", "Yellow"], "format": "select all"}'
      : '',
  };

  const additionalInstructions = Object.values(formatSpecificPrompts).filter(Boolean).join(' ');

  const PROMPT = `Generate ${numQuestions} quiz question(s) in the formats ${question_formats} and their answers based for the topic ${topic} within the subject ${subject}. 
Respond with a JSON array of objects ONLY, no other text, each with "question", "answers", and "correct_answer", and "format" fields. 
${additionalInstructions}
Make sure the questions capture the topic within the subject thoroughly, the questions are challenging but clear, and the answers are concise and accurate.`;

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
