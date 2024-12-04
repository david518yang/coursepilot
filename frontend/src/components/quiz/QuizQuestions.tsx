'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { QuizQuestion, QuizData } from './GenerateQuiz';
import MultipleChoice from './question_formats/MultipleChoice';
import SelectAll from './question_formats/SelectAll';
import TrueFalse from './question_formats/TrueFalse';
import ShortAnswer from './question_formats/ShortAnswer';
import FillBlank from './question_formats/FillBlank';
import Matching from './question_formats/Matching';

type AnswerType = string | string[] | { terms: string[]; descriptions: string[] };
type CorrectAnswerType = string | string[] | { [term: string]: string };

interface QuizQuestionsProps {
  quizData: {
    _id: string;
    courseId: string;
    title: string;
    questions: {
      question: string;
      format: string;
      answers: any;
      correctAnswer: any;
    }[];
  };
  courseId: string;
}

export function QuizQuestions({ quizData, courseId }: QuizQuestionsProps) {
  const [userAnswers, setUserAnswers] = useState<Record<number, any>>({});
  const router = useRouter();

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

  const handleMatchingChange = (questionIndex: number, term: string, description: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionIndex]: {
        ...((prev[questionIndex] as Record<string, string>) || {}),
        [term]: description,
      },
    }));
  };

  return (
    <div className='max-w-4xl mx-auto py-8 px-4'>
      <ul className='space-y-12'>
        {quizData.questions.map((question, index) => {
          const userAnswer = userAnswers[index];

          return (
            <li key={index} className='bg-white rounded-lg shadow-lg border border-gray-200 p-6'>
              {question.format !== 'fill in the blank' && (
                <p className='text-lg font-semibold mb-4 text-gray-800'>
                  {index + 1}. {question.question}
                </p>
              )}
              <div>
                {question.format === 'multiple choice' && (
                  <MultipleChoice
                    answers={question.answers as string[]}
                    selectedAnswer={userAnswer as string | null}
                    onAnswerChange={answer => handleMultipleChoiceChange(index, answer)}
                    index={index}
                  />
                )}
                {question.format === 'select all' && (
                  <SelectAll
                    answers={question.answers as string[]}
                    selectedAnswers={(userAnswer as string[]) || []}
                    onMultiAnswerChange={(answer: string, isChecked: boolean) =>
                      handleSelectAllChange(index, answer, isChecked)
                    }
                    index={index}
                  />
                )}
                {question.format === 'true false' && (
                  <TrueFalse
                    selectedAnswer={userAnswer as string | null}
                    onTFChange={(answer: string) => handleStringChange(index, answer)}
                    index={index}
                  />
                )}
                {question.format === 'short answer' && (
                  <ShortAnswer
                    selectedAnswer={userAnswer as string | null}
                    onAnswerChange={(answer: string) => handleStringChange(index, answer)}
                    index={index}
                  />
                )}
                {question.format === 'fill in the blank' && (
                  <FillBlank
                    question={question.question}
                    selectedAnswer={userAnswer as string | null}
                    onAnswerChange={(answer: string) => handleStringChange(index, answer)}
                    index={index}
                  />
                )}
                {question.format === 'matching' && (
                  <Matching
                    answers={question.answers as { terms: string[]; descriptions: string[] }}
                    selectedAnswers={userAnswer as Record<string, string> | null}
                    onMatchingChange={(term: string, description: string) =>
                      handleMatchingChange(index, term, description)
                    }
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
          onClick={async e => {
            e.preventDefault();
            try {
              // Send answers to validation API
              const response = await fetch('/api/ai/quiz/validation', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  userAnswers,
                  quizData: quizData.questions,
                }),
              });

              if (!response.ok) {
                throw new Error('Failed to validate quiz');
              }

              const results = await response.json();

              // Store quiz data and user answers separately
              localStorage.setItem('quizData', JSON.stringify({
                _id: quizData._id,
                courseId: courseId,
                questions: quizData.questions.map((q: any, index: number) => ({
                  question: q.question,
                  format: q.format,
                  correctAnswer: q.correctAnswer,
                  correctAnswers: q.correctAnswers,
                  answers: q.answers,
                  userAnswer: userAnswers[index]
                }))
              }));

              // Redirect to results page with correct URL format
              router.push(`/courses/${courseId}/quizzes/${quizData._id}/results`);
            } catch (error) {
              console.error('Failed to submit quiz:', error);
              alert('Failed to submit quiz. Please try again.');
            }
          }}
        >
          Submit Quiz
        </button>
      </div>
    </div>
  );
}
