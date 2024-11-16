import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Editor } from '@tiptap/react';
import EditorButton from '../EditorButton';
import { Level } from '@tiptap/extension-heading';

interface Heading {
  level: Level;
  icon: JSX.Element;
}

const headings: Heading[] = [
  {
    level: 1,
    icon: (
      <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='currentColor' className='size-5'>
        <path
          fillRule='evenodd'
          d='M2.75 4a.75.75 0 0 1 .75.75v4.5h5v-4.5a.75.75 0 0 1 1.5 0v10.5a.75.75 0 0 1-1.5 0v-4.5h-5v4.5a.75.75 0 0 1-1.5 0V4.75A.75.75 0 0 1 2.75 4ZM13 8.75a.75.75 0 0 1 .75-.75h1.75a.75.75 0 0 1 .75.75v5.75h1a.75.75 0 0 1 0 1.5h-3.5a.75.75 0 0 1 0-1.5h1v-5h-1a.75.75 0 0 1-.75-.75Z'
          clipRule='evenodd'
        />
      </svg>
    ),
  },
  {
    level: 2,
    icon: (
      <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='currentColor' className='size-5'>
        <path
          fillRule='evenodd'
          d='M2.75 4a.75.75 0 0 1 .75.75v4.5h5v-4.5a.75.75 0 0 1 1.5 0v10.5a.75.75 0 0 1-1.5 0v-4.5h-5v4.5a.75.75 0 0 1-1.5 0V4.75A.75.75 0 0 1 2.75 4ZM15 9.5c-.729 0-1.445.051-2.146.15a.75.75 0 0 1-.208-1.486 16.887 16.887 0 0 1 3.824-.1c.855.074 1.512.78 1.527 1.637a17.476 17.476 0 0 1-.009.931 1.713 1.713 0 0 1-1.18 1.556l-2.453.818a1.25 1.25 0 0 0-.855 1.185v.309h3.75a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1-.75-.75v-1.059a2.75 2.75 0 0 1 1.88-2.608l2.454-.818c.102-.034.153-.117.155-.188a15.556 15.556 0 0 0 .009-.85.171.171 0 0 0-.158-.169A15.458 15.458 0 0 0 15 9.5Z'
          clipRule='evenodd'
        />
      </svg>
    ),
  },
  {
    level: 3,
    icon: (
      <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='currentColor' className='size-5'>
        <path
          fillRule='evenodd'
          d='M2.75 4a.75.75 0 0 1 .75.75v4.5h5v-4.5a.75.75 0 0 1 1.5 0v10.5a.75.75 0 0 1-1.5 0v-4.5h-5v4.5a.75.75 0 0 1-1.5 0V4.75A.75.75 0 0 1 2.75 4ZM15 9.5c-.73 0-1.448.051-2.15.15a.75.75 0 1 1-.209-1.485 16.886 16.886 0 0 1 3.476-.128c.985.065 1.878.837 1.883 1.932V10a6.75 6.75 0 0 1-.301 2A6.75 6.75 0 0 1 18 14v.031c-.005 1.095-.898 1.867-1.883 1.932a17.018 17.018 0 0 1-3.467-.127.75.75 0 0 1 .209-1.485 15.377 15.377 0 0 0 3.16.115c.308-.02.48-.24.48-.441L16.5 14c0-.431-.052-.85-.15-1.25h-2.6a.75.75 0 0 1 0-1.5h2.6c.098-.4.15-.818.15-1.25v-.024c-.001-.201-.173-.422-.481-.443A15.485 15.485 0 0 0 15 9.5Z'
          clipRule='evenodd'
        />
      </svg>
    ),
  },
];

const HeadingPicker = ({ editor }: { editor: Editor | null }) => {
  const [selectedHeadingIcon, setSelectedHeadingIcon] = useState(headings[0].icon);

  const handleHeadingClick = (level: Level, icon: JSX.Element) => {
    editor?.chain().focus().toggleHeading({ level }).run();
    setSelectedHeadingIcon(icon);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className='flex items-center justify-center hover:outline outline-border outline-2 rounded-md p-1'>
        {selectedHeadingIcon}
        <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='currentColor' className='size-4'>
          <path
            fillRule='evenodd'
            d='M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z'
            clipRule='evenodd'
          />
        </svg>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='grid grid-cols-3 gap-1'>
        {headings.map(({ level, icon }) => (
          <DropdownMenuItem key={level} asChild>
            <EditorButton
              onClick={() => handleHeadingClick(level, icon)}
              active={editor?.isActive('heading', { level })}
            >
              {icon}
            </EditorButton>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default HeadingPicker;
