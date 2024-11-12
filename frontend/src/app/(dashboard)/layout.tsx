import { auth } from '@clerk/nextjs/server';
import Course, { ICourseWithNotes } from '@/lib/models/Course';
import Note from '@/lib/models/Note';

import { connectToMongoDB } from '@/lib/db';
import { ProviderWrapper } from './ProviderWrapper';
import { redirect } from 'next/navigation';

async function getCoursesFromDb(userId: string): Promise<ICourseWithNotes[]> {
  await connectToMongoDB();

  const courses = await Course.find({ userId }).lean();

  const coursesWithNotes = (await Promise.all(
    courses.map(async course => {
      const notes = await Note.find({ userId, courseId: course._id }, 'title _id').lean();
      return {
        ...course,
        _id: course._id.toString(),
        notes: notes.map(note => ({
          ...note,
          _id: note._id.toString(),
        })),
      };
    })
  )) as ICourseWithNotes[];

  return coursesWithNotes;
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = auth();

  if (!userId) return redirect('/');

  const courses = await getCoursesFromDb(userId);

  return (
    <html>
      <body>
        <ProviderWrapper initialCourses={courses}>{children}</ProviderWrapper>
      </body>
    </html>
  );
}
