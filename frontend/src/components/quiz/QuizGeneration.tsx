'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGenerateQuiz } from './GenerateQuiz';
import FormatSelector from './FormatSelector';

interface QuizGenerationProps {
  courseId: string;
}

const QuizGeneration: React.FC<QuizGenerationProps> = ({ courseId }) => {
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState('');
  const [numQuestions, setNumQuestions] = useState(1);
  const [formats, setFormats] = useState<string[]>([]);
  const [localError, setLocalError] = useState<string | null>(null);
  const { isGenerating, error, generateQuiz } = useGenerateQuiz();
  const router = useRouter();

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (subject === '') {
      setLocalError('Subject is required');
      return;
    } else if (topic === '') {
      setLocalError('Topic is required');
      return;
    } else if (numQuestions < 1) {
      setLocalError('Number of questions must be greater than 0');
      return;
    } else if (formats.length === 0) {
      setLocalError('Please select at least one question format');
      return;
    }

    try {
      const quiz = await generateQuiz(courseId, subject, topic, numQuestions, formats);
      if (quiz?._id) {
        router.push(`/courses/${courseId}/quizzes/${quiz._id}/questions`);
      }
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Failed to generate quiz');
    }
  };

  return (
    <div className='container mx-auto p-4'>
      <h1 className='text-2xl font-bold mb-4'>Quiz Generator</h1>
      <form onSubmit={handleGenerate} className='mb-4'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
          <div>
            <label htmlFor='subject' className='block text-sm font-medium text-gray-700 mb-2'>
              Subject
            </label>
            <input
              type='text'
              id='subject'
              placeholder='Enter the subject (e.g., Mathematics)'
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className='w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500'
              required
            />
          </div>
          <div>
            <label htmlFor='topic' className='block text-sm font-medium text-gray-700 mb-2'>
              Topic
            </label>
            <input
              type='text'
              id='topic'
              placeholder='Enter the specific topic (e.g., Calculus)'
              value={topic}
              onChange={e => setTopic(e.target.value)}
              className='w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500'
              required
            />
          </div>
        </div>
        <div className='mb-4'>
          <label htmlFor='numQuestions' className='block text-sm font-medium text-gray-700 mb-2'>
            Number of Questions
          </label>
          <input
            type='number'
            id='numQuestions'
            value={numQuestions}
            onChange={e => setNumQuestions(parseInt(e.target.value))}
            min='1'
            className='w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500'
            required
          />
        </div>
        <FormatSelector formats={formats} setFormats={setFormats} />
        <button
          type='submit'
          className='bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50'
          disabled={isGenerating}
        >
          {isGenerating ? 'Generating...' : 'Generate Quiz'}
        </button>
      </form>

      {(localError || error) && <p className='text-red-500 mt-4'>{localError || error}</p>}
    </div>
  );
};

export default QuizGeneration;
