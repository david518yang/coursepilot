"use client";

import { CoursesProvider } from "@/lib/hooks/useCourseContext";
import { ICourseWithNotes } from "@/lib/models/Course";

import Sidebar from "@/components/Sidebar";
import { SignedIn, UserButton } from "@clerk/nextjs";

export function ProviderWrapper({
  children,
  initialCourses,
}: {
  children: React.ReactNode;
  initialCourses: ICourseWithNotes[];
}) {
  return (
    <CoursesProvider initialCourses={initialCourses}>
      <div className="h-screen flex overflow-hidden">
        <Sidebar />
        <div className="flex-1 relative">
          <div className="absolute top-2 right-2 z-20">
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
          <main className="w-full h-full overflow-auto">{children}</main>
        </div>
      </div>
    </CoursesProvider>
  );
}
