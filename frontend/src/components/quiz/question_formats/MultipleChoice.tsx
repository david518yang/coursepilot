import React from 'react';

interface MultipleChoiceProps {
  question: string;
  answers: string[];
  selectedAnswer: string | null;
  onAnswerChange: (answer: string) => void;
  index: number;
}

const MultipleChoice: React.FC<MultipleChoiceProps> = ({
  question,
  answers,
  selectedAnswer,
  onAnswerChange,
  index,
}) => {
  return (
    <div>
      <div>
        {answers.map((answer, answerIndex) => (
          <div key={answerIndex} className='flex items-center'>
            <input
              type='radio'
              id={`q${index}-a${answerIndex}`}
              name={`question-${index}`}
              value={answer}
              checked={selectedAnswer === answer}
              onChange={() => onAnswerChange(answer)}
              className='mr-2'
            />
            <label htmlFor={`q${index}-a${answerIndex}`}>{answer}</label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MultipleChoice;
