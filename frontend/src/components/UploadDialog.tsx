import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';

interface UploadDialogProps {
  trigger: React.ReactNode;
  onClose?: () => void;
}

import { useCoursesContext } from '@/lib/hooks/useCourseContext';
import { SidebarItem } from './sidebar/course-content-list';
import useSWR from 'swr';
import { fetcher } from '@/lib/utils';

const UploadButton = ({ trigger, onClose }: UploadDialogProps) => {
  const router = useRouter();
  const [dialogIsOpen, setDialogIsOpen] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { selectedCourse } = useCoursesContext();

  const { data, mutate } = useSWR<SidebarItem[]>(
    selectedCourse ? `/api/courses/${selectedCourse}/documents` : null,
    fetcher
  );

  const { courseId } = useParams<{ courseId: string }>();

  const handleDropZoneClick = () => {
    fileInputRef.current?.click();
  };

  const handleDropZoneDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDropZoneDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      if (fileInputRef.current) {
        fileInputRef.current.files = files;
        fileInputRef.current.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
  };

  const handleUpload = async () => {
    if (!data) return;

    const fileInput = fileInputRef.current;
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
      alert('Please select a file before uploading.');
      return;
    }

    const file = fileInput.files[0];

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      alert('Only PDF files are allowed.');
      return;
    }

    // Create a FormData object to hold the file and any additional fields
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', file.name);

    try {
      // Send the file to your Next.js API route
      const response = await fetch(`/api/courses/${courseId}/documents/pdf/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'File upload failed');
      }

      const newPdf = await response.json();

      mutate([...data, newPdf], false);

      router.push(`/courses/${selectedCourse}/pdfs/${newPdf._id}`);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert(`Upload failed: ${error}`);
    } finally {
      setDialogIsOpen(false); // Close the dialog
    }
  };

  return (
    <Dialog open={dialogIsOpen} onOpenChange={setDialogIsOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent onClick={e => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>Provide context</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Upload a document to your course to provide better context for suggestions.
        </DialogDescription>
        <div
          onClick={handleDropZoneClick}
          onDragOver={handleDropZoneDragOver}
          onDragLeave={handleDropZoneDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed border-gray-200 rounded-lg flex flex-col gap-1 p-6 items-center ${isDragging ? 'border-blue-500' : ''}`}
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            strokeWidth={1.5}
            stroke='currentColor'
            className='size-6'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12-3-3m0 0-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z'
            />
          </svg>
          <span className='text-sm font-medium text-gray-500'>Drag and drop a file or click to browse</span>
          <span className='text-xs text-gray-500'>PDF</span>
        </div>
        <Label htmlFor='file'>File</Label>
        <Input ref={fileInputRef} type='file' />
        <DialogFooter>
          <Button onClick={handleUpload} type='submit' className='w-full'>
            Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UploadButton;
