'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { QuizData } from '@/components/quiz/GenerateQuiz';

interface QuizItem {
  _id: string;
  title: string;
  subject: string;
  topic: string;
  createdAt: string;
  updatedAt: string;
}

export default function CourseQuizzesPage() {
  const params = useParams();
  const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await fetch(`/api/courses/${params.courseId}/quizzes`);
        if (!response.ok) {
          throw new Error('Failed to fetch quizzes');
        }
        const data = await response.json();
        setQuizzes(data);
      } catch (err) {
        console.error('Error fetching quizzes:', err);
        setError(err instanceof Error ? err.message : 'Failed to load quizzes');
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuizzes();
  }, [params.courseId]);

  if (isLoading) {
    return <div>Loading quizzes...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className='max-w-6xl mx-auto py-8 px-4'>
      <div className='flex justify-between items-center mb-8'>
        <h1 className='text-2xl font-bold'>Course Quizzes</h1>
        <Link
          href={`/courses/${params.courseId}/quizzes/generate`}
          className='bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg'
        >
          Generate New Quiz
        </Link>
      </div>

      {quizzes.length === 0 ? (
        <div className='text-center py-12'>
          <p className='text-gray-600 mb-4'>No quizzes found for this course.</p>
          <Link
            href={`/courses/${params.courseId}/quizzes/generate`}
            className='text-blue-500 hover:text-blue-600'
          >
            Generate your first quiz
          </Link>
        </div>
      ) : (
        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {quizzes.map(quiz => (
            <Link
              key={quiz._id}
              href={`/courses/${params.courseId}/quizzes/${quiz._id}`}
              className='block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow'
            >
              <h3 className='font-semibold text-lg mb-2'>{quiz.title}</h3>
              <div className='text-sm text-gray-600'>
                <p>Subject: {quiz.subject}</p>
                <p>Topic: {quiz.topic}</p>
                <p className='mt-2'>
                  Created: {new Date(quiz.createdAt).toLocaleDateString()}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
