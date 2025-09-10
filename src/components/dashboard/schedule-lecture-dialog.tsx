'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CalendarPlus, CheckCircle, XCircle } from 'lucide-react';
import type { ScheduleLectureOutput } from '@/ai/flows/schedule-lecture';
import { scheduleLecture } from '@/lib/actions';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import type { Course, User, Lecture, Notification } from '@/lib/types';
import { notifications as mockNotifications } from '@/lib/data';


type ScheduleLectureDialogProps = {
    teachers: User[];
    courses: Course[];
    classrooms: string[];
    setLectures: React.Dispatch<React.SetStateAction<Lecture[]>>;
}

export function ScheduleLectureDialog({ teachers, courses, classrooms, setLectures }: ScheduleLectureDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<ScheduleLectureOutput | null>(null);
  const [isResultOpen, setIsResultOpen] = useState(false);
  const { toast } = useToast();
  
  const [subject, setSubject] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [classroom, setClassroom] = useState('');

  const handleSchedule = async () => {
    if (!subject || !teacherId || !classroom) {
        toast({
            variant: 'destructive',
            title: 'Missing Information',
            description: 'Please fill out all fields to schedule a lecture.',
        });
        return;
    }
    
    setIsSubmitting(true);
    const selectedTeacher = teachers.find(t => t.id === teacherId)
    
    const input = {
      subject,
      teacher: selectedTeacher?.name || '',
      classroom,
    };

    const response = await scheduleLecture(input);

    if (response.success && response.data && response.data.success) {
        setResult(response.data);
        setIsResultOpen(true);
        setOpen(false);

        // Create new lecture and update state
        const selectedCourse = courses.find(c => c.subject === subject);
        const newLecture: Lecture = {
            id: `L${Date.now()}`,
            subject: subject,
            code: selectedCourse?.code || 'N/A',
            teacher: selectedTeacher?.name || '',
            teacherId: teacherId,
            classroom: classroom,
            day: response.data.dayOfWeek as any,
            startTime: response.data.startTime!,
            endTime: response.data.endTime!,
            status: 'confirmed',
            forRoles: ['admin', 'teacher', 'student'],
            students: [],
            elective: selectedCourse?.elective || false,
        };
        setLectures((prev) => [...prev, newLecture]);

        // Create and store the notification
        const newNotification: Notification = {
            id: `N${Date.now()}`,
            title: 'New Lecture Scheduled',
            description: `A new lecture "${newLecture.subject}" has been scheduled for ${newLecture.day} at ${newLecture.startTime}.`,
            read: false,
            timestamp: new Date(),
        };

        const storedNotifications = JSON.parse(localStorage.getItem('classbuddy-notifications') || 'null');
        const currentNotifications = storedNotifications || mockNotifications;
        const updatedNotifications = [newNotification, ...currentNotifications];
        localStorage.setItem('classbuddy-notifications', JSON.stringify(updatedNotifications));


    } else {
      const errorMessage = response.data?.reason || (typeof response.error === 'object' 
        ? Object.values(response.error).flat().join(', ')
        : response.error) || 'An unknown error occurred.';

      toast({
        variant: 'destructive',
        title: 'Error scheduling lecture',
        description: errorMessage,
      });
      if (response.data) {
        setResult(response.data)
        setIsResultOpen(true)
      }
    }

    setIsSubmitting(false);
    if(response.success && response.data?.success) {
        setSubject('');
        setTeacherId('');
        setClassroom('');
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>
            <CalendarPlus className="mr-2" /> Schedule Lecture
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule a New Lecture</DialogTitle>
            <DialogDescription>
              Use this AI-powered tool to find a time slot and schedule a new lecture.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
               <Select value={subject} onValueChange={setSubject}>
                    <SelectTrigger id="subject">
                        <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                    <SelectContent>
                        {courses.map(course => <SelectItem key={course.id} value={course.subject}>{course.subject}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="teacher">Teacher</Label>
                <Select value={teacherId} onValueChange={setTeacherId}>
                    <SelectTrigger id="teacher">
                        <SelectValue placeholder="Select a teacher" />
                    </SelectTrigger>
                    <SelectContent>
                        {teachers.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="classroom">Classroom</Label>
               <Select value={classroom} onValueChange={setClassroom}>
                    <SelectTrigger id="classroom">
                        <SelectValue placeholder="Select a classroom" />
                    </SelectTrigger>
                    <SelectContent>
                        {classrooms.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
                <Button variant="outline" disabled={isSubmitting}>Cancel</Button>
            </DialogClose>
            <Button
              onClick={handleSchedule}
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isResultOpen} onOpenChange={setIsResultOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
                {result?.success ? <CheckCircle className="text-green-500"/> : <XCircle className="text-red-500" />}
                AI Scheduling Result
            </AlertDialogTitle>
            <AlertDialogDescription>
              {result?.success 
                ? `A new lecture has been scheduled successfully.`
                : `Could not schedule the lecture.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div>
            {result?.success ? (
                 <div className="rounded-md border p-4">
                    <p><strong>Subject:</strong> {subject}</p>
                    <p><strong>Teacher:</strong> {teachers.find(t => t.id === teacherId)?.name}</p>
                    <p><strong>Classroom:</strong> {classroom}</p>
                    <p><strong>Time:</strong> {result.dayOfWeek}, {result.startTime} - {result.endTime}</p>
                 </div>
            ) : (
                <p>{result?.reason || 'No available slots were found for the specified criteria.'}</p>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setIsResultOpen(false)}>
              Got it
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
