'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { FaceSmileIcon } from '@heroicons/react/20/solid';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAuth } from '@clerk/nextjs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, FolderClosed, Plus } from 'lucide-react';
import Link from 'next/link';

import { useState } from 'react';

import { useCoursesContext } from '@/lib/hooks/useCourseContext';

export default function Sidebar() {
  // For now I'm just passing the userId in the frontend, but will be handled by the backend in the future
  const { userId } = useAuth();

  const { courses, addCourse } = useCoursesContext();

  const [newCourseName, setNewCourseName] = useState('');

  return (
    <div className='w-64 h-screen bg-background border-r'>
      <div className='p-4 flex justify-between items-center'>
        <h2 className='text-lg font-semibold'>My Courses</h2>
        <Dialog>
          <DialogTrigger>
            <Button size='icon' variant='ghost'>
              <Plus className='h-4 w-4' />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a course</DialogTitle>
            </DialogHeader>
            <DialogDescription>
              You can always edit your course name in the future
            </DialogDescription>
            <div className='grid gap-4 py-4'>
              <div className='grid grid-cols-4 items-center gap-4'>
                <Label htmlFor='name' className='text-right'>
                  Course name
                </Label>
                <div className='flex gap-1 col-span-3'>
                  <Input
                    id='name'
                    value={newCourseName}
                    onChange={e => setNewCourseName(e.target.value)}
                    placeholder='Enter course name...'
                    className='col-span-3'
                  />
                  <Button variant='outline' className='w-9 h-9 p-1'>
                    <FaceSmileIcon className='w-12 h-12' />
                  </Button>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type='submit'>Save changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <ScrollArea className='h-[calc(100vh-64px)]'>
        <Accordion type='multiple' className='w-full'>
          {courses.map(course => (
            <AccordionItem value={course._id} key={course._id}>
              <AccordionTrigger className='px-4 py-2 text-sm hover:no-underline hover:bg-muted'>
                <div className='flex items-center'>
                  <FolderClosed className='h-4 w-4 mr-2' />
                  {course.title}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className='pl-4'>
                  {course.notes.map(note => (
                    <Link
                      href={`/courses/${course._id}/${note._id}`}
                      key={note._id}
                      className='flex items-center px-4 py-2 text-sm hover:bg-muted'
                    >
                      <FileText className='h-4 w-4 mr-2' />
                      {note.title}
                    </Link>
                  ))}
                  <Button
                    variant='ghost'
                    size='sm'
                    className='w-full justify-start px-4 py-2 text-sm'
                  >
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

