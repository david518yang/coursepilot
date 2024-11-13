'use client';

import * as React from 'react';
import Image from 'next/image';

import { CourseContentList } from '@/components/sidebar/course-content-list';
import { NavUser } from '@/components/sidebar/nav-user';
import { CourseSwitcher } from '@/components/sidebar/course-switcher';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from '@/components/ui/sidebar';

import { useCoursesContext } from '@/lib/hooks/useCourseContext';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { courses } = useCoursesContext();

  return (
    <Sidebar collapsible='icon' {...props}>
      <SidebarHeader className='flex'>
        <Image src='/coursepilot-wide-logo.png' className='p-1' alt='Logo' height={36} width={140} />
        <CourseSwitcher />
      </SidebarHeader>
      <SidebarContent>
        {courses.length > 0 && (
          <>
            <CourseContentList />
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
