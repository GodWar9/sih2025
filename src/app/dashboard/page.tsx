'use client';

import { Timetable } from '@/components/dashboard/timetable';
import { TimetableFilters } from '@/components/dashboard/timetable-filters';
import { lectures as allLectures, users, courses as allCourses } from '@/lib/data';
import type { Lecture } from '@/lib/types';
import { useState, useMemo } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { ElectiveCourses } from '@/components/dashboard/elective-courses';

export default function TimetablePage() {
  const { user } = useAuth();
  const [filters, setFilters] = useState({ subject: '', teacher: '', day: 'all' });
  // We'll manage lectures in state now to allow for dynamic additions
  const [lectures, setLectures] = useState<Lecture[]>(allLectures);

  const teachers = useMemo(() => {
    const teacherSet = new Set<string>();
    lectures.forEach(l => teacherSet.add(l.teacher));
    return Array.from(teacherSet);
  }, [lectures]);
  
  const subjects = useMemo(() => {
    const subjectSet = new Set<string>();
    lectures.forEach(l => subjectSet.add(l.subject));
    return Array.from(subjectSet);
  }, [lectures]);

  const lecturesForUser = useMemo(() => {
    if (!user) return [];
    // If student, show lectures they are enrolled in.
    if (user.role === 'student') {
        return lectures.filter(l => l.students.some(s => s.studentId === user.id));
    }
    // For teachers and admins, show lectures based on their role
    return lectures.filter(lecture => lecture.forRoles.includes(user.role) || (user.role === 'teacher' && lecture.teacherId === user.id));
  }, [user, lectures]);

  const filteredLectures = useMemo(() => {
    return lecturesForUser.filter(lecture => {
      const subjectMatch = filters.subject === '' || lecture.subject === filters.subject;
      const teacherMatch = filters.teacher === '' || lecture.teacher === filters.teacher;
      const dayMatch = filters.day === 'all' || lecture.day === filters.day;
      return subjectMatch && teacherMatch && dayMatch;
    });
  }, [filters, lecturesForUser]);
  
  const addLectureToStudent = (lecture: Lecture) => {
    if (!user) return;
    // This is a mock update. In a real app, you'd send this to a server.
    const updatedLectures = lectures.map(l => {
        if (l.id === lecture.id) {
            const newStudents = [...l.students, { studentId: user.id, attendanceRate: 1, missedSessions: 0 }];
            return { ...l, students: newStudents };
        }
        return l;
    });
    setLectures(updatedLectures);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-bold tracking-tight font-headline">My Timetable</h1>
        <TimetableFilters 
          filters={filters} 
          setFilters={setFilters}
          teachers={teachers}
          subjects={subjects}
        />
      </div>
      <Timetable lectures={filteredLectures} />

      {user?.role === 'student' && (
        <ElectiveCourses
            allLectures={lectures}
            allCourses={allCourses}
            studentLectures={lecturesForUser}
            studentDepartment={user.department}
            onEnroll={addLectureToStudent}
        />
      )}
    </div>
  );
}
