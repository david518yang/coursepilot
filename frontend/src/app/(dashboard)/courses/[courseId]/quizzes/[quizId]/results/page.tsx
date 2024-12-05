'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { QuizData } from '@/components/quiz/GenerateQuiz';
import { SidebarTrigger } from '@/components/ui/sidebar';

interface QuizResults {
  quizData: QuizData;
  userAnswers: Record<number, any>;
}

export default function QuizResultsPage() {
  const params = useParams();
  const [results, setResults] = useState<QuizResults | null>(null);

  useEffect(() => {
    // Load quiz data from localStorage
    const storedQuizData = localStorage.getItem('quizData');

    if (!storedQuizData) {
      window.location.href = `/courses/${params.courseId}/quizzes`;
      return;
    }

    try {
      const quizData = JSON.parse(storedQuizData);
      setResults({ quizData, userAnswers: {} }); // userAnswers are now part of quizData
    } catch (error) {
      console.error('Error parsing stored quiz data:', error);
      window.location.href = `/courses/${params.courseId}/quizzes`;
    }
  }, [params.courseId, params.quizId]);

  if (!results?.quizData?.questions) {
    return <div className='flex w-full h-full justify-center items-center'>Loading results...</div>;
  }

  const { quizData } = results;

  // Calculate score
  const totalQuestions = quizData.questions.length;
  const correctAnswers = quizData.questions.reduce((count, question) => {
    const isCorrect = compareAnswers(
      question.userAnswer,
      question.correctAnswers || question.correctAnswer,
      question.format
    );
    return count + (isCorrect ? 1 : 0);
  }, 0);
  const percentage = Math.round((correctAnswers / totalQuestions) * 100);

  return (
    <div>
      <div className='sticky top-0 h-11 p-2 border-b bg-sidebar'>
        <SidebarTrigger />
      </div>
      <div className='max-w-4xl mx-auto py-8 px-4'>
        <div className='bg-white rounded-lg shadow-lg p-6 mb-8'>
          <h1 className='text-2xl font-bold text-gray-800 mb-4'>Quiz Results</h1>
          <div className='flex items-center justify-between mb-6'>
            <div>
              <p className='text-lg'>
                Score:{' '}
                <span className='font-semibold'>
                  {correctAnswers}/{totalQuestions}
                </span>
              </p>
              <p className='text-lg'>
                Percentage: <span className='font-semibold'>{percentage}%</span>
              </p>
            </div>
            <div className={`text-2xl font-bold ${percentage >= 70 ? 'text-green-500' : 'text-red-500'}`}>
              {percentage >= 70 ? 'PASSED' : 'FAILED'}
            </div>
          </div>
        </div>

        <div className='space-y-8'>
          {quizData.questions.map((question, index) => {
            const isCorrect = compareAnswers(
              question.userAnswer,
              question.correctAnswers || question.correctAnswer,
              question.format
            );

            return (
              <div
                key={index}
                className={`p-6 rounded-lg border ${
                  isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
                }`}
              >
                <p className='font-semibold mb-2'>
                  {index + 1}. {question.question}
                </p>
                <div className='space-y-2'>
                  <p>
                    <span className='font-medium'>Your Answer: </span>
                    {formatAnswer(question.userAnswer, question.format)}
                  </p>
                  <p>
                    <span className='font-medium'>Correct Answer: </span>
                    {formatAnswer(question.correctAnswers || question.correctAnswer, question.format)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function compareAnswers(userAnswer: any, correctAnswer: any, format: string): boolean {
  if (!userAnswer) return false;

  switch (format) {
    case 'multiple choice':
    case 'true false':
    case 'short answer':
    case 'fill in the blank':
      return userAnswer.toLowerCase() === correctAnswer.toLowerCase();
    case 'select all':
      if (!Array.isArray(userAnswer) || !Array.isArray(correctAnswer)) return false;
      return userAnswer.length === correctAnswer.length && userAnswer.every(answer => correctAnswer.includes(answer));
    case 'matching':
      return Object.entries(correctAnswer).every(
        ([term, desc]) => userAnswer[term]?.toLowerCase() === desc.toLowerCase()
      );
    default:
      return false;
  }
}

function formatAnswer(answer: any, format: string): string {
  if (!answer) return 'No answer provided';

  switch (format) {
    case 'multiple choice':
    case 'true false':
    case 'short answer':
    case 'fill in the blank':
      return answer.toString();
    case 'select all':
      return Array.isArray(answer) ? answer.join(', ') : answer.toString();
    case 'matching':
      return Object.entries(answer)
        .map(([term, desc]) => `${term} → ${desc}`)
        .join(', ');
    default:
      return 'Unknown format';
  }
}
