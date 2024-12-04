import { QuizData } from './GenerateQuiz';

export async function fetchQuizData(quizId: string, courseId: string): Promise<QuizData> {
  const response = await fetch(`/api/courses/${courseId}/quizzes/${quizId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch quiz data: ${response.statusText}`);
  }
  
  return response.json();
}
