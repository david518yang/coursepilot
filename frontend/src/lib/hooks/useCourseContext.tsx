import React, { createContext, useContext, useState, useCallback } from 'react';
import { ICourseWithNotes } from '@/lib/models/Course';
import { INoteLean } from '../models/Note';

interface CoursesContextType {
  courses: ICourseWithNotes[];
  addCourse: (course: ICourseWithNotes) => void;
  updateCourse: (courseId: string, updatedCourse: Partial<ICourseWithNotes>) => void;
  deleteCourse: (courseId: string) => void;
  addNote: (courseId: string, note: INoteLean) => void;
  updateNote: (courseId: string, noteId: string, title: string) => void;
  deleteNote: (courseId: string, noteId: string) => void;
}

const CoursesContext = createContext<CoursesContextType | undefined>(undefined);

export const CoursesProvider: React.FC<{
  initialCourses: ICourseWithNotes[];
  children: React.ReactNode;
}> = ({ initialCourses, children }) => {
  const [courses, setCourses] = useState<ICourseWithNotes[]>(initialCourses);

  const addCourse = useCallback((course: ICourseWithNotes) => {
    setCourses(prevCourses => [...prevCourses, course]);
  }, []);

  const updateCourse = useCallback((courseId: string, updatedCourse: Partial<ICourseWithNotes>) => {
    setCourses(prevCourses =>
      prevCourses.map(course =>
        course._id === courseId ? { ...course, ...updatedCourse } : course
      )
    );
  }, []);

  const deleteCourse = useCallback((courseId: string) => {
    setCourses(prevCourses => prevCourses.filter(course => course._id !== courseId));
  }, []);

  const addNote = useCallback((courseId: string, note: INoteLean) => {
    setCourses(prevCourses =>
      prevCourses.map(course =>
        course._id === courseId ? { ...course, notes: [...course.notes, note] } : course
      )
    );
  }, []);

  const updateNote = useCallback((courseId: string, noteId: string, title: string) => {
    setCourses(prevCourses =>
      prevCourses.map(course =>
        course._id === courseId
          ? {
              ...course,
              notes: course.notes.map(note => (note._id === noteId ? { ...note, title } : note))
            }
          : course
      )
    );
  }, []);

  const deleteNote = useCallback((courseId: string, noteId: string) => {
    setCourses(prevCourses =>
      prevCourses.map(course =>
        course._id === courseId
          ? { ...course, notes: course.notes.filter(note => note._id !== noteId) }
          : course
      )
    );
  }, []);

  return (
    <CoursesContext.Provider
      value={{
        courses,
        addCourse,
        updateCourse,
        deleteCourse,
        addNote,
        updateNote,
        deleteNote
      }}
    >
      {children}
    </CoursesContext.Provider>
  );
};

export const useCoursesContext = () => {
  const context = useContext(CoursesContext);
  if (context === undefined) {
    throw new Error('useCoursesContext must be used within a CoursesProvider');
  }
  return context;
};

