import { useEffect, useState } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';
import { IFlashcard } from '@/lib/models/Flashcard';
import Flashcard from './Flashcard';

const FlashcardCarousel = ({ flashcards }: { flashcards: IFlashcard[] }) => {
  const [api, setApi] = useState<CarouselApi>();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!api) return;

    setIndex(api.selectedScrollSnap());

    api.on('select', () => {
      setIndex(api.selectedScrollSnap());
    });
  }, [api]);

  return (
    <div className='w-3/4 flex flex-col items-center gap-4'>
      <Carousel setApi={setApi} className='w-full max-w-[512px]'>
        <CarouselContent>
          {flashcards.map((flashcard, index) => (
            <CarouselItem key={index}>
              <Flashcard flashcard={flashcard} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
      <div>
        Flashcard {index + 1} of {flashcards.length}
      </div>
    </div>
  );
};
export default FlashcardCarousel;
