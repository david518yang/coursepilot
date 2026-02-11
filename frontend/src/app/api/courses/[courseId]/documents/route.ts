import { NextResponse } from 'next/server';
import Note from '@/lib/models/Note';
import FlashcardSet, { IFlashcardSetDocument } from '@/lib/models/Flashcard';
import PDF, { IPDFDocument } from '@/lib/models/PDF';
import { currentUser } from '@clerk/nextjs/server';
import { INoteDocument } from '@/lib/models/Note';
import Quiz, { IQuizDocument } from '@/lib/models/Quiz';

export async function GET(request: Request, { params }: { params: { courseId: string } }) {
  const getNotesFromCourse = async (courseId: string, userId: string): Promise<INoteDocument[]> => {
    return await Note.find({ courseId, userId }).select('_id title updatedAt').lean();
  };

  const getFlashcardSetsFromCourse = async (courseId: string, userId: string): Promise<IFlashcardSetDocument[]> => {
    return await FlashcardSet.find({ courseId, userId }).select('_id title updatedAt').lean();
  };

  const getQuizzesFromCourse = async (courseId: string, userId: string): Promise<IQuizDocument[]> => {
    return await Quiz.find({ courseId, userId }).select('_id title updatedAt').lean();
  };

  const getPDFsFromCourse = async (courseId: string, userId: string): Promise<IPDFDocument[]> => {
    return await PDF.find({ courseId, userId }).select('_id filename updatedAt').lean();
  };

  const user = await currentUser();

  if (!user || !user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [notes, flashCardSets, quizzes, pdfs] = await Promise.all([
    getNotesFromCourse(params.courseId, user.id),
    getFlashcardSetsFromCourse(params.courseId, user.id),
    getQuizzesFromCourse(params.courseId, user.id),
    getPDFsFromCourse(params.courseId, user.id),
  ]);

  const getItemUrl = (courseId: string, type: string, id: string) => {
    return `/courses/${courseId}/${type}s/${id}`;
  };

  const getQuizUrl = (courseId: string, id: string) => {
    return `/courses/${courseId}/quizzes/${id}/questions`;
  };

  // Add type field to each document type for identification
  const combinedData = [
    ...notes.map(note => ({ ...note, type: 'note', url: getItemUrl(params.courseId, 'note', note._id) })),
    ...flashCardSets.map(flashcardSet => ({
      ...flashcardSet,
      type: 'flashcard',
      url: getItemUrl(params.courseId, 'flashcard', flashcardSet._id),
    })),
    ...quizzes.map(quiz => ({ ...quiz, type: 'quiz', url: getQuizUrl(params.courseId, quiz._id) })),
    ...pdfs.map(pdf => ({
      ...pdf,
      type: 'pdf',
      title: pdf.filename,
      url: getItemUrl(params.courseId, 'pdf', pdf._id),
    })),
  ];

  // Sort by updatedAt in descending order
  combinedData.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  return NextResponse.json(combinedData, { status: 200 });
}
