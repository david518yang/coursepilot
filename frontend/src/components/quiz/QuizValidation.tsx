'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface ValidationResult {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  detailedResults: {
    questionNumber: number;
    question: string;
    format: string;
    userAnswer: any;
    correctAnswer: any;
    isCorrect: boolean;
  }[];
}

const QuizValidation = () => {
  const [results, setResults] = useState<ValidationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const loadResults = () => {
      try {
        const storedResults = localStorage.getItem('quizResults');
        if (!storedResults) {
          const quizId = searchParams.get('quizId');
          const courseId = searchParams.get('courseId');
          if (quizId && courseId) {
            router.push(`/courses/${courseId}/quizzes/${quizId}/questions`);
          } else {
            router.push('/courses');
          }
          return;
        }

        const parsedResults = JSON.parse(storedResults);
        setResults(parsedResults);
      } catch (error) {
        console.error('Failed to load quiz results:', error);
        setError('Failed to load quiz results. Please try again.');
      }
    };

    loadResults();
  }, [router, searchParams]);

  if (error) {
    return (
      <div className='flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4'>
        <div className='text-red-500 text-xl font-semibold mb-4'>{error}</div>
        <button
          onClick={() => router.back()}
          className='bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium'
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!results) {
    return (
      <div className='flex justify-center items-center min-h-screen bg-gray-50'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500'></div>
      </div>
    );
  }

  const percentage = Math.round((results.correctAnswers / results.totalQuestions) * 100);

  return (
    <div className='max-w-4xl mx-auto py-8 px-4'>
      <div className='bg-white rounded-lg shadow-lg p-6 mb-8'>
        <h1 className='text-2xl font-bold text-gray-800 mb-4'>Quiz Results</h1>
        <div className='flex items-center justify-between mb-6'>
          <div>
            <p className='text-lg'>
              Score:{' '}
              <span className='font-semibold'>
                {results.correctAnswers}/{results.totalQuestions}
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

      <div className='space-y-6'>
        {results.detailedResults.map((result, index) => (
          <div
            key={index}
            className={`bg-white rounded-lg shadow p-6 border-l-4 ${
              result.isCorrect ? 'border-green-500' : 'border-red-500'
            }`}
          >
            <div className='flex items-start justify-between'>
              <div className='flex-1'>
                <h3 className='text-lg font-semibold mb-2'>
                  Question {result.questionNumber}: {result.question}
                </h3>
                <div className='space-y-2'>
                  <p>
                    <span className='font-medium'>Your Answer:</span>{' '}
                    {Array.isArray(result.userAnswer)
                      ? result.userAnswer.join(', ')
                      : typeof result.userAnswer === 'object'
                        ? Object.entries(result.userAnswer)
                            .map(([key, value]) => `${key}: ${value}`)
                            .join(', ')
                        : result.userAnswer || 'No answer provided'}
                  </p>
                  <p>
                    <span className='font-medium'>Correct Answer:</span>{' '}
                    {Array.isArray(result.correctAnswer)
                      ? result.correctAnswer.join(', ')
                      : typeof result.correctAnswer === 'object'
                        ? Object.entries(result.correctAnswer)
                            .map(([key, value]) => `${key}: ${value}`)
                            .join(', ')
                        : result.correctAnswer}
                  </p>
                </div>
              </div>
              <div className={`ml-4 ${result.isCorrect ? 'text-green-500' : 'text-red-500'} font-semibold text-lg`}>
                {result.isCorrect ? '✓' : '✗'}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className='flex justify-center mt-8 space-x-4'>
        <button
          onClick={() => {
            const courseId = searchParams.get('courseId');
            if (courseId) {
              router.push(`/courses/${courseId}`);
            } else {
              router.push('/courses');
            }
          }}
          className='bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium'
        >
          Back to Course
        </button>
        <button
          onClick={() => {
            localStorage.removeItem('quizResults');
            const quizId = searchParams.get('quizId');
            const courseId = searchParams.get('courseId');
            if (quizId && courseId) {
              router.push(`/courses/${courseId}/quizzes/${quizId}/questions`);
            }
          }}
          className='bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium'
        >
          Retake Quiz
        </button>
      </div>
    </div>
  );
};

export default QuizValidation;
