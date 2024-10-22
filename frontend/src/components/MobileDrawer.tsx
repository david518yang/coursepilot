import { useState, useEffect } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { PencilSquareIcon } from '@heroicons/react/20/solid';
import { FileText, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { useParams } from 'next/navigation';
import { useCoursesContext } from '@/lib/hooks/useCourseContext';
import Link from 'next/link';
import CourseDialog from './editor/CourseDialog';
import clsx from 'clsx';
import { ScrollArea } from './ui/scroll-area';

const MobileDrawer = () => {
  const params = useParams<{ courseId: string; noteId: string }>();
  const { courses } = useCoursesContext();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  if (!isMobile) {
    return null;
  }

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button
          className='absolute bottom-4 z-50 right-4 bg-background rounded-lg text-foreground sm:hidden flex'
          variant='outline'
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            strokeWidth={1.5}
            stroke='currentColor'
            className='size-6'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z'
            />
          </svg>
        </Button>
      </DrawerTrigger>
      <DrawerContent className='max-h-[80vh]'>
        <DrawerHeader>
          <DrawerTitle>My Courses</DrawerTitle>
        </DrawerHeader>
        <ScrollArea className='overflow-auto'>
          <Accordion type='multiple' className='w-full'>
            {courses.map(course => (
              <AccordionItem value={course._id} key={course._id}>
                <AccordionTrigger
                  onClick={e => e.stopPropagation()} // This prevents the click from bubbling up to the accordion trigger
                  className={clsx(
                    'px-4 py-2 text-sm hover:no-underline hover:bg-muted',
                    course._id === params.courseId && 'bg-muted'
                  )}
                >
                  <div className='flex items-center justify-between w-full mr-1'>
                    <div className='flex items-center'>
                      {<span className='mr-2'>{course.emoji}</span>}
                      {course.title}
                    </div>
                    <CourseDialog
                      course={course}
                      editing={true}
                      trigger={<PencilSquareIcon onClick={e => e.stopPropagation()} className='w-4 h-4' />}
                    />
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className='pl-4'>
                    {course.notes.map(note => (
                      <Link
                        href={`/editor/${course._id}/notes/${note._id}`}
                        key={note._id}
                        className={clsx(
                          'flex items-center px-4 py-2 text-sm hover:bg-muted',
                          params.noteId === note._id && 'bg-muted'
                        )}
                      >
                        <FileText className='h-4 w-4 mr-2' />
                        {note.title}
                      </Link>
                    ))}
                    <Button variant='ghost' size='sm' className='w-full justify-start px-4 py-2 text-sm'>
                      <Plus className='h-4 w-4 mr-2' />
                      Add Note
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
};

export default MobileDrawer;
