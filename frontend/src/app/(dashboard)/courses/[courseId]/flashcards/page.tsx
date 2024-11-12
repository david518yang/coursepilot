'use client';

import { useCoursesContext } from '@/lib/hooks/useCourseContext';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { FileText, BookOpenCheck, Library } from 'lucide-react';

export default function Page({ params }: { params: { courseId: string } }) {
  const { setSelectedCourse } = useCoursesContext();

  setSelectedCourse(params.courseId);

  return (
    <div className='grid grid-rows-[auto_1fr] h-screen'>
      <div className='sticky top-0 z-10 flex flex-row justify-between p-2 border-b bg-background'>
        <SidebarTrigger />
      </div>
      <div className='grid place-items-center h-full w-full text-xl flex-1 bg-gray-200'>
        <div className='flex flex-col items-center gap-2'>
          <div className='flex items-center gap-2'>
            <BookOpenCheck className='w-10 h-10' />
            <FileText className='w-10 h-10' />
            <Library className='w-10 h-10' />
          </div>
          <h3 className=''>Create or select a document</h3>
        </div>
      </div>
    </div>
  );
}
