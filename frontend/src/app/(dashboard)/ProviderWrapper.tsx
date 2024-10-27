'use client';

import { CoursesProvider } from '@/lib/hooks/useCourseContext';
import { ICourseWithNotes } from '@/lib/models/Course';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/sidebar/app-sidebar';

export function ProviderWrapper({
  children,
  initialCourses,
}: {
  children: React.ReactNode;
  initialCourses: ICourseWithNotes[];
}) {
  return (
    <CoursesProvider initialCourses={initialCourses}>
      <SidebarProvider>
        <AppSidebar />
        <main className='w-full h-screen overflow-auto'>{children}</main>
      </SidebarProvider>
    </CoursesProvider>
  );
}
