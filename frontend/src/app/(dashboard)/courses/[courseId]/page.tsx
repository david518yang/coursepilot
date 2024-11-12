import Course from '@/lib/models/Course';
import CourseView from './CourseView';
import { Types } from 'mongoose';
import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';

async function checkIfCourseExists(userId: string, courseId: string): Promise<boolean> {
  // Validate if courseId is a valid ObjectId first
  if (!Types.ObjectId.isValid(courseId)) {
    return false;
  }

  const course = await Course.findOne({ userId, _id: courseId }).lean();

  return !!course;
}

export default async function Page({ params }: { params: { courseId: string } }) {
  const { userId } = auth();

  if (!userId) return redirect('/');

  const courseExists = await checkIfCourseExists(userId, params.courseId);

  if (!courseExists) return redirect('/courses');

  return <CourseView courseId={params.courseId} />;
}
