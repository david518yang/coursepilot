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
import { useParams, useRouter } from 'next/navigation';

const CreateButton = () => {
  const [isDropdownMenuOpen, setIsDropdownMenuOpen] = useState(false);
  const router = useRouter();
  const params = useParams();

  const handleDropdownSelect = (e: Event) => {
    e.preventDefault();
  };

  const handleQuizCreate = (e: Event) => {
    e.preventDefault();
    setIsDropdownMenuOpen(false);
    router.push(`/courses/${params.courseId}/quizzes/generate`);
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
          <DropdownMenuItem className='gap-2' onSelect={handleQuizCreate}>
            <BookOpenCheck />
            <span>Create quiz</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CreateButton;
