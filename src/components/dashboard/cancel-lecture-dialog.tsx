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
import type { Lecture, Notification } from '@/lib/types';
import { getCancellationNotifications } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserCheck } from 'lucide-react';
import type { LectureCancellationNotificationOutput } from '@/ai/flows/lecture-cancellation-notification';
import { notifications as mockNotifications } from '@/lib/data';

type CancelLectureDialogProps = {
  lecture: Lecture;
  setLectures: React.Dispatch<React.SetStateAction<Lecture[]>>;
};

export function CancelLectureDialog({ lecture, setLectures }: CancelLectureDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<LectureCancellationNotificationOutput | null>(null);
  const [isResultOpen, setIsResultOpen] = useState(false);
  const { toast } = useToast();

  const handleCancel = async () => {
    setIsSubmitting(true);
    const input = {
      lectureDetails: `Lecture: ${lecture.subject} (${lecture.code}), Date: ${lecture.day}, Time: ${lecture.startTime}-${lecture.endTime}`,
      studentList: lecture.students,
    };

    const response = await getCancellationNotifications(input);

    if (response.success && response.data) {
        setResult(response.data);
        setIsResultOpen(true);
        setOpen(false);

        // Update the lecture status in the parent component's state
        setLectures((prevLectures) => 
            prevLectures.map(l => l.id === lecture.id ? {...l, status: 'canceled'} : l)
        );

        // Create and store the notification
        const newNotification: Notification = {
            id: `N${Date.now()}`,
            title: 'Lecture Canceled',
            description: `Your lecture "${lecture.subject}" on ${lecture.day} at ${lecture.startTime} has been canceled.`,
            read: false,
            timestamp: new Date(),
        };

        const storedNotifications = JSON.parse(localStorage.getItem('classbuddy-notifications') || 'null');
        const currentNotifications = storedNotifications || mockNotifications;
        const updatedNotifications = [newNotification, ...currentNotifications];
        localStorage.setItem('classbuddy-notifications', JSON.stringify(updatedNotifications));
        
    } else {
      const errorMessage = typeof response.error === 'object' 
        ? Object.values(response.error).flat().join(', ')
        : response.error || 'An unknown error occurred.';

      toast({
        variant: 'destructive',
        title: 'Error processing cancellation',
        description: errorMessage,
      });
    }

    setIsSubmitting(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="destructive"
            size="sm"
            disabled={lecture.status === 'canceled'}
          >
            Cancel Lecture
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Lecture: {lecture.subject}?</DialogTitle>
            <DialogDescription>
              This will use an AI-powered tool to determine which enrolled
              students should be notified about the cancellation. The timetable will be updated.
            </DialogDescription>
          </DialogHeader>
          <div>
            <p><strong>Subject:</strong> {lecture.subject} ({lecture.code})</p>
            <p><strong>Instructor:</strong> {lecture.teacher}</p>
            <p><strong>Time:</strong> {lecture.day}, {lecture.startTime} - {lecture.endTime}</p>
            <p><strong>Students Enrolled:</strong> {lecture.students.length}</p>
          </div>
          <DialogFooter>
            <DialogClose asChild>
                <Button variant="outline" disabled={isSubmitting}>Back</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm Cancellation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isResultOpen} onOpenChange={setIsResultOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
                <UserCheck className="text-primary"/> AI Notification Results
            </AlertDialogTitle>
            <AlertDialogDescription>
                Based on attendance patterns, the following students will be notified about the cancellation of <strong>{lecture.subject}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div>
            {result && result.studentsToNotify.length > 0 ? (
                 <ul className="space-y-2 rounded-md border p-4">
                    {result.studentsToNotify.map((student) => (
                        <li key={student.studentId} className="flex justify-between items-center">
                            <span>Student ID: <strong>{student.studentId}</strong></span>
                            <span className="text-sm text-muted-foreground">{student.reason}</span>
                        </li>
                    ))}
                 </ul>
            ) : (
                <p>No students were identified for notification.</p>
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
