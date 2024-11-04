import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEN_AI = new GoogleGenerativeAI(process.env.GEMINI_KEY as string);
const MODEL = GEN_AI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export async function POST(req: NextRequest) {
  const { userAnswers, quizData } = await req.json();

  try {
    const results = await Promise.all(
      quizData.map(async (question: any, index: number) => {
        const userAnswer = userAnswers[index];
        let isCorrect = false;

        switch (question.format) {
          case 'multiple choice':
          case 'true false':
            isCorrect = userAnswer?.toLowerCase() === question.correct_answer.toLowerCase();
            break;

          case 'short answer':
          case 'fill in the blank':
            const completion = await MODEL.generateContent(
              `Question: ${question.question}\nUser's answer: ${userAnswer || ''}\n\nIs the user's answer acceptable? Only respond with 'yes' or 'no'.`
            );
            const aiResponse = completion.response.text().toLowerCase().trim();
            isCorrect = aiResponse === 'yes';
            break;

          case 'select all':
            const userSet = new Set(userAnswer?.map((a: string) => a.toLowerCase()) || []);
            const correctSet = new Set(question.correct_answers.map((a: string) => a.toLowerCase()));
            isCorrect = userSet.size === correctSet.size && Array.from(userSet).every(answer => correctSet.has(answer));
            break;

          case 'matching':
            const userMatches = userAnswer || {};
            isCorrect = Object.entries(question.correct_answers).every(
              ([term, desc]) => userMatches[term]?.toLowerCase() === (desc as string).toLowerCase()
            );
            break;
        }

        return {
          questionNumber: index + 1,
          question: question.question,
          format: question.format,
          userAnswer,
          correctAnswer: question.correct_answer || question.correct_answers,
          isCorrect,
        };
      })
    );

    const totalQuestions = results.length;
    const correctAnswers = results.filter(r => r.isCorrect).length;
    const score = (correctAnswers / totalQuestions) * 100;

    return NextResponse.json({
      score,
      totalQuestions,
      correctAnswers,
      detailedResults: results,
    });
  } catch (error) {
    console.error('Error validating quiz:', error);
    return NextResponse.json({ error: 'Failed to validate quiz answers' }, { status: 500 });
  }
}
