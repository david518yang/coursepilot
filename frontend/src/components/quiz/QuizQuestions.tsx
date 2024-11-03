'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { QuizQuestion } from './GenerateQuiz';
import MultipleChoice from './question_formats/MultipleChoice';
import SelectAll from './question_formats/SelectAll';
import TrueFalse from './question_formats/TrueFalse';
import ShortAnswer from './question_formats/ShortAnswer';
import FillBlank from './question_formats/FillBlank';
import Matching from './question_formats/Matching';

type AnswerType = string | string[] | { terms: string[]; descriptions: string[] };
type CorrectAnswerType = string | string[] | { [term: string]: string };

const QuizQuestions = () => {
  const [questions, setQuestions] = useState<QuizQuestion<any, any>[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<number, any>>({});
  const router = useRouter();

  useEffect(() => {
    const storedQuizData = localStorage.getItem('quizData');
    if (!storedQuizData) {
      router.push('/quiz/generate');
      return;
    }
    setQuestions(JSON.parse(storedQuizData));
  }, []);

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
      const newAnswer = { ...currentAnswers, ...answer } as unknown as AnswerType;
      return { ...prev, [questionIndex]: newAnswer };
    });
  };

  return (
    <div className='max-w-4xl mx-auto py-8 px-4'>
      <ul className='space-y-12'>
        {questions.map((item, index) => {
          return (
            <li key={index} className='bg-white rounded-lg shadow-lg border border-gray-200 p-6'>
              {item.format !== 'fill in the blank' && (
                <p className='text-lg font-semibold mb-4 text-gray-800'>
                  {index + 1}. {item.question}
                </p>
              )}
              <div>
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
      <div className='flex justify-center mt-12'>
        <button
          type='submit'
          className='bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-medium shadow-md transition-colors'
          onClick={e => {
            e.preventDefault();
            console.log('User Answers:', userAnswers);
          }}
        >
          Submit Quiz
        </button>
      </div>
    </div>
  );
};

export default QuizQuestions;
