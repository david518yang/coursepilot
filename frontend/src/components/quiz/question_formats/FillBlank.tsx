import React from 'react';

interface FillBlankProps {
  question: string;
  selectedAnswer: string | null;
  onAnswerChange: (answer: string) => void;
  index: number;
}

const FillBlank: React.FC<FillBlankProps> = ({ question, selectedAnswer, onAnswerChange, index }) => {
  return (
    <div>
      <p className='font-semibold'>
        {question.split('_').map((part, i, arr) => (
          <React.Fragment key={i}>
            {part}
            {i < arr.length - 1 && (
              <input
                type='text'
                value={selectedAnswer || ''}
                onChange={e => onAnswerChange(e.target.value)}
                className='w-32 px-1 mx-1 border rounded'
              />
            )}
          </React.Fragment>
        ))}
      </p>
    </div>
  );
};

export default FillBlank;
