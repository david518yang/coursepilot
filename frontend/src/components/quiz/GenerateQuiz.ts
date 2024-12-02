import { useState } from 'react';

export interface QuizQuestion<A, C> {
  question: string;
  answers?: A;
  correct_answers?: C;
  format: 'multiple choice' | 'select all' | 'true false' | 'short answer' | 'fill in the blank' | 'matching';
}

export interface QuizData {
  _id: string;
  questions: QuizQuestion<any, any>[];
}

type MultipleChoice = QuizQuestion<string[], string>;
type SelectAll = QuizQuestion<string[], string[]>;
type TrueFalse = QuizQuestion<string[], string>;
type ShortAnswer = QuizQuestion<string, string>;
type FillInBlank = QuizQuestion<string, string>;
type Matching = QuizQuestion<{ [term: string]: string }, { [term: string]: string }>;

const useGenerateQuiz = () => {
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateQuiz = async (subject: string, topic: string, numQuestions: number, formats: string[]) => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/quiz/generation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subject, topic, numQuestions, formats }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Failed to generate quiz';

        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (!data._id || !Array.isArray(data.questions)) {
        throw new Error('Invalid response format from server');
      }

      // Store both quiz ID and questions
      localStorage.setItem('quizData', JSON.stringify(data));
      setQuizData(data);
    } catch (err) {
      console.error('Error generating quiz:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate quiz. Please try again.');
      setQuizData(null);
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
