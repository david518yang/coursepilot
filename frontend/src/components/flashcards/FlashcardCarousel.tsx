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
import { Button } from '../ui/button';
import { Shuffle } from 'lucide-react';

const FlashcardCarousel = ({ flashcards }: { flashcards: IFlashcard[] }) => {
  const [api, setApi] = useState<CarouselApi>();
  const [index, setIndex] = useState(0);
  const [shuffledFlashcards, setShuffledFlashcards] = useState(flashcards);

  const shuffleFlashcards = () => {
    const shuffledFlashcards = [...flashcards].sort(() => Math.random() - 0.5);
    setShuffledFlashcards(shuffledFlashcards);
    if (api) {
      api.scrollTo(0);
    }
  };

  useEffect(() => {
    if (!api) return;

    setIndex(api.selectedScrollSnap());

    api.on('select', () => {
      setIndex(api.selectedScrollSnap());
    });
  }, [api]);

  return (
    <div className='w-3/4 flex flex-col items-center gap-4'>
      <Button variant='outline' className='bg-background' onClick={shuffleFlashcards}>
        <Shuffle className='pr-2' />
        Shuffle
      </Button>
      <Carousel setApi={setApi} className='w-full max-w-[512px]'>
        <CarouselContent>
          {shuffledFlashcards.map((flashcard, index) => (
            <CarouselItem key={index}>
              <Flashcard flashcard={flashcard} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
      <div>
        Flashcard {index + 1} of {shuffledFlashcards.length}
      </div>
    </div>
  );
};
export default FlashcardCarousel;
