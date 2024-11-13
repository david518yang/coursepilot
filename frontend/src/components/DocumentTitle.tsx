'use client';

import React, { useEffect, useState } from 'react';
import { useCoursesContext } from '@/lib/hooks/useCourseContext';
import useSWR from 'swr';
import { fetcher } from '@/lib/utils';
import { SidebarItem } from '@/components/sidebar/course-content-list';
import { Input } from '@/components/ui/input';

const DocumentTitle = ({
  documentId,
  documentTitle,
  documentType,
}: {
  documentId: string;
  documentTitle: string;
  documentType: string;
}) => {
  const [title, setTitle] = useState(documentTitle || '');
  const [previousTitle, setPreviousTitle] = useState(documentTitle || '');
  const { selectedCourse } = useCoursesContext();
  const { data: sidebarItems, mutate } = useSWR<SidebarItem[]>(
    selectedCourse ? `/api/courses/${selectedCourse}/documents` : null,
    fetcher
  );

  useEffect(() => {
    setTitle(documentTitle);
  }, [documentTitle]);

  if (documentType !== 'flashcard' && documentType !== 'note') {
    throw new Error('Invalid document type');
  }

  if (!documentId) {
    return null;
  }

  const saveTitle = async () => {
    if (title.length <= 0) {
      setTitle(previousTitle);
      return;
    }
    const res = await fetch(`/api/courses/${selectedCourse}/${documentType}s/${documentId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title }),
    });

    if (!res.ok) {
      const errorResponse = await res.json();
      console.error(errorResponse.error);
      return;
    }

    setPreviousTitle(title);

    const updatedSidebarItem = {
      title,
      type: documentType,
      _id: documentId,
      url: `/courses/${selectedCourse}/${documentType}s/${documentId}`,
      updatedAt: new Date().toISOString(),
    } as SidebarItem;
    mutate(
      sidebarItems?.map(item => (item._id === documentId ? updatedSidebarItem : item)),
      false
    );
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updatedTitle = e.target.value;
    if (updatedTitle.length > 15) return;
    setTitle((e.target as HTMLInputElement).value);
  };

  const handleTitleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      saveTitle();
    }
  };

  const handleTitleBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    saveTitle();
  };

  return (
    <Input
      className='h-full w-36'
      type='text'
      value={title}
      onChange={handleTitleChange}
      onBlur={handleTitleBlur}
      onKeyDown={handleTitleKeyDown}
      disabled={!documentTitle}
    />
  );
};

export default DocumentTitle;
