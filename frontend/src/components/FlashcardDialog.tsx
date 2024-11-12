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
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { INoteDocument } from '@/lib/models/Note';
import { useRouter } from 'next/navigation';
import { useCoursesContext } from '@/lib/hooks/useCourseContext';
import { NoteTable } from './NoteTable';

interface NoteDialogProps {
  trigger: ReactNode;
  onClose?: () => void;
}

const FlashcardDialog = ({ trigger, onClose }: NoteDialogProps) => {
  const { selectedCourse } = useCoursesContext();
  const router = useRouter();

  const [selectedNotes, setSelectedNotes] = useState<INoteDocument[]>([]);
  const [dialogIsOpen, setDialogIsOpen] = useState<boolean>(false);

  const generateFlashcardSet = async () => {
    if (!selectedNotes) return;

    const generatedFlashcardSet = await fetch('/api/ai/flashcards', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ notes: selectedNotes }),
    })
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          return { title: '', flashcards: [] };
        }
      })
      .then(data => {
        return data;
      });

    const res = await fetch(`/api/courses/${selectedCourse}/flashcards`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ generatedFlashcardSet: generatedFlashcardSet }),
    });

    if (!res.ok) {
      throw new Error('Failed to add flashcard set');
    }

    const newFlashcardSet = await res.json();

    // TODO: mutate the sidebar to include the new flashcard set
    // mutate([...notes, newFlashcardSet], false);

    router.push(`/courses/${selectedCourse}/flashcards/${newFlashcardSet._id}`);
  };

  const handleSave = async () => {
    await generateFlashcardSet();
    setDialogIsOpen(false);
    if (onClose) {
      onClose();
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
      <DialogContent onClick={e => e.stopPropagation()} className='max-w-[512px]'>
        <DialogHeader>
          <DialogTitle>Generate Flashcards</DialogTitle>
        </DialogHeader>
        <DialogDescription>Select notes to generate flashcards</DialogDescription>
        <div className='grid gap-4 py-4'>
          <NoteTable selectedCourse={selectedCourse} setSelectedNotes={setSelectedNotes} />
        </div>
        <DialogFooter>
          <div className='flex flex-col items-center gap-2 max-w-[400px]'>
            <Button onClick={handleSave} type='submit' className='w-full' disabled={selectedNotes.length === 0}>
              Generate Flashcards
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FlashcardDialog;
