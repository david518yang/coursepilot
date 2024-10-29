'use client';

import { Ellipsis, Trash2, type LucideIcon } from 'lucide-react';
import { PlusIcon } from '@heroicons/react/20/solid';
import { INoteDocument } from '@/lib/models/Note';
import { useCoursesContext } from '@/lib/hooks/useCourseContext';
import useSWR from 'swr';
import { FileText } from 'lucide-react';
import { fetcher } from '@/lib/utils';
import NoteDialog from '../NoteDialog';
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
  SidebarGroupAction,
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

export interface SideBarMenuItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  isActive?: boolean;
}

export function NoteList() {
  const router = useRouter();
  const pathname = usePathname();
  const { selectedCourse } = useCoursesContext();

  const { data, mutate } = useSWR<INoteDocument[]>(
    selectedCourse ? `/api/courses/${selectedCourse}/notes` : null,
    fetcher
  );

  // State to track the current active note ID
  const [selectedNoteId, setSelectedNoteId] = useState<string | undefined>();

  // Update selectedNoteId whenever the route changes
  useEffect(() => {
    const noteId = pathname.split('/').pop();
    setSelectedNoteId(noteId);
  }, [pathname]);

  const notes =
    data?.map(note => ({
      title: note.title,
      url: `/editor/${selectedCourse}/${note._id}`,
      icon: FileText,
      id: note._id,
      isActive: note._id === selectedNoteId,
      updatedAt: note.updatedAt,
    })) || [];

  const deleteNote = async (noteId: string) => {
    try {
      const res = await fetch(`/api/courses/${selectedCourse}/notes/${noteId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        throw new Error('Failed to delete note');
      }
      // Update the local cache to remove the deleted note
      mutate(
        data?.filter(note => note._id !== noteId),
        false
      );

      const newNotes = data?.filter(note => note._id !== noteId);

      router.push(`/editor/${selectedCourse}${newNotes && newNotes[0] ? `/${newNotes[0]._id}` : ''}`);
    } catch (error) {
      console.error(error);
      alert('Failed to delete note');
    }
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Notes</SidebarGroupLabel>
      <NoteDialog
        trigger={
          <SidebarGroupAction title='Add Note'>
            <PlusIcon /> <span className='sr-only'>Add Note</span>
          </SidebarGroupAction>
        }
        editing={false}
      />

      <SidebarMenu>
        {notes.map(item => (
          <SidebarMenuItem key={item.title} className='flex items-center gap-0.5'>
            <SidebarMenuButton asChild>
              <div className={clsx('flex items-center w-full h-min', item.isActive && 'bg-sidebar-accent')}>
                <Link
                  href={item.url}
                  onClick={() => {
                    item.isActive = true;
                  }}
                  prefetch={false}
                  className='flex items-center w-full h-min'
                >
                  <div className='flex items-center overflow-ellipsis'>
                    {item.icon && <item.icon className='flex-shrink-0 mr-2' />}
                    <div className='flex flex-col'>
                      <span className='truncate'>{item.title}</span>
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
                          <DialogDescription>Are you sure you want to delete this note?</DialogDescription>
                          <DialogFooter>
                            <Button
                              onClick={() => {
                                deleteNote(item.id);
                                // This is a hack to force a re-render of the sidebar, needs rework
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
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
