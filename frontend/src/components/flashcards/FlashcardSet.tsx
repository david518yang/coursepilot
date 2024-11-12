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
    <div className='relative flex items-center justify-center h-full w-full gap-8'>
      <SidebarTrigger className='absolute top-2 left-2' />
      {flashcardSet && (
        <div className='flex flex-col w-full items-center gap-4'>
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
