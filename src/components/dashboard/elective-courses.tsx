'use client'

import { useMemo } from 'react';
import type { Lecture, Course } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type ElectiveCoursesProps = {
    allLectures: Lecture[];
    allCourses: Course[];
    studentLectures: Lecture[];
    studentDepartment: string;
    onEnroll: (lecture: Lecture) => void;
};

// Check for time collision
const doTimesConflict = (lectureA: Lecture, lectureB: Lecture) => {
    if (lectureA.day !== lectureB.day) return false;
    const startA = parseInt(lectureA.startTime.replace(':', ''), 10);
    const endA = parseInt(lectureA.endTime.replace(':', ''), 10);
    const startB = parseInt(lectureB.startTime.replace(':', ''), 10);
    const endB = parseInt(lectureB.endTime.replace(':', ''), 10);
    return startA < endB && endA > startB;
}

export function ElectiveCourses({ allLectures, allCourses, studentLectures, studentDepartment, onEnroll }: ElectiveCoursesProps) {
    const { toast } = useToast();

    const availableElectives = useMemo(() => {
        // Get IDs of courses student is already enrolled in
        const enrolledCourseCodes = new Set(studentLectures.map(l => l.code));
        
        // Get course codes for the student's department
        const departmentCourseCodes = new Set(allCourses.filter(c => c.department === studentDepartment && c.elective).map(c => c.code));

        // Filter for electives in the student's department that they are not already enrolled in
        return allLectures.filter(lecture => 
            lecture.elective && 
            !enrolledCourseCodes.has(lecture.code) &&
            departmentCourseCodes.has(lecture.code)
        );
    }, [allLectures, allCourses, studentLectures, studentDepartment]);
    
    const handleEnroll = (elective: Lecture) => {
        // Check for conflicts
        const hasConflict = studentLectures.some(enrolledLecture => doTimesConflict(enrolledLecture, elective));
        
        if(hasConflict) {
            toast({
                variant: 'destructive',
                title: 'Scheduling Conflict',
                description: `This elective conflicts with another lecture in your timetable.`,
            });
        } else {
            onEnroll(elective);
            toast({
                title: 'Successfully Enrolled',
                description: `You have been enrolled in ${elective.subject}.`,
            });
        }
    }

    if (availableElectives.length === 0) return null;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Available Electives</CardTitle>
                <CardDescription>Browse and enroll in elective courses from your department that fit your schedule.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {availableElectives.map(elective => (
                        <div key={elective.id} className="flex items-center justify-between rounded-lg border p-4">
                            <div>
                                <p className="font-semibold">{elective.subject}</p>
                                <p className="text-sm text-muted-foreground">{elective.teacher}</p>
                                <p className="text-xs text-muted-foreground">{elective.day}, {elective.startTime} - {elective.endTime}</p>
                            </div>
                            <Button size="sm" onClick={() => handleEnroll(elective)}>
                                <PlusCircle className="mr-2 h-4 w-4" /> Enroll
                            </Button>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
