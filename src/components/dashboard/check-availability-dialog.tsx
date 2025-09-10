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
import { Loader2, CalendarCheck } from 'lucide-react';
import type { CheckAvailabilityOutput } from '@/ai/flows/check-availability';
import { checkAvailability } from '@/lib/actions';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { ScrollArea } from '../ui/scroll-area';

export function CheckAvailabilityDialog() {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<CheckAvailabilityOutput | null>(null);
  const [isResultOpen, setIsResultOpen] = useState(false);
  const { toast } = useToast();
  const [room, setRoom] = useState('');
  const [instructor, setInstructor] = useState('');

  const handleCheck = async () => {
    if (!room && !instructor) {
        toast({
            variant: 'destructive',
            title: 'Missing Information',
            description: 'Please enter a room or an instructor to check.',
        });
        return;
    }
    
    setIsSubmitting(true);
    const input = {
      room: room || undefined,
      instructor: instructor || undefined,
    };

    const response = await checkAvailability(input);

    if (response.success && response.data) {
        setResult(response.data);
        setIsResultOpen(true);
        setOpen(false);
    } else {
      const errorMessage = typeof response.error === 'object' 
        ? Object.values(response.error).flat().join(', ')
        : response.error || 'An unknown error occurred.';

      toast({
        variant: 'destructive',
        title: 'Error checking availability',
        description: errorMessage,
      });
    }

    setIsSubmitting(false);
    setRoom('');
    setInstructor('');
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>
            <CalendarCheck className="mr-2" /> Check Availability
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Check Room & Instructor Availability</DialogTitle>
            <DialogDescription>
              Use this AI-powered tool to find available time slots for classrooms and instructors. Enter at least one field.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
             <div className="space-y-2">
                <Label htmlFor="room">Classroom</Label>
                <Input id="room" value={room} onChange={(e) => setRoom(e.target.value)} placeholder="e.g., Room 101" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instructor">Instructor</Label>
                <Input id="instructor" value={instructor} onChange={(e) => setInstructor(e.target.value)} placeholder="e.g., Dr. Eleanor Vance" />
              </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
                <Button variant="outline" disabled={isSubmitting}>Cancel</Button>
            </DialogClose>
            <Button
              onClick={handleCheck}
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Find Slots
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isResultOpen} onOpenChange={setIsResultOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
                <CalendarCheck className="text-primary"/> Availability Results
            </AlertDialogTitle>
            <AlertDialogDescription>
                The AI has identified the following available slots.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <ScrollArea className="h-72 w-full">
            {result && result.availableSlots.length > 0 ? (
                 <div className="space-y-3 pr-4">
                    {result.availableSlots.map((slot, index) => (
                      <div key={index} className="rounded-md border p-4">
                          <p className="font-semibold">{slot.dayOfWeek}</p>
                          <p className="text-sm text-muted-foreground">{slot.startTime} - {slot.endTime}</p>
                      </div>
                    ))}
                 </div>
            ) : (
                <p>No available slots were found for the specified criteria.</p>
            )}
          </ScrollArea>
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
