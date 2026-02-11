'use client';

import { useParams } from 'next/navigation';
import QuizGeneration from '@/components/quiz/QuizGeneration';
import { SidebarTrigger } from '@/components/ui/sidebar';

export default function GenerateQuizPage() {
  const params = useParams();
  const courseId = params.courseId as string;

  return (
    <div>
      <div className='sticky top-0 h-11 border-b p-2 bg-sidebar'>
        <SidebarTrigger />
      </div>
      <div className='max-w-5xl'>
        <QuizGeneration courseId={courseId} />
      </div>
    </div>
  );
}
