import { useState } from 'react';

interface QuizQuestion {
  question: string;
  answer: string;
}

const useGenerateQuiz = () => {
  const [quizData, setQuizData] = useState<QuizQuestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateQuiz = async (topic: string, numQuestions: number = 1) => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/quiz/generation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic, numQuestions }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate quiz');
      }

      const data = await response.json();
      setQuizData(data);
    } catch (err) {
      console.error('Error generating quiz:', err);
      setError('Failed to generate quiz. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    quizData,
    isGenerating,
    error,
    generateQuiz,
  };
};

export default useGenerateQuiz;

