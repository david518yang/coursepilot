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
    // Shuffle terms and descriptions when component mounts or when 'answers' prop changes
    setShuffledTerms(shuffleArray(answers.terms));
    setShuffledDescriptions(shuffleArray(answers.descriptions));

    // Give the DOM time to render and position elements
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
    // If the term is already selected, unselect it
    if (selectedTerm === term) {
      setSelectedTerm(null);
    } else {
      setSelectedTerm(term);
    }
  };

  const handleDescriptionClick = (description: string) => {
    if (selectedTerm) {
      setConnections(prevConnections => {
        // Remove any existing connections for the selected term or the clicked description
        const updatedConnections = { ...prevConnections };
        // Remove any existing connections that involve the selected term or description
        for (const [termKey, descValue] of Object.entries(updatedConnections)) {
          if (termKey === selectedTerm || descValue === description) {
            delete updatedConnections[termKey];
          }
        }
        // Set the new connection
        updatedConnections[selectedTerm] = description;
        // Call the onMatchingChange prop to notify the parent component
        onMatchingChange(updatedConnections);
        return updatedConnections;
      });
      // Clear the selected term
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
          <div className='relative w-[50%]'>
            <div className='mb-6'>
              <button
                onClick={handleClearAnswers}
                className='absolute -right-32 top-0 bg-gray-100 hover:bg-gray-300 text-gray-700 px-3 py-1.5 rounded text-sm'
              >
                Clear Answers
              </button>
            </div>
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
                      <div className='flex items-center'>
                        <div className='flex-1 text-right pr-2.5'>
                          <span className='bg-gray-200 px-3 py-1 rounded'>{term}</span>
                        </div>
                        <div
                          className={`w-3.5 h-3.5 bg-blue-500 rounded-full cursor-pointer ${
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
        )}
      </div>
    </ArcherContainer>
  );
};

export default Matching;
