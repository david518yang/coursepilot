import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import mongoose from 'mongoose';
import Quiz from '@/lib/models/Quiz';
import { connectToMongoDB } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { subject, topic, numQuestions, formats, courseId } = await req.json();

    // Get the host from the request headers
    const url = req.url;
    const baseUrl = new URL(url).origin;

    // Get auth headers from the original request
    const authHeader = req.headers.get('authorization');
    const cookieHeader = req.headers.get('cookie');

    console.log('[Debug] Making request to:', `${baseUrl}/api/ai/quiz/generation`);
    console.log('[Debug] Request body:', { subject, topic, numQuestions, formats });

    // Call AI quiz generation endpoint with absolute URL and auth headers
    const generationResponse = await fetch(`${baseUrl}/api/ai/quiz/generation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader ? { 'Authorization': authHeader } : {}),
        ...(cookieHeader ? { 'Cookie': cookieHeader } : {}),
      },
      body: JSON.stringify({
        subject,
        topic,
        numQuestions,
        formats,
      }),
    });

    if (!generationResponse.ok) {
      const errorText = await generationResponse.text();
      console.error('[Error] AI generation failed:', {
        status: generationResponse.status,
        statusText: generationResponse.statusText,
        error: errorText,
      });
      throw new Error(`Failed to generate quiz questions: ${errorText}`);
    }

    const responseData = await generationResponse.json();
    console.log('[Debug] Generation response:', responseData);

    if (!responseData.questions || !Array.isArray(responseData.questions)) {
      console.error('[Error] Invalid response format:', responseData);
      throw new Error('Invalid response format from quiz generation');
    }

    const { questions } = responseData;

    // Save to MongoDB
    try {
      await connectToMongoDB();

      const newQuiz = new Quiz({
        title: `${topic} Quiz`,
        courseId: new mongoose.Types.ObjectId(courseId),
        userId: user.id,
        subject,
        topic,
        questions,
      });

      const quiz = await newQuiz.save();

      console.log('Quiz saved successfully:', quiz);
      return NextResponse.json({
        _id: quiz._id.toString(),
        questions,
      });
    } catch (dbError) {
      console.error('MongoDB Error:', dbError);
      throw new Error('Failed to save quiz to database');
    }
  } catch (error) {
    console.error('Error in quiz generation route:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate quiz',
        details: process.env.NODE_ENV === 'development' ? error : undefined,
      },
      { status: 500 }
    );
  }
}
