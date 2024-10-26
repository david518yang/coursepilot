import React from 'react';

interface ShortAnswerProps {
  question: string;
  selectedAnswer: string | null;
  onAnswerChange: (answer: string) => void;
  index: number;
}

const ShortAnswer: React.FC<ShortAnswerProps> = ({ question, selectedAnswer, onAnswerChange, index }) => {
  return (
    <div>
      <input
        type='text'
        id={`q${index}-answer`}
        name={`question-${index}`}
        value={selectedAnswer || ''}
        onChange={e => onAnswerChange(e.target.value)}
        className='w-full p-2 border rounded'
        placeholder='Enter your answer'
      />
    </div>
  );
};

export default ShortAnswer;
