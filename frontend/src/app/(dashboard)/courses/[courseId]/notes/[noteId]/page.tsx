'use client';

import Editor from '@/components/editor/Editor';
import { useCoursesContext } from '@/lib/hooks/useCourseContext';

export default function Page({ params }: { params: { courseId: string; noteId: string } }) {
  const { setSelectedCourse } = useCoursesContext();

  setSelectedCourse(params.courseId);

  return <Editor noteId={params.noteId} />;
}
