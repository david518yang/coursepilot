'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useGenerateQuiz, { QuizQuestion } from './GenerateQuiz';
import QuizQuestions from './QuizQuestions';
import FormatSelector from './FormatSelector';

const QuizGeneration: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState('');
  const [numQuestions, setNumQuestions] = useState(1);
  const [formats, setFormats] = useState<string[]>([]);
  const [localError, setLocalError] = useState<string | null>(null);
  const { quizData, isGenerating, error, generateQuiz } = useGenerateQuiz();
  const router = useRouter();

  useEffect(() => {
    if (quizData.length > 0) {
      handleNavigation(quizData);
    }
  }, [quizData]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (subject == '') {
      setLocalError('Subject is required');
      return;
    } else if (topic == '') {
      setLocalError('Topic is required');
      return;
    } else if (numQuestions < 1) {
      setLocalError('Number of questions must be greater than 0');
      return;
    } else if (formats.length == 0) {
      setLocalError('Please select at least one question format');
      return;
    }
    await generateQuiz(subject, topic, numQuestions, formats);
  };

  const handleNavigation = (quizData: QuizQuestion<any, any>[]) => {
    localStorage.setItem('quizData', JSON.stringify(quizData));
    router.push('/quiz/questions');
  };

  return (
    <div className='container mx-auto p-4'>
      <h1 className='text-2xl font-bold mb-4'>Quiz Generator</h1>
      <form onSubmit={handleGenerate} className='mb-4'>
        <div className='mb-4'>
          <label htmlFor='subject' className='block mb-2'>
            Subject:
          </label>
          <input
            type='text'
            id='subject'
            value={subject}
            onChange={e => setSubject(e.target.value)}
            className='w-full p-2 border rounded'
            required
          />
          <label htmlFor='topic' className='block mb-2'>
            Topic:
          </label>
          <input
            type='text'
            id='topic'
            value={topic}
            onChange={e => setTopic(e.target.value)}
            className='w-full p-2 border rounded'
            required
          />
        </div>
        <div className='mb-4'>
          <label htmlFor='numQuestions' className='block mb-2'>
            Number of Questions:
          </label>
          <input
            type='number'
            id='numQuestions'
            value={numQuestions}
            onChange={e => setNumQuestions(parseInt(e.target.value))}
            min='1'
            className='w-full p-2 border rounded'
            required
          />
        </div>
        <FormatSelector formats={formats} setFormats={setFormats} />
        <button type='submit' className='bg-blue-500 text-white px-4 py-2 rounded' disabled={isGenerating}>
          {isGenerating ? 'Generating...' : 'Generate Quiz'}
        </button>
      </form>

      {error && <p className='text-red-500'>{error}</p>}
    </div>
  );
};

export default QuizGeneration;
