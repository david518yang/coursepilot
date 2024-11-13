import EditorButton from './EditorButton';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const ExportButton = ({ noteTitle }: { noteTitle: string }) => {
  const exportToPDF = async () => {
    const element = document.querySelector('.ProseMirror') as HTMLElement;
    if (!element) return;

    // Hide autocomplete suggestion element
    const autocompleteElement = document.getElementsByClassName('text-gray-300')[0] as HTMLElement;
    if (autocompleteElement) {
      autocompleteElement.style.visibility = 'hidden';
    }

    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/jpeg', 0.98);
    const pdf = new jsPDF('p', 'mm', 'a4');
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

    // Restore autocomplete suggestion element visibility
    if (autocompleteElement) {
      autocompleteElement.style.visibility = 'visible';
    }
  };
  return (
    <EditorButton onClick={exportToPDF}>
      <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='currentColor' className='size-5'>
        <path d='M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z' />
        <path d='M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z' />
      </svg>
    </EditorButton>
  );
};

export default ExportButton;
