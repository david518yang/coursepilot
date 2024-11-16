import { currentUser } from '@clerk/nextjs/server';
import Note, { INoteDocument } from '@/lib/models/Note';

export async function GET(request: Request, { params }: { params: { courseId: string; noteId: string } }) {
  const getNoteFromCourse = async (courseId: string, noteId: string, userId: string): Promise<INoteDocument | null> => {
    const note = await Note.findOne({ _id: noteId, courseId, userId });

    return note;
  };

  const user = await currentUser();

  if (!user || !user.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const note = await getNoteFromCourse(params.courseId, params.noteId, user.id);

  if (!note) {
    return Response.json({ error: 'Note not found or unauthorized' }, { status: 404 });
  }

  return Response.json(note, { status: 200 });
}

export async function DELETE(request: Request, { params }: { params: { courseId: string; noteId: string } }) {
  const deleteNoteFromCourse = async (
    courseId: string,
    noteId: string,
    userId: string
  ): Promise<INoteDocument | null> => {
    const note = await Note.findOneAndDelete({ _id: noteId, courseId, userId });

    return note;
  };

  const user = await currentUser();

  if (!user || !user.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const note = await deleteNoteFromCourse(params.courseId, params.noteId, user.id);

  if (!note) {
    return Response.json({ error: 'Note not found or unauthorized' }, { status: 404 });
  }

  return Response.json({ message: 'Note deleted successfully' }, { status: 200 });
}

export async function PATCH(request: Request, { params }: { params: { courseId: string; noteId: string } }) {
  const updateNoteContent = async (
    courseId: string,
    noteId: string,
    updatedContent: string,
    userId: string
  ): Promise<INoteDocument | null> => {
    const note = await Note.findOneAndUpdate(
      { _id: noteId, courseId, userId },
      { $set: { content: updatedContent } },
      { new: true }
    );

    return note;
  };

  const updateNoteTitle = async (
    courseId: string,
    noteId: string,
    newTitle: string,
    userId: string
  ): Promise<INoteDocument | null> => {
    const note = await Note.findOneAndUpdate(
      { _id: noteId, courseId, userId },
      { $set: { title: newTitle } },
      { new: true }
    );

    return note;
  };

  const user = await currentUser();

  if (!user || !user.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { content, title } = await request.json();

  if (content) {
    const note = await updateNoteContent(params.courseId, params.noteId, content, user.id);

    if (!note) {
      return Response.json({ error: 'Note not found or unauthorized' }, { status: 404 });
    }

    return Response.json({ message: 'Note updated successfully', note }, { status: 200 });
  }

  if (title) {
    const note = await updateNoteTitle(params.courseId, params.noteId, title, user.id);

    if (!note) {
      return Response.json({ error: 'Note not found or unauthorized' }, { status: 404 });
    }

    return Response.json({ message: 'Note updated successfully', note }, { status: 200 });
  }

  return Response.json({ message: 'Invalid params' }, { status: 400 });
}
