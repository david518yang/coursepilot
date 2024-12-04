import { useState } from 'react';
import { IQuizQuestion, IQuizClean } from '@/lib/models/Quiz';

export function useGenerateQuiz() {
  const [quizData, setQuizData] = useState<IQuizClean | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateQuiz = async (
    courseId: string,
    subject: string,
    topic: string,
    numQuestions: number,
    formats: string[]
  ) => {
    setIsGenerating(true);
    setError(null);
    try {
      const response = await fetch(`/api/courses/${courseId}/quizzes/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId,
          subject,
          topic,
          numQuestions,
          formats,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate quiz');
      }

      const data: IQuizClean = await response.json();
      setQuizData(data);
      return data;
    } catch (error) {
      console.error('Error generating quiz:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate quiz');
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  return { quizData, isGenerating, error, generateQuiz };
}
