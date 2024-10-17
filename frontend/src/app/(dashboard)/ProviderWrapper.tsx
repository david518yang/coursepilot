'use client';

import { CoursesProvider } from '@/lib/hooks/useCourseContext';
import { ICourseWithNotes } from '@/lib/models/Course';

import Sidebar from '@/components/Sidebar';

export function ProviderWrapper({
  children,
  initialCourses,
}: {
  children: React.ReactNode;
  initialCourses: ICourseWithNotes[];
}) {
  return (
    <CoursesProvider initialCourses={initialCourses}>
      <div className='h-screen flex'>
        <Sidebar />
        <div className='flex-1'>
          <main className='w-full h-full overflow-auto'>{children}</main>
        </div>
      </div>
    </CoursesProvider>
  );
}
