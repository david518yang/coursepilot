import { NextResponse } from 'next/server';
import Note from '@/lib/models/Note';
import FlashcardSet, { IFlashcardSetDocument } from '@/lib/models/Flashcard';
import { currentUser } from '@clerk/nextjs/server';
import { INoteDocument } from '@/lib/models/Note';

export async function GET(request: Request, { params }: { params: { courseId: string } }) {
  const getNotesFromCourse = async (courseId: string, userId: string): Promise<INoteDocument[]> => {
    return await Note.find({ courseId, userId }).select('_id title updatedAt').lean();
  };

  const getFlashcardSetsFromCourse = async (courseId: string, userId: string): Promise<IFlashcardSetDocument[]> => {
    return await FlashcardSet.find({ courseId, userId }).select('_id title updatedAt').lean();
  };

  const user = await currentUser();

  if (!user || !user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [notes, flashCardSets] = await Promise.all([
    getNotesFromCourse(params.courseId, user.id),
    getFlashcardSetsFromCourse(params.courseId, user.id),
  ]);

  const getItemUrl = (courseId: string, type: string, id: string) => {
    return `/courses/${courseId}/${type}s/${id}`;
  };

  // Add type field to each document type for identification
  const combinedData = [
    ...notes.map(note => ({ ...note, type: 'note', url: getItemUrl(params.courseId, 'note', note._id) })),
    ...flashCardSets.map(flashcardSet => ({
      ...flashcardSet,
      type: 'flashcard',
      url: getItemUrl(params.courseId, 'flashcard', flashcardSet._id),
    })),
  ];

  // Sort by updatedAt in descending order
  combinedData.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  return NextResponse.json(combinedData, { status: 200 });
}
