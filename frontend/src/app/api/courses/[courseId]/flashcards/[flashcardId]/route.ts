import { currentUser } from '@clerk/nextjs/server';
import FlashcardSet, { IFlashcardSetDocument } from '@/lib/models/Flashcard';

export async function GET(request: Request, { params }: { params: { courseId: string; flashcardId: string } }) {
  const getFlashcardSetsFromCourse = async (
    courseId: string,
    flashcardId: string,
    userId: string
  ): Promise<IFlashcardSetDocument | null> => {
    const flashcardSet = await FlashcardSet.findOne({ _id: flashcardId, courseId, userId });

    return flashcardSet;
  };

  const user = await currentUser();

  if (!user || !user.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const note = await getFlashcardSetsFromCourse(params.courseId, params.flashcardId, user.id);

  if (!note) {
    return Response.json({ error: 'Flashcard set not found or unauthorized' }, { status: 404 });
  }

  return Response.json(note, { status: 200 });
}

export async function DELETE(request: Request, { params }: { params: { courseId: string; flashcardId: string } }) {
  const deleteFlashcardSetFromCourse = async (
    courseId: string,
    flashcardId: string,
    userId: string
  ): Promise<IFlashcardSetDocument | null> => {
    const note = await FlashcardSet.findOneAndDelete({ _id: flashcardId, courseId, userId });

    return note;
  };

  const user = await currentUser();

  if (!user || !user.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const note = await deleteFlashcardSetFromCourse(params.courseId, params.flashcardId, user.id);

  if (!note) {
    return Response.json({ error: 'Flashcard set not found or unauthorized' }, { status: 404 });
  }

  return Response.json({ message: 'Flashcard set deleted successfully' }, { status: 200 });
}

export async function PATCH(request: Request, { params }: { params: { courseId: string; flashcardId: string } }) {
  const updateFlashcardSetInCourse = async (
    courseId: string,
    flashcardId: string,
    updatedContent: string,
    userId: string
  ): Promise<IFlashcardSetDocument | null> => {
    const flashcardSet = await FlashcardSet.findOneAndUpdate(
      { _id: flashcardId, courseId, userId },
      { $set: { content: updatedContent } },
      { new: true }
    );

    return flashcardSet;
  };

  const user = await currentUser();

  if (!user || !user.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { content } = await request.json();

  const flashcardSet = await updateFlashcardSetInCourse(params.courseId, params.flashcardId, content, user.id);

  if (!flashcardSet) {
    return Response.json({ error: 'Flashcard set not found or unauthorized' }, { status: 404 });
  }

  return Response.json({ message: 'Flashcard set updated successfully', flashcardSet }, { status: 200 });
}
