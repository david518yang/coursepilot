'use client';

import Bold from '@tiptap/extension-bold';
import BulletList from '@tiptap/extension-bullet-list';
import Document from '@tiptap/extension-document';
import Heading from '@tiptap/extension-heading';
import Italic from '@tiptap/extension-italic';
import ListItem from '@tiptap/extension-list-item';
import OrderedList from '@tiptap/extension-ordered-list';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import Underline from '@tiptap/extension-underline';
import { EditorContent, useEditor } from '@tiptap/react';
import EditorMenu from '@/components/editor/EditorMenu';
import Autocomplete from './extensions/Autocomplete';
import { useCoursesContext } from '@/lib/hooks/useCourseContext';
import CourseDialog from '@/components/CourseDialog';
import { Button } from '@/components/ui/button';
import { FolderPlusIcon } from '@heroicons/react/20/solid';
import { INoteDocument } from '@/lib/models/Note';
import useSWR from 'swr';
import { fetcher } from '@/lib/utils';
import { useEffect } from 'react';

import { debounce } from 'lodash';
import { useCallback } from 'react';

const Editor = ({ noteId }: { noteId: string }) => {
  const { courses, selectedCourse } = useCoursesContext();

  const { data: note, isLoading } = useSWR<INoteDocument>(
    selectedCourse && noteId && `/api/courses/${selectedCourse}/notes/${noteId}`,
    fetcher
  );

  const saveNote = async (content: string) => {
    await fetch(`/api/courses/${note?.courseId}/notes/${note?._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });
  };

  const debouncedSave = useCallback(debounce(saveNote, 500), [note?._id]);

  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Heading.configure({ levels: [1, 2, 3] }),
      ListItem,
      BulletList,
      OrderedList,
      Bold,
      Italic,
      Underline,
      Autocomplete,
    ],
    editorProps: {
      attributes: {
        class: 'prose p-4 m-0 h-full w-full max-w-none break-all focus:outline-none',
      },
    },
    autofocus: true,
    content: note?.content,
    onUpdate: ({ editor }) => {
      const content = editor.getHTML();
      debouncedSave(content);
    },
  });

  // Update editor content when `note.content` changes
  useEffect(() => {
    if (editor && note?.content) {
      editor.commands.setContent(note.content);
    }
  }, [editor, note?.content]);

  return (
    <div className='relative grid grid-rows-[auto_1fr] h-full w-full overflow-auto'>
      {courses.length === 0 && (
        <div className='absolute inset-0 z-[40] flex flex-col items-center justify-center bg-gray-300 bg-opacity-75'>
          <CourseDialog
            trigger={
              <Button className='flex font-normal items-center gap-2.5'>
                <p>Create your first course</p>

                <FolderPlusIcon className='h-5 w-5' />
              </Button>
            }
            editing={false}
          />
        </div>
      )}
      <EditorMenu editor={editor} noteId={noteId} title={note?.title || ''} />
      {note && <EditorContent editor={editor} />}
    </div>
  );
};

export default Editor;
