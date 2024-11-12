import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PlusIcon } from '@heroicons/react/20/solid';
import { SidebarGroupAction } from '../ui/sidebar';
import { BookOpenCheck, FileText, Library } from 'lucide-react';
import NoteDialog from '../NoteDialog';
import FlashcardDialog from '../FlashcardDialog';

const CreateButton = () => {
  const [isDropdownMenuOpen, setIsDropdownMenuOpen] = useState(false);
  const handleDropdownSelect = (e: Event) => {
    e.preventDefault();
  };

  return (
    <DropdownMenu open={isDropdownMenuOpen} onOpenChange={setIsDropdownMenuOpen} modal={false}>
      <DropdownMenuTrigger asChild>
        <SidebarGroupAction>
          <PlusIcon />
          <span className='sr-only'>Create</span>
        </SidebarGroupAction>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-48'>
        <DropdownMenuGroup>
          <NoteDialog
            trigger={
              <DropdownMenuItem className='gap-2' onSelect={handleDropdownSelect}>
                <FileText />
                <span>Create note</span>
              </DropdownMenuItem>
            }
            editing={false}
            onClose={() => setIsDropdownMenuOpen(false)}
          />
        </DropdownMenuGroup>
        <DropdownMenuGroup>
          <FlashcardDialog
            trigger={
              <DropdownMenuItem className='gap-2' onSelect={handleDropdownSelect}>
                <Library />
                <span>Create flashcards</span>
              </DropdownMenuItem>
            }
            onClose={() => setIsDropdownMenuOpen(false)}
          />
        </DropdownMenuGroup>
        <DropdownMenuGroup>
          <DropdownMenuItem className='gap-2' disabled>
            <BookOpenCheck />
            <span>Create quiz</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CreateButton;
