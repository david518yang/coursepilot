'use client';

import { BookOpen, Ellipsis, Trash2, type LucideIcon } from 'lucide-react';
import { INoteDocument } from '@/lib/models/Note';
import { useCoursesContext } from '@/lib/hooks/useCourseContext';
import useSWR from 'swr';
import { FileText, BookOpenCheck, Library } from 'lucide-react';
import { fetcher } from '@/lib/utils';
import moment from 'moment';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import clsx from 'clsx';
import { usePathname, useRouter } from 'next/navigation';

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useEffect, useState } from 'react';
import CreateButton from './create-button';
import { useParams } from 'next/navigation';
import path from 'path';

export interface SideBarMenuItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  isActive?: boolean;
}

export interface SidebarItem {
  title: string;
  type: string;
  _id: string;
  url: string;
  updatedAt: string;
}

export function CourseContentList() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ courseId: string; noteId: string }>();

  const selectedCourse = params.courseId;

  const { data, mutate, isLoading } = useSWR<SidebarItem[]>(
    selectedCourse ? `/api/courses/${selectedCourse}/documents` : null,
    fetcher
  );

  // State to track the current active note ID
  const [selectedNoteId, setSelectedNoteId] = useState<string | undefined>();

  const deleteItem = async (itemId: string, type: string) => {
    try {
      const res = await fetch(`/api/courses/${selectedCourse}/${type}s/${itemId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        throw new Error(`Failed to delete ${type}`);
      }

      // Update the local cache to remove the deleted item
      mutate(
        data?.filter(data => data._id !== itemId),
        false
      );

      // Only need to do this if the current page is the deleted item
      if (pathname.includes(itemId)) {
        const newData = data?.filter(item => item._id !== itemId);
        router.push(
          `/courses/${selectedCourse}${newData && newData[0] ? `/${newData[0].type}s/${newData[0]._id}` : ''}`
        );
      }
    } catch (error) {
      console.error(error);
      alert('Failed to delete note');
    }
  };

  const iconMap: Record<string, LucideIcon> = {
    note: FileText,
    flashcard: Library,
    quiz: BookOpenCheck,
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Course Material</SidebarGroupLabel>
      <CreateButton />
      <SidebarMenu>
        {isLoading
          ? Array.from({ length: 4 }).map((_, index) => (
              <SidebarMenuItem key={`skeleton-${index}`} className='flex items-center gap-0.5'>
                <div className='w-full flex items-center bg-gray-100 rounded-md p-2 py-3'>
                  <div className='w-6 h-6 bg-gray-200 rounded-full mr-2'></div>
                  <div className='flex flex-col space-y-1'>
                    <div className='h-4 bg-gray-200 rounded w-16' />
                    <div className='h-3 bg-gray-200 rounded w-24' />
                  </div>
                </div>
              </SidebarMenuItem>
            ))
          : data &&
            data.map(item => {
              const Icon = iconMap[item.type];
              const isActive = pathname.includes(item._id);
              return (
                <SidebarMenuItem key={item.title} className='flex items-center gap-0.5'>
                  <SidebarMenuButton asChild>
                    <div className={clsx('flex items-center w-full h-min', isActive && 'bg-sidebar-accent')}>
                      <Link href={item.url} prefetch={false} className='flex items-center w-full h-min'>
                        <div className='flex items-center overflow-ellipsis'>
                          {Icon && <Icon className='flex-shrink-0 mr-2' />}
                          <div className='flex flex-col'>
                            <span className='truncate overlow-hidden whitespace-nowrap w-36'>{item.title}</span>
                            <span className='text-xs text-gray-500'>{moment(item.updatedAt).fromNow()}</span>
                          </div>
                        </div>
                      </Link>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size='icon'
                            variant='ghost'
                            className='flex-shrink-0 ml-auto'
                            onClick={e => {
                              e.stopPropagation();
                            }}
                          >
                            <Ellipsis className='w-4 h-4 text-gray-400' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem
                            onClick={e => {
                              e.stopPropagation();
                            }}
                          >
                            <Dialog>
                              <DialogTrigger
                                asChild
                                onClick={e => {
                                  e.stopPropagation();
                                }}
                              >
                                <div className='flex items-center justify-between text-red-400 w-full'>
                                  Delete
                                  <Trash2 className='w-4 h-4 mr-2' />
                                </div>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Delete {item.title}</DialogTitle>
                                </DialogHeader>
                                <DialogDescription>Are you sure you want to delete this {item.type}?</DialogDescription>
                                <DialogFooter>
                                  <Button
                                    onClick={() => {
                                      deleteItem(item._id, item.type);
                                    }}
                                    variant='destructive'
                                  >
                                    Delete
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
