'use client';

import FlashcardSet from '@/components/flashcards/FlashcardSet';
import { useCoursesContext } from '@/lib/hooks/useCourseContext';

export default function Page({ params }: { params: { courseId: string; flashcardId: string } }) {
  const { setSelectedCourse } = useCoursesContext();

  setSelectedCourse(params.courseId);

  return <FlashcardSet flashcardId={params.flashcardId} />;
}
