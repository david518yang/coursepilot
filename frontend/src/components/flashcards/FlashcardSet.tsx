import { useCoursesContext } from '@/lib/hooks/useCourseContext';
import { IFlashcardSetDocument } from '@/lib/models/Flashcard';
import useSWR from 'swr';
import { fetcher } from '@/lib/utils';
import FlashcardCarousel from './FlashcardCarousel';
import { SidebarTrigger } from '@/components/ui/sidebar';

const FlashcardSet = ({ flashcardId }: { flashcardId: string }) => {
  const { selectedCourse } = useCoursesContext();

  const { data: flashcardSet, isLoading } = useSWR<IFlashcardSetDocument>(
    selectedCourse && flashcardId && `/api/courses/${selectedCourse}/flashcards/${flashcardId}`,
    fetcher
  );

  if (isLoading) return null;

  return (
    <div className='grid grid-rows-[auto_1fr] h-screen bg-slate-200'>
      <div className='sticky top-0 z-10 flex flex-row justify-between p-2 border-b bg-background'>
        <SidebarTrigger />
      </div>
      {flashcardSet && (
        <div className='flex flex-col my-auto w-full items-center gap-4'>
          <h1>
            <b>{flashcardSet.title}</b>
          </h1>
          <FlashcardCarousel flashcards={flashcardSet.flashcards} />
        </div>
      )}
    </div>
  );
};

export default FlashcardSet;
