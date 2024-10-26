import React from 'react';

interface MatchingProps {
  question: string;
  answers: string[];
  selectedAnswer: Record<string, string> | null;
  onMatchingChange: (question: string, answer: string) => void;
  index: number;
}

const Matching: React.FC<MatchingProps> = ({ question, answers, selectedAnswer, onMatchingChange, index }) => {
  return (
    <div className='flex flex-col space-y-4'>
      {answers.map((answer: string, answerIndex: number) => (
        <div key={answerIndex} className='flex items-center space-x-4'>
          <div className='flex-1'>
            <input
              type='text'
              id={`q${index}-match${answerIndex}`}
              name={`question-${index}-match${answerIndex}`}
              onChange={e => onMatchingChange(e.target.value, '')}
              className='w-full p-2 border rounded'
              placeholder={`Enter match ${answerIndex + 1}`}
            />
          </div>
          <div className='flex-1'>
            <select
              id={`q${index}-answer${answerIndex}`}
              name={`question-${index}-answer${answerIndex}`}
              onChange={e => onMatchingChange('', e.target.value)}
              className='w-full p-2 border rounded'
            >
              <option value=''>Select an answer</option>
              {answers.map((_, optionIndex) => (
                <option key={optionIndex} value={String.fromCharCode(65 + optionIndex)}>
                  {String.fromCharCode(65 + optionIndex)}
                </option>
              ))}
            </select>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Matching;
