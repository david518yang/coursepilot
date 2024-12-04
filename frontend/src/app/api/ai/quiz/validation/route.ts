import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEN_AI = new GoogleGenerativeAI(process.env.GEMINI_KEY as string);
const MODEL = GEN_AI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export async function POST(req: NextRequest) {
  try {
    const { userAnswers, quizData } = await req.json();
    console.log('Received quiz data:', JSON.stringify(quizData, null, 2));
    console.log('Received user answers:', JSON.stringify(userAnswers, null, 2));

    const results = await Promise.all(
      quizData.map(async (question: any, index: number) => {
        const userAnswer = userAnswers[index];
        const format = question.format?.toLowerCase();

        let correctAnswer;
        if (format === 'select all' || format === 'matching') {
          correctAnswer = question.correctAnswers;
        } else {
          correctAnswer = question.correctAnswer;
        }

        console.log(`Processing question ${index + 1}:`, {
          format,
          userAnswer,
          correctAnswer,
        });

        let isCorrect = false;

        switch (format) {
          case 'multiple choice':
          case 'true false':
            isCorrect =
              typeof userAnswer === 'string' &&
              typeof correctAnswer === 'string' &&
              userAnswer.toLowerCase() === correctAnswer.toLowerCase();
            break;

          case 'short answer':
          case 'fill in the blank':
            if (!userAnswer || !correctAnswer) {
              isCorrect = false;
              break;
            }
            const completion = await MODEL.generateContent(
              `Question: ${question.question}\nUser's answer: ${userAnswer}\nCorrect answer: ${correctAnswer}\n\nIs the user's answer acceptable? Only respond with 'yes' or 'no'.`
            );
            const aiResponse = completion.response.text().toLowerCase().trim();
            isCorrect = aiResponse === 'yes';
            break;

          case 'select all':
            if (!Array.isArray(userAnswer) || !Array.isArray(correctAnswer)) {
              isCorrect = false;
              break;
            }
            const userSet = new Set(userAnswer.map(a => a.toLowerCase()));
            const correctSet = new Set(correctAnswer.map(a => a.toLowerCase()));
            isCorrect = userSet.size === correctSet.size && Array.from(userSet).every(answer => correctSet.has(answer));
            break;

          case 'matching':
            if (!userAnswer || !correctAnswer || typeof userAnswer !== 'object' || typeof correctAnswer !== 'object') {
              isCorrect = false;
              break;
            }
            isCorrect = Object.entries(correctAnswer).every(
              ([term, desc]) => userAnswer[term]?.toLowerCase() === (desc as string)?.toLowerCase()
            );
            break;

          default:
            console.warn(`Unknown question format: ${format}`);
            isCorrect = false;
        }

        return {
          questionNumber: index + 1,
          question: question.question,
          format: format,
          userAnswer,
          correctAnswer,
          isCorrect,
        };
      })
    );

    const correctAnswers = results.filter(r => r.isCorrect).length;
    const score = (correctAnswers / results.length) * 100;

    return NextResponse.json({
      score: Math.round(score * 100) / 100, // Round to 2 decimal places
      totalQuestions: results.length,
      correctAnswers,
      detailedResults: results,
    });
  } catch (error) {
    console.error('Error validating quiz:', error);
    return NextResponse.json({ error: 'Failed to validate quiz answers' }, { status: 500 });
  }
}
