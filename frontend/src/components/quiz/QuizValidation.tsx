'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { QuizQuestion } from './GenerateQuiz';

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

  useEffect(() => {
    const validateQuiz = async () => {
      try {
        const storedQuizData = localStorage.getItem('quizData');
        const storedUserAnswers = localStorage.getItem('userAnswers');

        if (!storedQuizData || !storedUserAnswers) {
          router.push('/quiz/generate');
          return;
        }

        const quizData = JSON.parse(storedQuizData);
        const userAnswers = JSON.parse(storedUserAnswers);

        const response = await fetch('/api/quiz/validation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userAnswers,
            quizData,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to validate quiz');
        }

        const validationResults = await response.json();
        console.log('validationResults: ', validationResults);
        setResults(validationResults);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    };

    validateQuiz();
  }, []);

  if (error) {
    return (
      <div className='container mx-auto p-4'>
        <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded'>
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className='container mx-auto p-4'>
        <p>Loading results...</p>
      </div>
    );
  }

  return (
    <div className='container mx-auto p-4'>
      <div className='bg-white rounded-lg shadow-lg p-6'>
        <h1 className='text-2xl font-bold mb-4'>Quiz Results</h1>
        <div className='mb-6'>
          <p className='text-lg'>Score: {results.score.toFixed(1)}%</p>
          <p className='text-lg'>
            Correct Answers: {results.correctAnswers} out of {results.totalQuestions}
          </p>
        </div>

        <div className='space-y-6'>
          {results.detailedResults.map(result => (
            <div
              key={result.questionNumber}
              className={`p-4 rounded-lg ${
                result.isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}
            >
              <div className='flex justify-between items-start'>
                <p className='font-semibold'>Question {result.questionNumber}</p>
                <span
                  className={`px-2 py-1 rounded text-sm ${
                    result.isCorrect ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                  }`}
                >
                  {result.isCorrect ? 'Correct' : 'Incorrect'}
                </span>
              </div>

              <p className='mt-2 text-gray-700'>{result.question}</p>

              {!result.isCorrect && (
                <div className='mt-4 bg-red-100 p-3 rounded'>
                  {result.format === 'matching' && (
                    <div className='grid grid-cols-2 gap-6'>
                      <div className='bg-white p-4 rounded-lg shadow-sm border border-gray-200'>
                        <h4 className='text-sm font-semibold text-gray-600 mb-3'>Your Matches</h4>
                        <div className='space-y-2'>
                          {Object.entries(result.userAnswer || {}).map(([term, desc]) => (
                            <div key={term} className='grid grid-cols-[120px_auto_1fr] gap-2 p-2 bg-gray-50 rounded'>
                              <div className='font-medium text-gray-700 text-right'>{term}</div>
                              <div className='text-gray-500 justify-self-center'>→</div>
                              <div className='text-gray-900'>{String(desc)}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className='bg-white p-4 rounded-lg shadow-sm border border-gray-200'>
                        <h4 className='text-sm font-semibold text-gray-600 mb-3 flex items-center'>
                          <svg className='w-4 h-4 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                          </svg>
                          Correct Matches
                        </h4>
                        <div className='space-y-2'>
                          {Object.entries(result.correctAnswer).map(([term, desc]) => (
                            <div key={term} className='grid grid-cols-[120px_auto_1fr] gap-2 p-2 bg-gray-50 rounded'>
                              <div className='font-medium text-gray-700 text-right'>{term}</div>
                              <div className='text-gray-500 justify-self-center'>→</div>
                              <div className='text-gray-900'>{String(desc)}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {result.format === 'select all' && (
                    <>
                      <div className='mt-2'>
                        <p className='text-sm text-gray-600'>Your selections:</p>
                        <ul className='list-disc list-inside font-medium'>
                          {(result.userAnswer || []).map((answer: string) => (
                            <li key={answer}>{answer}</li>
                          ))}
                        </ul>
                      </div>
                      <div className='mt-2'>
                        <p className='text-sm text-gray-600'>Correct selections:</p>
                        <ul className='list-disc list-inside font-medium'>
                          {result.correctAnswer.map((answer: string) => (
                            <li key={answer}>{answer}</li>
                          ))}
                        </ul>
                      </div>
                    </>
                  )}

                  {(result.format === 'multiple choice' ||
                    result.format === 'true false' ||
                    result.format === 'short answer' ||
                    result.format === 'fill in the blank') && (
                    <>
                      <div className='mt-2'>
                        <p className='text-sm text-gray-600'>Your answer:</p>
                        <p className='font-medium'>{result.userAnswer || 'No answer provided'}</p>
                      </div>
                      <div className='mt-2'>
                        <p className='text-sm text-gray-600'>Correct answer:</p>
                        <p className='font-medium'>{result.correctAnswer}</p>
                      </div>
                    </>
                  )}
                </div>
              )}

              {result.isCorrect && (
                <div className='mt-2'>
                  <p className='text-sm text-gray-600'>Your correct answer:</p>
                  {result.format === 'matching' ? (
                    <div className='space-y-2'>
                      {Object.entries(result.userAnswer).map(([term, desc]) => (
                        <div key={term} className='grid grid-cols-[120px_auto_1fr] gap-2 p-2 bg-gray-50 rounded'>
                          <div className='font-medium text-gray-700 text-right'>{term}</div>
                          <div className='text-gray-500 justify-self-center'>→</div>
                          <div className='text-gray-900'>{String(desc)}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className='font-medium'>
                      {typeof result.userAnswer === 'object'
                        ? JSON.stringify(result.userAnswer, null, 2)
                        : result.userAnswer}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className='mt-8 flex justify-center'>
          <button
            onClick={() => router.push('/editor')}
            className='bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg'
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizValidation;
