'use client';

import { useState, ReactNode } from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'; // Adjust imports to your Dialog component setup
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { SidebarItem } from './sidebar/course-content-list';
import useSWR from 'swr';
import { useRouter } from 'next/navigation';
import { fetcher } from '@/lib/utils';
import { useCoursesContext } from '@/lib/hooks/useCourseContext';

interface NoteDialogProps {
  trigger: ReactNode;
  editing: boolean;
  onClose?: () => void;
}

const NoteDialog = ({ trigger, editing, onClose }: NoteDialogProps) => {
  const { selectedCourse } = useCoursesContext();
  const router = useRouter();

  const [noteName, setNoteName] = useState<string>('');
  const [dialogIsOpen, setDialogIsOpen] = useState<boolean>(false);
  const { data, mutate } = useSWR<SidebarItem[]>(
    selectedCourse ? `/api/courses/${selectedCourse}/documents` : null,
    fetcher
  );
  const [error, setError] = useState<string | null>(null);

  const addNote = async (): Promise<boolean> => {
    if (!data) return false;

    const res = await fetch(`/api/courses/${selectedCourse}/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title: noteName }),
    });

    if (!res.ok) {
      const errorResponse = await res.json();
      setError(errorResponse.error);
      return false;
    }

    const newNote = await res.json();

    mutate([...data, newNote], false);

    router.push(`/courses/${selectedCourse}/notes/${newNote._id}`);

    return true;
  };

  const handleSave = async () => {
    const isSuccess = await addNote();

    if (isSuccess) {
      setDialogIsOpen(false);
      if (onClose) {
        onClose();
      }
    }
  };

  const handleDialogOpenChange = (isOpen: boolean) => {
    setDialogIsOpen(isOpen);
    if (!isOpen && onClose) {
      onClose();
    }
  };

  return (
    <Dialog open={dialogIsOpen} onOpenChange={handleDialogOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent onClick={e => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit Note' : 'Create note'}</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          {editing ? 'Update your note details.' : 'You can always edit your note name in the future.'}
        </DialogDescription>
        <div className='grid gap-4 py-4'>
          <div className='grid grid-cols-4 items-center gap-4'>
            <Label htmlFor='name' className='text-right'>
              Note name
            </Label>
            <div className='flex gap-1 col-span-3'>
              <Input
                id='name'
                value={noteName}
                onChange={e => setNoteName(e.target.value)}
                placeholder='Enter note name...'
                className='col-span-3'
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <p className='text-red-500 text-sm mx-auto pt-2 sm:pt-0 sm:mx-0 my-auto sm:mr-4'>{error}</p>
          <div className='flex items-center gap-2'>
            {/* {editing && selectedCourseObject && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button onClick={() => {}} variant='destructive' className='mr-auto'>
                    <TrashIcon className='w-5 h-5' />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete {selectedCourseObject?.title}</DialogTitle>
                  </DialogHeader>
                  <DialogDescription>Are you sure you want to delete this course?</DialogDescription>
                  <DialogFooter>
                    <Button
                      onClick={() => {
                        if (selectedCourseObject) {
                          deleteCourse(selectedCourseObject._id);
                          setDialogIsOpen(false);
                          window.location.href = '/editor';
                        }
                      }}
                      variant='destructive'
                    >
                      Delete
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )} */}
            <Button onClick={handleSave} type='submit' className='w-full'>
              {editing ? 'Save Changes' : 'Create Note'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NoteDialog;
