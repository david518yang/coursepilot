import { currentUser } from '@clerk/nextjs/server';
import Note, { INoteDocument } from '@/lib/models/Note';
import { SidebarItem } from '@/components/sidebar/course-content-list';
import { connectToMongoDB } from '@/lib/db';

export async function GET(request: Request, { params }: { params: { courseId: string } }) {
  try {
    const user = await currentUser();

    if (!user || !user.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ensure MongoDB connection is established before querying
    const connection = await connectToMongoDB();
    if (!connection) {
      console.error('Failed to connect to MongoDB');
      return Response.json({ error: 'Database connection error' }, { status: 500 });
    }

    const notes = await Note.find({
      courseId: params.courseId,
      userId: user.id,
    }).sort({ updatedAt: 'desc' });

    return Response.json(notes);
  } catch (error) {
    console.error('[NOTES_GET]', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: { courseId: string } }) {
  try {
    const user = await currentUser();

    if (!user || !user.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ensure MongoDB connection is established before creating note
    const connection = await connectToMongoDB();
    if (!connection) {
      console.error('Failed to connect to MongoDB');
      return Response.json({ error: 'Database connection error' }, { status: 500 });
    }

    const body = await request.json();

    if (!body.title) {
      return Response.json({ error: 'Title is required' }, { status: 400 });
    }

    const newNote = new Note({
      courseId: params.courseId,
      title: body.title,
      userId: user.id,
      content: '',
    });

    const note = await newNote.save();

    const sidebarItem: SidebarItem = {
      _id: note._id.toString(),
      title: note.title,
      type: 'note',
      url: `/courses/${params.courseId}/notes/${note._id}`,
      updatedAt: note.updatedAt.toISOString(),
    };

    return Response.json(sidebarItem);
  } catch (error) {
    console.error('[NOTES_POST]', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
