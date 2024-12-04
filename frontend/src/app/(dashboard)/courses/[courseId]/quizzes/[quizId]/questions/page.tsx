'use client';

import { useState, useEffect } from 'react';
import { QuizQuestions } from '@/components/quiz/QuizQuestions';
import { useCoursesContext } from '@/lib/hooks/useCourseContext';
import { fetchQuizData } from '@/components/quiz/quizApi'; // You'll need to create this function

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
    return <div>Loading...</div>;
  }

  return (
    <div className='mx-auto max-w-5xl p-6'>
      <QuizQuestions quizData={quizData} courseId={params.courseId} />
    </div>
  );
}
