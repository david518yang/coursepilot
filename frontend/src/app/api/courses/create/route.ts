import { currentUser } from '@clerk/nextjs/server';
import Course, { ICourseDocument } from '@/lib/models/Course';

export async function POST(request: Request) {
  const addNoteToDb = async (title: string, emoji: string, userId: string): Promise<ICourseDocument> => {
    const newCourse = new Course({
      title,
      emoji: emoji,
      userId: userId,
    });

    const note = await newCourse.save();

    return note;
  };

  const user = await currentUser();

  if (!user || !user.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { title, emoji } = await request.json();

  if (!title || !emoji) {
    return Response.json({ error: 'Invalid request' }, { status: 400 });
  }

  const note = await addNoteToDb(title, emoji, user.id);

  return Response.json({
    _id: note._id,
    title: note.title,
    createdAt: note.createdAt,
    emoji: note.emoji,
    updatedAt: note.updatedAt,
    userId: note.userId,
  });
}
