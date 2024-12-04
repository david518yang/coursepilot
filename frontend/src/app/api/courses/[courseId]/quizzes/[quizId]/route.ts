import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { connectToMongoDB } from '@/lib/db';
import Quiz from '@/lib/models/Quiz';

export async function GET(req: Request, { params }: { params: { courseId: string; quizId: string } }) {
  try {
    const user = await currentUser();
    if (!user || !user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { courseId, quizId } = params;

    // Ensure MongoDB connection is established
    const connection = await connectToMongoDB();
    if (!connection) {
      console.error('Failed to connect to MongoDB');
      return NextResponse.json({ error: 'Database Error' }, { status: 500 });
    }

    const quiz = await Quiz.findOne({
      _id: quizId,
      courseId: courseId,
    });

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    return NextResponse.json(quiz);
  } catch (error) {
    console.error('[QUIZ_GET]', error);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { courseId: string; quizId: string } }) {
  try {
    const user = await currentUser();
    if (!user || !user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { courseId, quizId } = params;
    const body = await req.json();

    // Ensure MongoDB connection is established
    const connection = await connectToMongoDB();
    if (!connection) {
      console.error('Failed to connect to MongoDB');
      return NextResponse.json({ error: 'Database Error' }, { status: 500 });
    }

    const quiz = await Quiz.findOneAndUpdate(
      {
        _id: quizId,
        courseId: courseId,
      },
      { $set: body },
      { new: true }
    );

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    return NextResponse.json(quiz);
  } catch (error) {
    console.error('[QUIZ_PATCH]', error);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { courseId: string; quizId: string } }) {
  try {
    const user = await currentUser();
    if (!user || !user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { courseId, quizId } = params;

    // Ensure MongoDB connection is established
    const connection = await connectToMongoDB();
    if (!connection) {
      console.error('Failed to connect to MongoDB');
      return NextResponse.json({ error: 'Database Error' }, { status: 500 });
    }

    const quiz = await Quiz.findOneAndDelete({
      _id: quizId,
      courseId: courseId,
    });

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    return NextResponse.json(null, { status: 204 });
  } catch (error) {
    console.error('[QUIZ_DELETE]', error);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}
