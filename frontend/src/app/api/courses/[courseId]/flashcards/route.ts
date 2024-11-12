import { currentUser } from '@clerk/nextjs/server';
import FlashcardSet, { IFlashcardSetDocument } from '@/lib/models/Flashcard';

export async function GET(request: Request, { params }: { params: { courseId: string } }) {
  const getFlashcardSetsFromCourse = async (courseId: string, userId: string): Promise<IFlashcardSetDocument[]> => {
    const notes = await FlashcardSet.find({ courseId, userId }).sort({ updatedAt: 'desc' });

    return notes;
  };

  const user = await currentUser();

  if (!user || !user.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const notes = await getFlashcardSetsFromCourse(params.courseId, user.id);

  return Response.json(notes);
}

export async function POST(request: Request, { params }: { params: { courseId: string } }) {
  const addFlashcardSetToCourse = async (
    courseId: string,
    userId: string,
    generatedFlashcardSet: string
  ): Promise<IFlashcardSetDocument> => {
    const parsedFlashcardSet = JSON.parse(generatedFlashcardSet);
    const flashcardTitle = parsedFlashcardSet.title;
    const flashcards = parsedFlashcardSet.flashcards;
    const newFlashcardSet = new FlashcardSet({
      courseId,
      userId,
      title: flashcardTitle,
      flashcards: flashcards,
    });

    const flashcardSet = await newFlashcardSet.save();

    return flashcardSet;
  };

  const user = await currentUser();

  if (!user || !user.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  if (!body.generatedFlashcardSet) {
    return Response.json({ error: 'Invalid request' }, { status: 400 });
  }

  const flashcardSet = await addFlashcardSetToCourse(params.courseId, user.id, body.generatedFlashcardSet);

  return Response.json(flashcardSet);
}
