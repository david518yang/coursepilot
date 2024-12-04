import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { connectToMongoDB } from '@/lib/db';
import mongoose from 'mongoose';

export async function GET(req: Request, { params }: { params: { courseId: string; quizId: string } }) {
  try {
    const user = await currentUser();
    if (!user || !user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { quizId } = params;

    // Ensure MongoDB connection is established
    const connection = await connectToMongoDB();
    if (!connection) {
      console.error('Failed to connect to MongoDB');
      return NextResponse.json({ error: 'Database Error' }, { status: 500 });
    }

    const QuizResult =
      mongoose.models.QuizResult ||
      mongoose.model(
        'QuizResult',
        new mongoose.Schema({
          quizId: String,
          userId: String,
          score: Number,
          answers: mongoose.Schema.Types.Mixed,
          createdAt: { type: Date, default: Date.now },
        })
      );

    const results = await QuizResult.find({
      quizId: quizId,
      userId: user.id,
    }).sort({ createdAt: 'desc' });

    return NextResponse.json(results);
  } catch (error) {
    console.error('[QUIZ_RESULTS_GET]', error);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: { courseId: string; quizId: string } }) {
  try {
    const user = await currentUser();
    if (!user || !user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { quizId } = params;
    const body = await req.json();

    // Ensure MongoDB connection is established
    const connection = await connectToMongoDB();
    if (!connection) {
      console.error('Failed to connect to MongoDB');
      return NextResponse.json({ error: 'Database Error' }, { status: 500 });
    }

    const QuizResult =
      mongoose.models.QuizResult ||
      mongoose.model(
        'QuizResult',
        new mongoose.Schema({
          quizId: String,
          userId: String,
          score: Number,
          answers: mongoose.Schema.Types.Mixed,
          createdAt: { type: Date, default: Date.now },
        })
      );

    const result = await QuizResult.create({
      quizId,
      userId: user.id,
      score: body.score,
      answers: body.answers,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('[QUIZ_RESULTS_POST]', error);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}
