import React from 'react';

interface SelectAllProps {
  answers: string[];
  selectedAnswers: string[];
  onMultiAnswerChange: (answer: string, isChecked: boolean) => void;
  index: number;
}

const SelectAll: React.FC<SelectAllProps> = ({ answers, selectedAnswers, onMultiAnswerChange, index }) => {
  console.log('SelectAll Component Render:', {
    answers,
    selectedAnswers,
    index,
  });

  if (!answers || answers.length === 0) {
    return <div>No answers available</div>;
  }

  return (
    <div className='space-y-2'>
      {answers.map((answer: string, answerIndex: number) => {
        console.log('Rendering answer:', answer);
        return (
          <div key={`${index}-${answerIndex}`} className='flex items-center space-x-2 p-1'>
            <input
              type='checkbox'
              id={`question-${index}-answer-${answerIndex}`}
              checked={selectedAnswers.includes(answer)}
              onChange={e => onMultiAnswerChange(answer, e.target.checked)}
              className='h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500'
            />
            <label
              htmlFor={`question-${index}-answer-${answerIndex}`}
              className='ml-2 text-sm font-medium text-gray-700'
            >
              {answer}
            </label>
          </div>
        );
      })}
    </div>
  );
};

export default SelectAll;
