'use client';

import * as React from 'react';

import { NoteList } from '@/components/sidebar/note-list';
import { NavUser } from '@/components/sidebar/nav-user';
import { CourseSwitcher } from '@/components/sidebar/course-switcher';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from '@/components/ui/sidebar';

import { useCoursesContext } from '@/lib/hooks/useCourseContext';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { courses, selectedCourse } = useCoursesContext();

  return (
    <Sidebar collapsible='icon' {...props}>
      <SidebarHeader>
        <CourseSwitcher />
      </SidebarHeader>
      <SidebarContent>
        {selectedCourse && courses.length > 0 && (
          <>
            <NoteList />
          </>
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
