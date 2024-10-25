'use client';

import React, { useState } from 'react';
import useGenerateQuiz from './GenerateQuiz';

const Quiz: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [numQuestions, setNumQuestions] = useState(1);
  const { quizData, isGenerating, error, generateQuiz } = useGenerateQuiz();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    generateQuiz(topic, numQuestions);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Quiz Generator</h1>
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="mb-4">
          <label htmlFor="topic" className="block mb-2">Topic:</label>
          <input
            type="text"
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="numQuestions" className="block mb-2">Number of Questions:</label>
          <input
            type="number"
            id="numQuestions"
            value={numQuestions}
            onChange={(e) => setNumQuestions(parseInt(e.target.value))}
            min="1"
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded" disabled={isGenerating}>
          {isGenerating ? 'Generating...' : 'Generate Quiz'}
        </button>
      </form>

      {error && <p className="text-red-500">{error}</p>}

      {quizData.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-2">Generated Quiz:</h2>
          <ul className="list-decimal pl-6">
            {quizData.map((item, index) => (
              <li key={index} className="mb-4">
                <p className="font-semibold">{item.question}</p>
                <p className="mt-1">Answer: {item.answer}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Quiz;
