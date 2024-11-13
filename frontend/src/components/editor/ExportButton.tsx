import { useState } from 'react';
import EditorButton from './EditorButton';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Editor } from '@tiptap/react';

const ExportButton = ({ noteTitle, editor }: { noteTitle: string; editor: Editor | null }) => {
  const [exporting, setExporting] = useState(false);

  if (!editor) return null;

  const exportToPDF = async () => {
    const element = document.querySelector('.ProseMirror') as HTMLElement;
    if (!element) return;

    setExporting(true);

    // Emit an update event to force a rerender of the editor
    editor.emit('update', { editor: editor, transaction: editor.state.tr });

    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/jpeg', 1);
    const pdf = new jsPDF('p', 'mm', 'letter');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgProps = pdf.getImageProperties(imgData);
    const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight);
    heightLeft -= pdfHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    pdf.save(`${noteTitle || 'document'}.pdf`);
    setExporting(false);
  };

  return (
    <div className='relative'>
      {exporting && (
        <div className='absolute top-0 right-[-8px] scale-[0.75]'>
          <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='currentColor' className='size-4'>
            <path
              fillRule='evenodd'
              d='M13.836 2.477a.75.75 0 0 1 .75.75v3.182a.75.75 0 0 1-.75.75h-3.182a.75.75 0 0 1 0-1.5h1.37l-.84-.841a4.5 4.5 0 0 0-7.08.932.75.75 0 0 1-1.3-.75 6 6 0 0 1 9.44-1.242l.842.84V3.227a.75.75 0 0 1 .75-.75Zm-.911 7.5A.75.75 0 0 1 13.199 11a6 6 0 0 1-9.44 1.241l-.84-.84v1.371a.75.75 0 0 1-1.5 0V9.591a.75.75 0 0 1 .75-.75H5.35a.75.75 0 0 1 0 1.5H3.98l.841.841a4.5 4.5 0 0 0 7.08-.932.75.75 0 0 1 1.025-.273Z'
              clipRule='evenodd'
            />
          </svg>
        </div>
      )}
      <EditorButton onClick={exportToPDF}>
        <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='currentColor' className='size-5'>
          <path d='M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z' />
          <path d='M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z' />
        </svg>
      </EditorButton>
    </div>
  );
};

export default ExportButton;
