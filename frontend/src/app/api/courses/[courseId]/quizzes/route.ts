import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import Quiz from '@/lib/models/Quiz';
import { connectToMongoDB } from '@/lib/db';

export async function POST(request: Request, { params }: { params: { courseId: string } }) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { title, subject, topic, questions } = await request.json();

    // Validate required fields
    if (!title || !subject || !topic || !questions) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    // Ensure MongoDB connection is established
    const connection = await connectToMongoDB();
    if (!connection) {
      console.error('Failed to connect to MongoDB');
      return new NextResponse('Database connection error', { status: 500 });
    }

    const quiz = await Quiz.create({
      title,
      courseId: params.courseId,
      userId: user.id,
      subject,
      topic,
      questions,
    });

    return NextResponse.json(quiz);
  } catch (error) {
    console.error('[QUIZ_POST]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function GET(request: Request, { params }: { params: { courseId: string } }) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Ensure MongoDB connection is established
    const connection = await connectToMongoDB();
    if (!connection) {
      console.error('Failed to connect to MongoDB');
      return new NextResponse('Database connection error', { status: 500 });
    }

    const quizzes = await Quiz.find({
      courseId: params.courseId,
      userId: user.id,
    }).sort({ updatedAt: 'desc' }); // Added sorting by updatedAt for consistency

    return NextResponse.json(quizzes);
  } catch (error) {
    console.error('[QUIZZES_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
