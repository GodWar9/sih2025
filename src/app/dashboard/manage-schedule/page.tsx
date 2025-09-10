'use client';

import { useAuth } from '@/hooks/use-auth';
import { lectures as allLectures, users as allUsers, courses as allCourses } from '@/lib/data';
import type { Lecture } from '@/lib/types';
import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CancelLectureDialog } from '@/components/dashboard/cancel-lecture-dialog';
import { CheckAvailabilityDialog } from '@/components/dashboard/check-availability-dialog';
import { ScheduleLectureDialog } from '@/components/dashboard/schedule-lecture-dialog';

export default function ManageSchedulePage() {
  const { user } = useAuth();
  const [lectures, setLectures] = useState<Lecture[]>(allLectures);

  const manageableLectures = useMemo(() => {
    if (!user) return [];
    if (user.role === 'admin') return lectures;
    if (user.role === 'teacher') {
      return lectures.filter((lecture) => lecture.teacherId === user.id);
    }
    return [];
  }, [user, lectures]);

  const teachers = useMemo(() => allUsers.filter(u => u.role === 'teacher'), []);
  const courses = useMemo(() => allCourses, []);
  const classrooms = useMemo(() => Array.from(new Set(allLectures.map(l => l.classroom))), []);


  if (user?.role === 'student') {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Access Denied</CardTitle>
                <CardDescription>
                    You do not have permission to manage schedules.
                </CardDescription>
            </CardHeader>
        </Card>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight font-headline">Manage Schedule</h1>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Your Lectures</CardTitle>
              <CardDescription>Review and manage your upcoming lectures. You can cancel a lecture to notify students.</CardDescription>
            </div>
            <div className="flex gap-2">
             <CheckAvailabilityDialog />
             {user?.role === 'admin' && (
                <ScheduleLectureDialog 
                    teachers={teachers} 
                    courses={courses} 
                    classrooms={classrooms}
                    setLectures={setLectures}
                />
             )}
            </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead className="hidden md:table-cell">Day</TableHead>
                <TableHead className="hidden md:table-cell">Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {manageableLectures.map((lecture) => (
                <TableRow key={lecture.id}>
                  <TableCell>
                    <div className="font-medium">{lecture.subject}</div>
                    <div className="text-sm text-muted-foreground">{lecture.code}</div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{lecture.day}</TableCell>
                  <TableCell className="hidden md:table-cell">{lecture.startTime} - {lecture.endTime}</TableCell>
                  <TableCell>
                    <Badge variant={lecture.status === 'canceled' ? 'destructive' : 'default'}>{lecture.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <CancelLectureDialog lecture={lecture} setLectures={setLectures} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
