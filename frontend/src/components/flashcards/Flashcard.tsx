import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { IFlashcard } from '@/lib/models/Flashcard';
import ReactCardFlip from 'react-card-flip';

const Flashcard = ({ flashcard }: { flashcard: IFlashcard }) => {
  const [flipped, setFlipped] = useState(false);
  const handleFlip = () => {
    setFlipped(!flipped);
  };
  return (
    <ReactCardFlip isFlipped={flipped} flipDirection='vertical' containerClassName='sm:px-4'>
      <Card className='relative flex items-center justify-center h-56 cursor-pointer' onClick={handleFlip}>
        <CardContent>
          <div
            className={`absolute inset-0 flex items-center justify-center p-4 text-center transition-opacity duration-500 ${
              flipped ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}
          >
            {flashcard.front}
          </div>
        </CardContent>
      </Card>
      <Card className='relative flex items-center justify-center h-56 cursor-pointer' onClick={handleFlip}>
        <CardContent>
          <div
            className={`absolute inset-0 flex items-center justify-center p-4 text-center transition-opacity duration-500 ${
              flipped ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            {flashcard.back}
          </div>
        </CardContent>
      </Card>
    </ReactCardFlip>
  );
};
export default Flashcard;
