'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { PencilSquareIcon } from '@heroicons/react/20/solid';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Plus } from 'lucide-react';
import Link from 'next/link';
import CourseDialog from './editor/CourseDialog';

import clsx from 'clsx';

import { useParams } from 'next/navigation';
import { useCoursesContext } from '@/lib/hooks/useCourseContext';

export default function Sidebar() {
  const params = useParams<{ courseId: string; noteId: string }>();

  const { courses } = useCoursesContext();

  return (
    <div className='grid grid-cols[1fr_1fr] w-64 h-screen bg-background border-r'>
      <div className='p-4 flex justify-between items-center'>
        <h2 className='text-lg font-semibold'>My Courses</h2>
        <CourseDialog
          trigger={
            <Button size='icon' variant='ghost'>
              <Plus className='h-4 w-4' />
            </Button>
          }
          editing={false}
        />
      </div>
      <ScrollArea className='h-[calc(100vh-100px)]'>
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
    </div>
  );
}
