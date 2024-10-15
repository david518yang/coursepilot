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
import EmojiPicker from '@/components/editor/emojiPicker/EmojiPicker';
import { ICourseWithNotes } from '@/lib/models/Course';
import { useCoursesContext } from '@/lib/hooks/useCourseContext';
import { TrashIcon } from '@heroicons/react/20/solid';

interface CreateCourseDialogProps {
  trigger: ReactNode;
  editing: boolean;
  course?: ICourseWithNotes;
}

const CreateCourseDialog: React.FC<CreateCourseDialogProps> = ({ trigger, editing, course }) => {
  const { addCourse, updateCourse, deleteCourse } = useCoursesContext();

  const [courseName, setCourseName] = useState<string>(course?.title || '');
  const [selectedEmoji, setSelectedEmoji] = useState<string>(course?.emoji || '📝');
  const [dialogIsOpen, setDialogIsOpen] = useState<boolean>(false);

  const handleSave = () => {
    if (editing && course) {
      updateCourse(course._id, { title: courseName, emoji: selectedEmoji });
    } else {
      addCourse(courseName, selectedEmoji);
    }
    setDialogIsOpen(false);
  };

  return (
    <Dialog open={dialogIsOpen} onOpenChange={setDialogIsOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent onClick={e => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit Course' : 'Create a Course'}</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          {editing ? 'Update your course details.' : 'You can always edit your course name in the future.'}
        </DialogDescription>
        <div className='grid gap-4 py-4'>
          <div className='grid grid-cols-4 items-center gap-4'>
            <Label htmlFor='name' className='text-right'>
              Course name
            </Label>
            <div className='flex gap-1 col-span-3'>
              <Input
                id='name'
                value={courseName}
                onChange={e => setCourseName(e.target.value)}
                placeholder='Enter course name...'
                className='col-span-3'
              />
              {/* Implement your own EmojiPicker component */}
              <EmojiPicker selectedEmoji={selectedEmoji} setSelectedEmoji={setSelectedEmoji} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <div className='flex items-center gap-2'>
            {editing && course && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button onClick={() => {}} variant='destructive' className='mr-auto'>
                    <TrashIcon className='w-5 h-5' />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete {course?.title}</DialogTitle>
                  </DialogHeader>
                  <DialogDescription>Are you sure you want to delete this course?</DialogDescription>
                  <DialogFooter>
                    <Button
                      onClick={() => {
                        if (course) {
                          deleteCourse(course._id);
                          setDialogIsOpen(false);
                        }
                      }}
                      variant='destructive'
                    >
                      Delete
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
            <Button onClick={handleSave} type='submit' className='w-full'>
              {editing ? 'Save Changes' : 'Create Course'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCourseDialog;
