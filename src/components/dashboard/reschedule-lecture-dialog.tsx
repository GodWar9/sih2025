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
import { Button } from '@/components/ui/button';
import type { Lecture, Notification } from '@/lib/types';
import { findRescheduleSlots } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CalendarCog } from 'lucide-react';
import type { FindRescheduleSlotsOutput } from '@/ai/flows/reschedule-lecture';
import { notifications as mockNotifications } from '@/lib/data';
import { ScrollArea } from '../ui/scroll-area';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';

type RescheduleLectureDialogProps = {
  lecture: Lecture;
  setLectures: React.Dispatch<React.SetStateAction<Lecture[]>>;
};

export function RescheduleLectureDialog({ lecture, setLectures }: RescheduleLectureDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<FindRescheduleSlotsOutput['availableSlots']>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const { toast } = useToast();

  const handleFindSlots = async () => {
    setIsLoading(true);
    setAvailableSlots([]);
    setSelectedSlot('');

    const input = {
      teacher: lecture.teacher,
      classroom: lecture.classroom,
      studentIds: lecture.students.map(s => s.studentId),
    };

    const response = await findRescheduleSlots(input);

    if (response.success && response.data) {
      if (response.data.availableSlots.length > 0) {
        setAvailableSlots(response.data.availableSlots);
      } else {
        toast({
            variant: 'default',
            title: 'No Slots Found',
            description: 'The AI could not find any suitable time slots for everyone.',
        });
      }
    } else {
      const errorMessage = typeof response.error === 'object' 
        ? Object.values(response.error).flat().join(', ')
        : response.error || 'An unknown error occurred.';

      toast({
        variant: 'destructive',
        title: 'Error finding slots',
        description: errorMessage,
      });
    }

    setIsLoading(false);
  };

  const handleReschedule = () => {
    if (!selectedSlot) {
        toast({
            variant: 'destructive',
            title: 'No Slot Selected',
            description: 'Please select a new time slot for the lecture.',
        });
        return;
    }
    
    const [dayOfWeek, startTime, endTime] = selectedSlot.split('|');

     // Update the lecture status in the parent component's state
    setLectures((prevLectures) => 
        prevLectures.map(l => l.id === lecture.id 
            ? { ...l, status: 'confirmed', day: dayOfWeek as any, startTime, endTime } 
            : l
        )
    );

    // Create and store the notification
    const newNotification: Notification = {
        id: `N${Date.now()}`,
        title: 'Lecture Rescheduled',
        description: `Your lecture "${lecture.subject}" has been rescheduled to ${dayOfWeek} at ${startTime}.`,
        read: false,
        timestamp: new Date(),
    };

    const storedNotifications = JSON.parse(localStorage.getItem('classbuddy-notifications') || 'null');
    const currentNotifications = storedNotifications || mockNotifications;
    const updatedNotifications = [newNotification, ...currentNotifications];
    localStorage.setItem('classbuddy-notifications', JSON.stringify(updatedNotifications));

    toast({
        title: 'Lecture Rescheduled!',
        description: `${lecture.subject} has been moved to ${dayOfWeek} at ${startTime}.`,
    });

    setOpen(false);
    setAvailableSlots([]);
    setSelectedSlot('');
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
            setAvailableSlots([]);
            setSelectedSlot('');
        }
    }}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={lecture.status !== 'canceled'}
        >
          <CalendarCog className="mr-2 h-4 w-4" /> Reschedule
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Reschedule Lecture: {lecture.subject}</DialogTitle>
          <DialogDescription>
            Use AI to find a new time that works for the teacher, classroom, and all enrolled students.
          </DialogDescription>
        </DialogHeader>
        {!isLoading && availableSlots.length === 0 && (
            <div className="flex flex-col items-center justify-center text-center p-8 border rounded-lg my-4">
                <CalendarCog className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="font-semibold mb-2">Find a new time for this lecture</p>
                <p className="text-sm text-muted-foreground mb-4">The AI will check everyone's schedule for a free 1.5-hour slot.</p>
                <Button onClick={handleFindSlots}>
                    Find Available Slots
                </Button>
            </div>
        )}
        {isLoading && (
            <div className="flex items-center justify-center p-8 my-4">
                <Loader2 className="mr-2 h-8 w-8 animate-spin" />
                <p>Checking all schedules...</p>
            </div>
        )}
        {!isLoading && availableSlots.length > 0 && (
            <div>
                <h4 className="font-semibold mb-2">Select a New Time Slot:</h4>
                <ScrollArea className="h-64 w-full pr-4">
                    <RadioGroup value={selectedSlot} onValueChange={setSelectedSlot} className="space-y-2">
                        {availableSlots.map((slot, index) => {
                             const slotId = `${slot.dayOfWeek}|${slot.startTime}|${slot.endTime}`;
                             return (
                                <Label 
                                    key={index} 
                                    htmlFor={slotId}
                                    className="flex items-center gap-4 rounded-md border p-4 hover:bg-accent has-[:checked]:bg-primary/10 has-[:checked]:border-primary"
                                >
                                    <RadioGroupItem value={slotId} id={slotId} />
                                    <div>
                                        <p className="font-semibold">{slot.dayOfWeek}</p>
                                        <p className="text-sm text-muted-foreground">{slot.startTime} - {slot.endTime}</p>
                                    </div>
                                </Label>
                             )
                        })}
                    </RadioGroup>
                </ScrollArea>
            </div>
        )}

        <DialogFooter>
          <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
          </DialogClose>
          {availableSlots.length > 0 && (
            <Button
              onClick={handleReschedule}
              disabled={!selectedSlot}
            >
              Confirm Reschedule
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
