import { currentUser } from '@clerk/nextjs/server';
import FlashcardSet, { IFlashcardSetDocument } from '@/lib/models/Flashcard';
import { SidebarItem } from '@/components/sidebar/course-content-list';

export async function GET(request: Request, { params }: { params: { courseId: string } }) {
  const getFlashcardSetsFromCourse = async (courseId: string, userId: string): Promise<IFlashcardSetDocument[]> => {
    const flashCardSets = await FlashcardSet.find({ courseId, userId }).sort({ updatedAt: 'desc' });

    return flashCardSets;
  };

  const user = await currentUser();

  if (!user || !user.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const flashCardSets = await getFlashcardSetsFromCourse(params.courseId, user.id);

  return Response.json(flashCardSets);
}

export async function POST(request: Request, { params }: { params: { courseId: string } }) {
  const addFlashcardSetToCourse = async (
    courseId: string,
    userId: string,
    generatedFlashcardSet: string
  ): Promise<SidebarItem> => {
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

    return {
      _id: flashcardSet._id.toString(),
      title: flashcardSet.title,
      type: 'flashcard',
      url: `/courses/${courseId}/flashcards/${flashcardSet._id}`,
      updatedAt: flashcardSet.updatedAt.toISOString(),
    };
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
