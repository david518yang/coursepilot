'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { useCoursesContext } from '@/lib/hooks/useCourseContext';

export default function Page({ params }: { params: { courseId: string; documentId: string } }) {
  const pdfUrl = '/coursepilot-pilone-assignment.pdf';

  const { setSelectedCourse } = useCoursesContext();

  setSelectedCourse(params.courseId);

  return (
    <div className='relative h-full w-full'>
      <div className='sticky top-0 z-10 flex flex-row justify-between p-2 border-b bg-background'>
        <div className='flex gap-1 items-center'>
          <SidebarTrigger />
        </div>
      </div>
      <iframe src={pdfUrl} className='w-full h-full' title='PDF Viewer' />
    </div>
  );
}
