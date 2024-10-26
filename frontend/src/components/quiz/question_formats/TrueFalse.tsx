import React from 'react';

interface TrueFalseProps {
  question: string;
  selectedAnswer: string | null;
  onTFChange: (answer: string) => void;
  index: number;
}

const TrueFalse: React.FC<TrueFalseProps> = ({ question, selectedAnswer, onTFChange, index }) => {
  return (
    <div>
      {['True', 'False'].map((answer, answerIndex) => (
        <div key={answerIndex} className='flex items-center'>
          <input
            type='radio'
            id={`q${index}-a${answerIndex}`}
            name={`question-${index}`}
            value={answer}
            onChange={() => onTFChange(answer)}
            className='mr-2'
          />
          <label htmlFor={`q${index}-a${answerIndex}`}>{answer}</label>
        </div>
      ))}
    </div>
  );
};

export default TrueFalse;
