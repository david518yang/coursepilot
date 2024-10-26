import React from 'react';

interface SelectAllProps {
  question: string;
  answers: string[];
  selectedAnswers: string[];
  onMultiAnswerChange: (answer: string, isChecked: boolean) => void;
  index: number;
}

const SelectAll: React.FC<SelectAllProps> = ({ question, answers, selectedAnswers, onMultiAnswerChange, index }) => {
  return (
    <div>
      {answers.map((answer: string, answerIndex: number) => (
        <div key={answerIndex} className='flex items-center'>
          <input
            type='checkbox'
            id={`q${index}-a${answerIndex}`}
            name={`question-${index}`}
            value={answer}
            onChange={e => onMultiAnswerChange(answer, e.target.checked)}
            className='mr-2'
          />
          <label htmlFor={`q${index}-a${answerIndex}`}>{answer}</label>
        </div>
      ))}
    </div>
  );
};

export default SelectAll;
