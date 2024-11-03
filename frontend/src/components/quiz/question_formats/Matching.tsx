import React, { useState, useEffect, useRef } from 'react';
import { ArcherContainer, ArcherElement } from 'react-archer';

interface MatchingProps {
  answers: { terms: string[]; descriptions: string[] };
  selectedAnswers: Record<string, string> | null;
  onMatchingChange: (answers: Record<string, string>) => void;
  index: number;
}

const Matching: React.FC<MatchingProps> = ({ answers, selectedAnswers, onMatchingChange, index }) => {
  const [shuffledTerms, setShuffledTerms] = useState<string[]>([]);
  const [shuffledDescriptions, setShuffledDescriptions] = useState<string[]>([]);
  const [connections, setConnections] = useState<Record<string, string>>(selectedAnswers || {});
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setShuffledTerms(shuffleArray(answers.terms));
    setShuffledDescriptions(shuffleArray(answers.descriptions));

    setIsReady(false);
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, [answers]);

  function shuffleArray(array: string[]) {
    return array
      .map(value => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);
  }

  const handleTermClick = (term: string) => {
    if (selectedTerm === term) {
      setSelectedTerm(null);
    } else {
      setSelectedTerm(term);
    }
  };

  const handleDescriptionClick = (description: string) => {
    if (selectedTerm) {
      setConnections(prevConnections => {
        const updatedConnections = { ...prevConnections };
        for (const [termKey, descValue] of Object.entries(updatedConnections)) {
          if (termKey === selectedTerm || descValue === description) {
            delete updatedConnections[termKey];
          }
        }
        updatedConnections[selectedTerm] = description;
        onMatchingChange(updatedConnections);
        return updatedConnections;
      });
      setSelectedTerm(null);
    }
  };

  const handleClearAnswers = () => {
    setConnections({});
    setSelectedTerm(null);
    onMatchingChange({});
  };

  return (
    <ArcherContainer strokeColor='black' noCurves={false}>
      <div className='relative'>
        {isReady && (
          <div className='relative w-full flex justify-center'>
            <div className='w-[70%]'>
              <div className='flex flex-col gap-5 mt-5'>
                {shuffledTerms.map((term, index) => (
                  <div key={term} className='flex justify-between items-center'>
                    <div className='w-[200px] flex-none'>
                      <ArcherElement
                        id={`term-${term}`}
                        relations={
                          connections[term]
                            ? [
                                {
                                  targetId: `description-${connections[term]}`,
                                  targetAnchor: 'left',
                                  sourceAnchor: 'right',
                                },
                              ]
                            : []
                        }
                      >
                        <div className='flex items-center justify-end'>
                          <span className='bg-gray-200 px-3 py-1 rounded'>{term}</span>
                          <div
                            className={`w-3.5 h-3.5 bg-blue-500 rounded-full cursor-pointer ml-2.5 ${
                              selectedTerm === term ? 'bg-red-500' : ''
                            }`}
                            onClick={() => handleTermClick(term)}
                          />
                        </div>
                      </ArcherElement>
                    </div>
                    <div className='w-[100px]' />
                    <div className='flex-1'>
                      <ArcherElement id={`description-${shuffledDescriptions[index]}`}>
                        <div className='flex items-center'>
                          <div
                            className='w-3.5 h-3.5 bg-blue-500 rounded-full cursor-pointer mr-2.5'
                            onClick={() => handleDescriptionClick(shuffledDescriptions[index])}
                          />
                          <span className='bg-gray-200 px-3 py-1 rounded flex-1'>{shuffledDescriptions[index]}</span>
                        </div>
                      </ArcherElement>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={handleClearAnswers}
              className='absolute right-0 top-0 bg-gray-100 hover:bg-gray-300 text-gray-700 px-2 py-1.5 rounded text-sm'
            >
              Clear Answers
            </button>
          </div>
        )}
      </div>
    </ArcherContainer>
  );
};

export default Matching;
