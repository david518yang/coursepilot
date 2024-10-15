import React, { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const emojis = ['📝', '📚', '💡', '🎯', '📅', '🔍', '✅', '🗂️', '📌'];

interface EmojiPickerProps {
  selectedEmoji: string;
  setSelectedEmoji: (emoji: string) => void;
}

const EmojiPicker: React.FC<EmojiPickerProps> = ({ selectedEmoji, setSelectedEmoji }) => {
  selectedEmoji = selectedEmoji || emojis[0];

  const handleEmojiSelect = (event: Event) => {
    const emoji = (event.currentTarget as HTMLElement).textContent || '';
    setSelectedEmoji(emoji);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className='border hover:bg-muted transition-colors rounded-md pt-1 pb-1 pl-2.5 pr-2.5'>
        {selectedEmoji}
      </DropdownMenuTrigger>
      <DropdownMenuContent className='grid grid-cols-3'>
        {emojis.map(emoji => (
          <DropdownMenuItem
            key={emoji}
            onSelect={handleEmojiSelect}
            textValue={emoji}
            className={`flex items-center justify-center ${selectedEmoji === emoji ? 'bg-accent' : ''}`}
          >
            {emoji}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default EmojiPicker;
