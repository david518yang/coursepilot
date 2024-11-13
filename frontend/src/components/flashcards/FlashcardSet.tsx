import React, { useEffect, useState } from 'react';
import { useCoursesContext } from '@/lib/hooks/useCourseContext';
import { IFlashcardSetDocument } from '@/lib/models/Flashcard';
import useSWR from 'swr';
import { fetcher } from '@/lib/utils';
import FlashcardCarousel from './FlashcardCarousel';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { SidebarItem } from '@/components/sidebar/course-content-list';
import { Input } from '@/components/ui/input';
import DocumentTitle from '../DocumentTitle';

const FlashcardSet = ({ flashcardId }: { flashcardId: string }) => {
  const { selectedCourse } = useCoursesContext();

  const { data: flashcardSet } = useSWR<IFlashcardSetDocument>(
    selectedCourse && flashcardId && `/api/courses/${selectedCourse}/flashcards/${flashcardId}`,
    fetcher
  );

  const { data: sidebarItems, mutate } = useSWR<SidebarItem[]>(
    selectedCourse ? `/api/courses/${selectedCourse}/documents` : null,
    fetcher
  );

  const [title, setTitle] = useState(flashcardSet?.title || '');

  const saveTitle = async () => {
    const res = await fetch(`/api/courses/${selectedCourse}/flashcards/${flashcardId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title }),
    });

    if (!res.ok) {
      const errorResponse = await res.json();
      console.error(errorResponse.error);
      return;
    }

    const updatedSidebarItem = {
      title,
      type: 'flashcard',
      _id: flashcardId,
      url: `/courses/${selectedCourse}/flashcards/${flashcardId}`,
      updatedAt: new Date().toISOString(),
    } as SidebarItem;
    mutate(
      sidebarItems?.map(item => (item._id === flashcardId ? updatedSidebarItem : item)),
      false
    );
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updatedTitle = e.target.value;
    if (updatedTitle.length > 15) return;
    setTitle((e.target as HTMLInputElement).value);
  };

  const handleTitleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      saveTitle();
    }
  };

  const handleTitleBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    saveTitle();
  };

  useEffect(() => {
    if (flashcardSet) {
      setTitle(flashcardSet.title);
    }
  }, [flashcardSet]);

  return (
    <div className='grid grid-rows-[auto_1fr] h-screen bg-slate-200'>
      <div className='sticky top-0 z-10 flex flex-row p-2 border-b bg-background gap-1'>
        <SidebarTrigger />
        <DocumentTitle documentId={flashcardId} documentTitle={title} documentType='flashcard' />
      </div>
      {flashcardSet && (
        <div className='flex flex-col my-auto w-full items-center gap-4'>
          <FlashcardCarousel flashcards={flashcardSet.flashcards} />
        </div>
      )}
    </div>
  );
};

export default FlashcardSet;
