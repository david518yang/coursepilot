import React, { createContext, useContext, useState, useCallback } from 'react';
import { ICourseWithNotes } from '@/lib/models/Course';
import { INoteLean } from '../models/Note';

interface CoursesContextType {
  selectedCourse: string;
  setSelectedCourse: (courseId: string) => void;
  courses: ICourseWithNotes[];
  addCourse: (course: string, userId: string) => void;
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
  const [selectedCourse, setSelectedCourse] = useState<string>('');

  const addCourse = useCallback(async (title: string, emoji: string) => {
    try {
      const response = await fetch('/api/courses/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          emoji,
        }),
      });

      // Check if the request was successful
      if (!response.ok) {
        throw new Error('Failed to add course');
      }

      // Parse the returned data from the server
      const newCourse = await response.json();

      // Update the state with the newly added course
      setCourses(prevCourses => [
        ...prevCourses,
        {
          _id: newCourse._id,
          title: newCourse.title,
          emoji: newCourse.emoji,
          userId: newCourse.userId,
          createdAt: newCourse.createdAt,
          updatedAt: newCourse.updatedAt,
          notes: [],
        },
      ]);
    } catch (error) {
      console.error('Error adding course:', error);
    }
  }, []);

  const updateCourse = useCallback(async (courseId: string, updatedCourse: Partial<ICourseWithNotes>) => {
    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedCourse),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to update course:', errorData.error);
        return;
      }

      const updatedCourseData = await response.json();

      setCourses(prevCourses =>
        prevCourses.map(course => (course._id === courseId ? { ...course, ...updatedCourseData.course } : course))
      );
    } catch (error) {
      console.error('Error updating course:', error);
    }
  }, []);

  const deleteCourse = useCallback(async (courseId: string) => {
    try {
      // Make a DELETE request to the delete API route
      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete course');
      }

      // Optionally, remove the deleted course from your state
      setCourses(prevCourses => prevCourses.filter(course => course._id !== courseId));
    } catch (error) {
      console.error('Error deleting course:', error);
    }
  }, []);

  const addNote = useCallback((courseId: string, note: INoteLean) => {
    setCourses(prevCourses =>
      prevCourses.map(course => (course._id === courseId ? { ...course, notes: [...course.notes, note] } : course))
    );
  }, []);

  const updateNote = useCallback((courseId: string, noteId: string, title: string) => {
    setCourses(prevCourses =>
      prevCourses.map(course =>
        course._id === courseId
          ? {
              ...course,
              notes: course.notes.map(note => (note._id === noteId ? { ...note, title } : note)),
            }
          : course
      )
    );
  }, []);

  const deleteNote = useCallback((courseId: string, noteId: string) => {
    setCourses(prevCourses =>
      prevCourses.map(course =>
        course._id === courseId ? { ...course, notes: course.notes.filter(note => note._id !== noteId) } : course
      )
    );
  }, []);

  return (
    <CoursesContext.Provider
      value={{
        selectedCourse,
        setSelectedCourse,
        courses,
        addCourse,
        updateCourse,
        deleteCourse,
        addNote,
        updateNote,
        deleteNote,
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
