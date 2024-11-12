import { currentUser } from '@clerk/nextjs/server';
import Course from '@/lib/models/Course'; // Ensure the Course model is imported

export async function PATCH(request: Request, { params }: { params: { courseId: string } }) {
  const user = await currentUser();

  if (!user || !user.id) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const { courseId } = params;

  try {
    const updatedData = await request.json();

    if (updatedData.title && updatedData.title.length > 15) {
      return Response.json({ error: 'Note title must be 15 characters or less' }, { status: 400 });
    }

    // Find the course by ID and ensure it belongs to the current user
    const course = await Course.findOneAndUpdate(
      { _id: courseId, userId: user.id },
      { $set: updatedData }, // Update with the new data
      { new: true } // Return the updated document
    );

    if (!course) {
      return new Response(JSON.stringify({ error: 'Course not found or unauthorized' }), { status: 404 });
    }

    return new Response(JSON.stringify({ message: 'Course updated successfully', course }), { status: 200 });
  } catch (error) {
    console.error('Error updating course:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { courseId: string } }) {
  const user = await currentUser();

  if (!user || !user.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { courseId } = params;

  try {
    // Find the course by ID and ensure it belongs to the current user
    const course = await Course.findOneAndDelete({
      _id: courseId,
      userId: user.id,
    });

    if (!course) {
      return Response.json({ error: 'Course not found or unauthorized' }, { status: 404 });
    }

    return Response.json({ message: 'Course deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting course:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
