import { useState } from 'react';
import { QuizQuestion } from './GenerateQuiz';
import MultipleChoice from './question_formats/MultipleChoice';
import SelectAll from './question_formats/SelectAll';
import TrueFalse from './question_formats/TrueFalse';
import ShortAnswer from './question_formats/ShortAnswer';
import FillBlank from './question_formats/FillBlank';
import Matching from './question_formats/Matching';

interface QuizQuestionsProps {
  questions: QuizQuestion[];
}

const QuizQuestions: React.FC<QuizQuestionsProps> = ({ questions }) => {
  const [userAnswers, setUserAnswers] = useState<Record<number, string | string[] | Record<string, string>>>({});

  const handleAnswerChange = (questionIndex: number, answer: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionIndex]: answer,
    }));
  };

  const handleMultiAnswerChange = (questionIndex: number, answer: string, isChecked: boolean) => {
    setUserAnswers(prev => {
      const currentAnswers = (prev[questionIndex] as string[]) || [];
      if (isChecked) {
        return { ...prev, [questionIndex]: [...currentAnswers, answer] };
      } else {
        return { ...prev, [questionIndex]: currentAnswers.filter(a => a !== answer) };
      }
    });
  };

  const handleFillInBlankChange = (questionIndex: number, answer: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionIndex]: answer,
    }));
  };

  const handleMatchingChange = (questionIndex: number, question: string, answer: string) => {
    setUserAnswers(prev => {
      const currentAnswers = (prev[questionIndex] as Record<string, string>) || {};
      return { ...prev, [questionIndex]: { ...currentAnswers, [question]: answer } };
    });
  };

  return (
    <div>
      <ul className='list-decimal pl-6'>
        {questions.map((item: QuizQuestion, index: number) => (
          <li key={index} className='mb-4'>
            <p className='font-semibold'>{item.question}</p>
            <div className='mt-1'>
              {item.format === 'multiple choice' && (
                <MultipleChoice
                  question={item.question}
                  answers={item.answers}
                  selectedAnswer={userAnswers[index] as string | null}
                  onAnswerChange={answer => handleAnswerChange(index, answer)}
                  index={index}
                />
              )}
              {item.format === 'select all' && (
                <SelectAll
                  question={item.question}
                  answers={item.answers}
                  selectedAnswers={userAnswers[index] as string[]}
                  onMultiAnswerChange={(answer: string, isChecked: boolean) =>
                    handleMultiAnswerChange(index, answer, isChecked)
                  }
                  index={index}
                />
              )}
              {item.format === 'true false' && (
                <TrueFalse
                  question={item.question}
                  selectedAnswer={userAnswers[index] as string | null}
                  onTFChange={(answer: string) => handleAnswerChange(index, answer)}
                  index={index}
                />
              )}
              {item.format === 'short answer' && (
                <ShortAnswer
                  question={item.question}
                  selectedAnswer={userAnswers[index] as string | null}
                  onAnswerChange={(answer: string) => handleAnswerChange(index, answer)}
                  index={index}
                />
              )}
              {item.format === 'fill in the blank' && (
                <FillBlank
                  question={item.question}
                  selectedAnswer={userAnswers[index] as string | null}
                  onAnswerChange={(answer: string) => handleFillInBlankChange(index, answer)}
                  index={index}
                />
              )}
              {item.format === 'matching' && (
                <Matching
                  question={item.question}
                  answers={item.answers}
                  selectedAnswer={userAnswers[index] as Record<string, string> | null}
                  onMatchingChange={(question: string, answer: string) => handleMatchingChange(index, question, answer)}
                  index={index}
                />
              )}
            </div>
          </li>
        ))}
      </ul>
      <button type='submit' className='bg-blue-500 text-white px-4 py-2 rounded mt-4'>
        Submit Quiz
      </button>
    </div>
  );
};

export default QuizQuestions;
