'use client';

import { useParams } from 'next/navigation';
import QuizGeneration from '@/components/quiz/QuizGeneration';

export default function GenerateQuizPage() {
  const params = useParams();
  const courseId = params.courseId as string;

  return (
    <div className='max-w-4xl mx-auto py-8 px-4'>
      <QuizGeneration courseId={courseId} />
    </div>
  );
}
