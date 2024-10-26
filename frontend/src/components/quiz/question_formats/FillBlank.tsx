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
      <input
        type='text'
        id={`q${index}-answer`}
        name={`question-${index}`}
        value={selectedAnswer || ''}
        onChange={e => onAnswerChange(e.target.value)}
        className='w-full p-2 border rounded'
        placeholder='Fill in the blank'
      />
    </div>
  );
};

export default FillBlank;
