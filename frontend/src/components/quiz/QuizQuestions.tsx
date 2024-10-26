import { useState } from 'react';
import { QuizQuestion } from './GenerateQuiz';
import MultipleChoice from './question_formats/MultipleChoice';
import SelectAll from './question_formats/SelectAll';

interface QuizQuestionsProps {
  questions: QuizQuestion[];
}

const QuizQuestions: React.FC<QuizQuestionsProps> = ({ questions }) => {
  const [userAnswers, setUserAnswers] = useState<Record<number, string | string[] | Record<string, string>>>({});

  const handleAnswerChange = (questionIndex: number, answer: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionIndex]: answer,
    }));
  };

  const handleMultiAnswerChange = (questionIndex: number, answer: string, isChecked: boolean) => {
    setUserAnswers(prev => {
      const currentAnswers = (prev[questionIndex] as string[]) || [];
      if (isChecked) {
        return { ...prev, [questionIndex]: [...currentAnswers, answer] };
      } else {
        return { ...prev, [questionIndex]: currentAnswers.filter(a => a !== answer) };
      }
    });
  };

  const handleFillInBlankChange = (questionIndex: number, answer: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionIndex]: answer,
    }));
  };

  const handleMatchingChange = (questionIndex: number, question: string, answer: string) => {
    setUserAnswers(prev => {
      const currentAnswers = (prev[questionIndex] as Record<string, string>) || {};
      return { ...prev, [questionIndex]: { ...currentAnswers, [question]: answer } };
    });
  };

  return (
    <div>
      <ul className='list-decimal pl-6'>
        {questions.map((item: QuizQuestion, index: number) => (
          <li key={index} className='mb-4'>
            <p className='font-semibold'>{item.question}</p>
            <div className='mt-1'>
              {item.format === 'multiple choice' && (
                <MultipleChoice
                  question={item.question}
                  answers={item.answers}
                  selectedAnswer={userAnswers[index] as string | null}
                  onAnswerChange={answer => handleAnswerChange(index, answer)}
                  index={index}
                />
              )}
              {item.format === 'select all' && (
                <SelectAll
                  question={item.question}
                  answers={item.answers}
                  selectedAnswers={userAnswers[index] as string[]}
                  onMultiAnswerChange={(answer: string, isChecked: boolean) =>
                    handleMultiAnswerChange(index, answer, isChecked)
                  }
                  index={index}
                />
              )}
              {item.format === 'true false' && (
                <div>
                  {['True', 'False'].map((answer, answerIndex) => (
                    <div key={answerIndex} className='flex items-center'>
                      <input
                        type='radio'
                        id={`q${index}-a${answerIndex}`}
                        name={`question-${index}`}
                        value={answer}
                        onChange={e => handleAnswerChange(index, e.target.value)}
                        className='mr-2'
                      />
                      <label htmlFor={`q${index}-a${answerIndex}`}>{answer}</label>
                    </div>
                  ))}
                </div>
              )}
              {item.format === 'short answer' && (
                <div>
                  <input
                    type='text'
                    id={`q${index}-answer`}
                    name={`question-${index}`}
                    onChange={e => handleAnswerChange(index, e.target.value)}
                    className='w-full p-2 border rounded'
                    placeholder='Enter your answer'
                  />
                </div>
              )}
              {item.format === 'fill in the blank' && (
                <div>
                  <input
                    type='text'
                    id={`q${index}-answer`}
                    name={`question-${index}`}
                    onChange={e => handleFillInBlankChange(index, e.target.value)}
                    className='w-full p-2 border rounded'
                    placeholder='Fill in the blank'
                  />
                </div>
              )}
              {item.format === 'matching' && (
                <div>
                  <div className='flex flex-col space-y-4'>
                    {item.answers.map((answer: string, answerIndex: number) => (
                      <div key={answerIndex} className='flex items-center space-x-4'>
                        <div className='flex-1'>
                          <input
                            type='text'
                            id={`q${index}-match${answerIndex}`}
                            name={`question-${index}-match${answerIndex}`}
                            onChange={e => handleMatchingChange(index, e.target.value, '')}
                            className='w-full p-2 border rounded'
                            placeholder={`Enter match ${answerIndex + 1}`}
                          />
                        </div>
                        <div className='flex-1'>
                          <select
                            id={`q${index}-answer${answerIndex}`}
                            name={`question-${index}-answer${answerIndex}`}
                            onChange={e => handleMatchingChange(index, '', e.target.value)}
                            className='w-full p-2 border rounded'
                          >
                            <option value=''>Select an answer</option>
                            {item.answers.map((_, optionIndex) => (
                              <option key={optionIndex} value={String.fromCharCode(65 + optionIndex)}>
                                {String.fromCharCode(65 + optionIndex)}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
      <button type='submit' className='bg-blue-500 text-white px-4 py-2 rounded mt-4'>
        Submit Quiz
      </button>
    </div>
  );
};

export default QuizQuestions;
