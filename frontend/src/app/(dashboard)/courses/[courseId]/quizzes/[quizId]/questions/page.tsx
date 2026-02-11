'use client';

import { useState, useEffect } from 'react';
import { QuizQuestions } from '@/components/quiz/QuizQuestions';
import { useCoursesContext } from '@/lib/hooks/useCourseContext';
import { fetchQuizData } from '@/components/quiz/quizApi'; // You'll need to create this function
import { SidebarTrigger } from '@/components/ui/sidebar';

export default function Page({ params }: { params: { courseId: string; quizId: string } }) {
  const { setSelectedCourse } = useCoursesContext();
  const [quizData, setQuizData] = useState(null);

  useEffect(() => {
    setSelectedCourse(params.courseId);

    async function loadQuizData() {
      try {
        const data = await fetchQuizData(params.quizId, params.courseId);
        setQuizData(data);
      } catch (error) {
        console.error('Failed to load quiz data', error);
      }
    }

    loadQuizData();
  }, [params.courseId, params.quizId]);

  if (!quizData) {
    return <div className='flex items-center justify-center w-full h-full'>Loading...</div>;
  }

  return (
    <div>
      <div className='sticky top-0 h-11 border-b p-2 bg-sidebar'>
        <SidebarTrigger />
      </div>
      <div className='max-w-5xl'></div>
      <QuizQuestions quizData={quizData} courseId={params.courseId} />
    </div>
  );
}
