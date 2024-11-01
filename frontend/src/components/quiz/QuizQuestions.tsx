import { useState } from 'react';
import { QuizQuestion } from './GenerateQuiz';
import MultipleChoice from './question_formats/MultipleChoice';
import SelectAll from './question_formats/SelectAll';
import TrueFalse from './question_formats/TrueFalse';
import ShortAnswer from './question_formats/ShortAnswer';
import FillBlank from './question_formats/FillBlank';
import Matching from './question_formats/Matching';

interface QuizQuestionsProps {
  questions: QuizQuestion<any, any>[];
}

type AnswerType = string | string[] | { terms: string[]; descriptions: string[] };
type CorrectAnswerType = string | string[] | { [term: string]: string };

const QuizQuestions = <AnswerType, CorrectAnswerType>({
  questions,
}: {
  questions: QuizQuestion<AnswerType, CorrectAnswerType>[];
}) => {
  const [userAnswers, setUserAnswers] = useState<Record<number, AnswerType>>({});

  const handleMultipleChoiceChange = (questionIndex: number, answer: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionIndex]: answer as AnswerType,
    }));
  };

  const handleSelectAllChange = (questionIndex: number, answer: string, isChecked: boolean) => {
    setUserAnswers(prev => {
      const currentAnswers = Array.isArray(prev[questionIndex]) ? (prev[questionIndex] as string[]) : [];
      const newAnswers = isChecked ? [...currentAnswers, answer] : currentAnswers.filter(a => a !== answer);
      return {
        ...prev,
        [questionIndex]: newAnswers as AnswerType,
      };
    });
  };

  const handleStringChange = (questionIndex: number, answer: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionIndex]: answer as AnswerType,
    }));
  };

  const handleMatchingChange = (questionIndex: number, answer: Record<string, string>) => {
    setUserAnswers(prev => {
      const currentAnswers = (prev[questionIndex] as Record<string, string>) || {};
      const newAnswer = { ...currentAnswers, ...answer } as AnswerType;
      return { ...prev, [questionIndex]: newAnswer };
    });
  };

  return (
    <div>
      <ul className='list-decimal pl-6'>
        {questions.map((item: QuizQuestion<AnswerType, CorrectAnswerType>, index: number) => {
          return (
            <li key={index} className='mb-4'>
              {item.format !== 'fill in the blank' && <p className='font-semibold'>{item.question}</p>}
              <div className='mt-1'>
                {item.format === 'multiple choice' && (
                  <MultipleChoice
                    answers={item.answers as string[]}
                    selectedAnswer={userAnswers[index] as string | null}
                    onAnswerChange={answer => handleMultipleChoiceChange(index, answer)}
                    index={index}
                  />
                )}
                {item.format === 'select all' && (
                  <SelectAll
                    answers={item.answers as string[]}
                    selectedAnswers={(userAnswers[index] as string[]) || []}
                    onMultiAnswerChange={(answer: string, isChecked: boolean) =>
                      handleSelectAllChange(index, answer, isChecked)
                    }
                    index={index}
                  />
                )}
                {item.format === 'true false' && (
                  <TrueFalse
                    selectedAnswer={userAnswers[index] as string | null}
                    onTFChange={(answer: string) => handleStringChange(index, answer)}
                    index={index}
                  />
                )}
                {item.format === 'short answer' && (
                  <ShortAnswer
                    selectedAnswer={userAnswers[index] as string | null}
                    onAnswerChange={(answer: string) => handleStringChange(index, answer)}
                    index={index}
                  />
                )}
                {item.format === 'fill in the blank' && (
                  <FillBlank
                    question={item.question}
                    selectedAnswer={userAnswers[index] as string | null}
                    onAnswerChange={(answer: string) => handleStringChange(index, answer)}
                    index={index}
                  />
                )}
                {item.format === 'matching' && (
                  <Matching
                    answers={item.answers as { terms: string[]; descriptions: string[] }}
                    selectedAnswers={userAnswers[index] as Record<string, string> | null}
                    onMatchingChange={(answers: Record<string, string>) => handleMatchingChange(index, answers)}
                    index={index}
                  />
                )}
              </div>
            </li>
          );
        })}
      </ul>
      <button
        type='submit'
        className='bg-blue-500 text-white px-4 py-2 rounded mt-4'
        onClick={e => {
          e.preventDefault();
          console.log('User Answers:', userAnswers);
        }}
      >
        Submit Quiz
      </button>
    </div>
  );
};

export default QuizQuestions;
