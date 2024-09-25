"use client";
import Bold from "@tiptap/extension-bold";
import BulletList from "@tiptap/extension-bullet-list";
import Document from "@tiptap/extension-document";
import Italic from "@tiptap/extension-italic";
import ListItem from "@tiptap/extension-list-item";
import OrderedList from "@tiptap/extension-ordered-list";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import EditorMenu from "@/components/editor/EditorMenu";
import Autocomplete from "./extensions/Autocomplete";

const Editor = () => {
  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
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
        class: "prose p-4 m-0 h-full w-full max-w-none focus:outline-none",
      },
    },
    autofocus: true,
    content: `
          <ul>
            <li>
              <p>This is a list item</p>
            </li>
          </ul>
      `,
  });

  if (!editor) return null;

  return (
    <div className="grid grid-rows-[auto_1fr] h-full w-full">
      <EditorMenu editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
};

export default Editor;
