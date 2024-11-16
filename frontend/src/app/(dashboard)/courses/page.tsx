import { SidebarTrigger } from '@/components/ui/sidebar';
import { FolderClosed } from 'lucide-react';
import { auth } from '@clerk/nextjs/server';
import Course from '@/lib/models/Course';
import { redirect } from 'next/navigation';

async function getUsersFirstCourse(userId: string): Promise<string | null> {
  const courses = await Course.find({ userId }).lean();

  if (courses.length === 0) return null;

  return courses[0]._id.toString();
}

export default async function Page() {
  const { userId } = auth();

  if (!userId) return redirect('/');

  const firstCourseId = await getUsersFirstCourse(userId);

  if (firstCourseId) return redirect(`/courses/${firstCourseId}`);

  return (
    <div className='grid grid-rows-[auto_1fr] h-screen'>
      <div className='sticky top-0 z-10 flex flex-row justify-between p-2 border-b bg-sidebar'>
        <SidebarTrigger />
      </div>
      <div className='grid place-items-center h-full w-full text-xl flex-1 bg-gray-200'>
        <div className='flex flex-col items-center gap-2'>
          <FolderClosed className='w-10 h-10' />
          <h3 className=''>Create or select a course</h3>
        </div>
      </div>
    </div>
  );
}
