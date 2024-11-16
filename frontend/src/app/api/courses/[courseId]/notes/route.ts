import { currentUser } from '@clerk/nextjs/server';
import Note, { INoteDocument } from '@/lib/models/Note';
import { SidebarItem } from '@/components/sidebar/course-content-list';

export async function GET(request: Request, { params }: { params: { courseId: string } }) {
  const getNotesFromCourse = async (courseId: string, userId: string): Promise<INoteDocument[]> => {
    const notes = await Note.find({ courseId, userId }).sort({ updatedAt: 'desc' });

    return notes;
  };

  const user = await currentUser();

  if (!user || !user.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const notes = await getNotesFromCourse(params.courseId, user.id);

  return Response.json(notes);
}

export async function POST(request: Request, { params }: { params: { courseId: string } }) {
  const addNoteToCourse = async (courseId: string, title: string, userId: string): Promise<SidebarItem> => {
    const newNote = new Note({
      courseId,
      title,
      userId,
      content: '',
    });

    const note = await newNote.save();

    return {
      _id: note._id.toString(),
      title: note.title,
      type: 'note',
      url: `/courses/${courseId}/notes/${note._id}`,
      updatedAt: note.updatedAt.toISOString(),
    };
  };

  const user = await currentUser();

  if (!user || !user.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  if (!body.title) {
    return Response.json({ error: 'Invalid request' }, { status: 400 });
  }

  if (body.title.length > 15) {
    return Response.json({ error: 'Course title must be 15 characters or less' }, { status: 400 });
  }

  const note = await addNoteToCourse(params.courseId, body.title, user.id);

  return Response.json(note);
}
