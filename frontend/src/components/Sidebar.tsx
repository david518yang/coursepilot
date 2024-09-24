'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, FolderClosed, Plus } from 'lucide-react';
import Link from 'next/link';

interface Note {
  id: string;
  title: string;
}

interface Class {
  id: string;
  name: string;
  notes: Note[];
}

const classes: Class[] = [
  {
    id: 'math101',
    name: 'Mathematics 101',
    notes: [
      { id: 'math1', title: 'Algebra Basics' },
      { id: 'math2', title: 'Trigonometry Introduction' }
    ]
  },
  {
    id: 'cs201',
    name: 'Computer Science 201',
    notes: [
      { id: 'cs1', title: 'Data Structures' },
      { id: 'cs2', title: 'Algorithms' }
    ]
  },
  {
    id: 'bio301',
    name: 'Biology 301',
    notes: [
      { id: 'bio1', title: 'Cell Structure' },
      { id: 'bio2', title: 'Genetics Basics' }
    ]
  }
];

export default function Sidebar() {
  return (
    <div className='w-64 h-screen bg-background border-r'>
      <div className='p-4 flex justify-between items-center'>
        <h2 className='text-lg font-semibold'>My Notes</h2>
        <Button size='icon' variant='ghost'>
          <Plus className='h-4 w-4' />
        </Button>
      </div>
      <ScrollArea className='h-[calc(100vh-64px)]'>
        <Accordion type='multiple' className='w-full'>
          {classes.map(classItem => (
            <AccordionItem value={classItem.id} key={classItem.id}>
              <AccordionTrigger className='px-4 py-2 text-sm hover:no-underline hover:bg-muted'>
                <div className='flex items-center'>
                  <FolderClosed className='h-4 w-4 mr-2' />
                  {classItem.name}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className='pl-4'>
                  {classItem.notes.map(note => (
                    <Link
                      href={`/notes/${classItem.id}/${note.id}`}
                      key={note.id}
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

