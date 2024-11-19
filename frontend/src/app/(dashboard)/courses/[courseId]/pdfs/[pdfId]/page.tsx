'use client';

import { useCoursesContext } from '@/lib/hooks/useCourseContext';
import { SidebarTrigger } from '@/components/ui/sidebar';
import useSWR from 'swr';
import { fetcher } from '@/lib/utils';

export default function Page({ params }: { params: { courseId: string; pdfId: string } }) {
  const { setSelectedCourse } = useCoursesContext();

  // Fetch PDF data using SWR
  const { data, error, isLoading } = useSWR(`/api/courses/${params.courseId}/documents/pdf/${params.pdfId}`, fetcher);

  // Set selected course in context
  setSelectedCourse(params.courseId);

  const { pdf } = data || {};
  const pdfDataURI = `data:application/pdf;base64,${pdf?.content}`;

  return (
    <div className='grid grid-rows-[auto_1fr] h-screen bg-slate-200'>
      <div className='sticky top-0 z-10 flex flex-row p-2 border-b bg-sidebar gap-1'>
        <SidebarTrigger />
        {pdf && <h1 className='text-lg font-semibold'>{pdf.filename}</h1>}
      </div>
      <div className='overflow-auto grid place-items-center'>
        {isLoading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>Error loading PDF</p>
        ) : (
          pdf && <iframe src={pdfDataURI} title='PDF Viewer' className='w-full h-full border' />
        )}
      </div>
    </div>
  );
}
