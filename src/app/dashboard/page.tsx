'use client';

import { Timetable } from '@/components/dashboard/timetable';
import { TimetableFilters } from '@/components/dashboard/timetable-filters';
import { lectures as allLectures, users } from '@/lib/data';
import type { Lecture } from '@/lib/types';
import { useState, useMemo } from 'react';
import { useAuth } from '@/hooks/use-auth';

export default function TimetablePage() {
  const { user } = useAuth();
  const [filters, setFilters] = useState({ subject: '', teacher: '', day: 'all' });

  const teachers = useMemo(() => {
    const teacherSet = new Set<string>();
    allLectures.forEach(l => teacherSet.add(l.teacher));
    return Array.from(teacherSet);
  }, []);
  
  const subjects = useMemo(() => {
    const subjectSet = new Set<string>();
    allLectures.forEach(l => subjectSet.add(l.subject));
    return Array.from(subjectSet);
  }, []);

  const lecturesForUser = useMemo(() => {
    if (!user) return [];
    return allLectures.filter(lecture => lecture.forRoles.includes(user.role));
  }, [user]);

  const filteredLectures = useMemo(() => {
    return lecturesForUser.filter(lecture => {
      const subjectMatch = filters.subject === '' || lecture.subject === filters.subject;
      const teacherMatch = filters.teacher === '' || lecture.teacher === filters.teacher;
      const dayMatch = filters.day === 'all' || lecture.day === filters.day;
      return subjectMatch && teacherMatch && dayMatch;
    });
  }, [filters, lecturesForUser]);

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
    </div>
  );
}
