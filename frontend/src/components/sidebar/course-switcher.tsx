'use client';

import * as React from 'react';
import Link from 'next/link';
import { ChevronsUpDown, Plus, FolderClosed, Settings } from 'lucide-react';

import { Button } from '@/components/ui/button';

import useSWR from 'swr';
import { INoteDocument } from '@/lib/models/Note';
import { fetcher } from '@/lib/utils';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  // DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import CourseDialog from '@/components/CourseDialog';
import { useCoursesContext } from '@/lib/hooks/useCourseContext';
import { useParams } from 'next/navigation';

export function CourseSwitcher() {
  const { isMobile, state } = useSidebar();
  const { courses } = useCoursesContext();

  const params = useParams<{ courseId: string; noteId: string }>();

  const selectedCourse = params.courseId;

  const { data: notes } = useSWR<INoteDocument[]>(
    selectedCourse ? `/api/courses/${selectedCourse}/notes` : null,
    fetcher
  );

  if (courses.length === 0) {
    return (
      <CourseDialog
        trigger={
          <SidebarMenuButton
            size='lg'
            className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
          >
            <div className='flex aspect-square size-8 items-center justify-center rounded-lg border border-sidebar-border text-sidebar-primary'>
              <Plus className='size-4' />
            </div>
            <div className='grid flex-1 text-left text-sm leading-tight'>
              <span className='truncate font-semibold'>No courses</span>
              <span className='truncate text-xs'>Create your first course</span>
            </div>
          </SidebarMenuButton>
        }
        editing={false}
      />
    );
  }

  const selectedCourseObject = courses.find(course => course._id === selectedCourse);

  const getCourseSubText = (noteCount: number) => {
    if (noteCount === 0) return 'No notes';
    if (noteCount === 1) return '1 note';
    return `${noteCount} notes`;
  };

  const activeCourse = {
    name: selectedCourseObject?.title || 'No course',
    emoji: selectedCourseObject?.emoji || '',
    subtext: notes
      ? getCourseSubText(notes.length)
      : selectedCourseObject
        ? getCourseSubText(selectedCourseObject?.notes?.length)
        : 'Select a course',
  };

  return (
    <SidebarMenu>
      <div className='flex items-center gap-1'>
        <SidebarMenuItem className='w-full'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size='lg'
                className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
              >
                <div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-secondary border border-sidebar-border text-sidebar-primary-foreground'>
                  {activeCourse.emoji ? activeCourse.emoji : <FolderClosed className='text-sidebar-primary w-4 h-4' />}
                </div>
                <div className='grid flex-1 text-left text-sm leading-tight'>
                  <span className='truncate font-semibold'>{activeCourse.name}</span>
                  <span className='truncate text-xs'>{activeCourse.subtext}</span>
                </div>
                <ChevronsUpDown className='ml-auto' />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className='w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg'
              align='start'
              side={isMobile ? 'bottom' : 'right'}
              sideOffset={4}
            >
              <DropdownMenuLabel className='text-xs text-muted-foreground'>Courses</DropdownMenuLabel>
              {courses.map(course => (
                <DropdownMenuItem key={course.title} asChild>
                  <Link href={`/courses/${course._id}`} className='gap-2 p-2'>
                    <div className='flex size-6 items-center justify-center rounded-sm border'>{course.emoji}</div>
                    {course.title}
                    {/* Not sure how this works so commented out for now
                 <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut> */}
                    <div className='ml-auto text-xs text-muted-foreground'>{getCourseSubText(course.notes.length)}</div>
                  </Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <CourseDialog
                  trigger={
                    <Button
                      variant='ghost'
                      className='gap-2 p-2 w-full relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent data-[disabled]:pointer-events-none data-[disabled]:opacity-50'
                    >
                      <div className='flex size-6 items-center justify-center rounded-md border bg-background'>
                        <Plus className='size-4' />
                      </div>
                      <div className='font-medium text-muted-foreground mr-auto'>Add course</div>
                    </Button>
                  }
                  editing={false}
                />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
        <CourseDialog
          trigger={
            <Button size='icon' variant='ghost' className='aspect-square w-7 h-7'>
              {state === 'expanded' && <Settings className='h-4 w-4' />}
            </Button>
          }
          editing={true}
        />
      </div>
    </SidebarMenu>
  );
}
