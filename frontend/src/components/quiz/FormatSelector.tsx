import React from 'react';

interface FormatSelectorProps {
  formats: string[];
  setFormats: React.Dispatch<React.SetStateAction<string[]>>;
}

const FormatSelector: React.FC<FormatSelectorProps> = ({ formats, setFormats }) => {
  const allFormats = ['multiple choice', 'select all', 'true false', 'short answer', 'fill in the blank', 'matching'];

  const toggleAllFormats = () => {
    setFormats(formats.length === allFormats.length ? [] : allFormats);
  };

  const toggleFormat = (format: string) => {
    if (formats.includes(format)) {
      setFormats(formats.filter(f => f !== format));
    } else {
      setFormats([...formats, format]);
    }
  };

  return (
    <div className='mb-4'>
      <label className='block mb-2'>Question Formats:</label>
      <div className='space-y-2'>
        <div className='mb-2'>
          <button
            type='button'
            onClick={toggleAllFormats}
            className='bg-gray-200 text-gray-800 px-3 py-1 rounded text-sm'
          >
            {formats.length === allFormats.length ? 'Deselect All' : 'Select All'}
          </button>
        </div>
        {[
          { value: 'multiple choice', label: 'Single Multiple Choice' },
          { value: 'select all', label: 'Select All That Apply' },
          { value: 'true false', label: 'True/False' },
          { value: 'short answer', label: 'Short Answer' },
          { value: 'fill in the blank', label: 'Fill in the Blank' },
          { value: 'matching', label: 'Matching' },
        ].map(option => (
          <div key={option.value} className='flex items-center'>
            <input
              type='checkbox'
              id={`format-${option.value}`}
              value={option.value}
              checked={formats.includes(option.value)}
              onChange={() => toggleFormat(option.value)}
              className='mr-2'
            />
            <label htmlFor={`format-${option.value}`}>{option.label}</label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FormatSelector;
