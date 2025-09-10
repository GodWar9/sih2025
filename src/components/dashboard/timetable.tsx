'use client';

import type { Lecture } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';

type TimetableProps = {
  lectures: Lecture[];
};

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const timeSlots = [
  '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
];

const colorPalette = [
    '#be123c', '#be185d', '#a21caf', '#7e22ce', '#6d28d9',
    '#5b21b6', '#4c1d95', '#1e3a8a', '#1e40af', '#1d4ed8',
    '#0ea5e9', '#06b6d4', '#0d9488', '#059669', '#10b981',
    '#16a34a', '#65a30d', '#ca8a04', '#d97706', '#ea580c',
];

const subjectColorMap = new Map<string, string>();
let colorIndex = 0;

const getSubjectColor = (subject: string) => {
    if (!subjectColorMap.has(subject)) {
        subjectColorMap.set(subject, colorPalette[colorIndex % colorPalette.length]);
        colorIndex++;
    }
    return subjectColorMap.get(subject)!;
};


export function Timetable({ lectures }: TimetableProps) {
  
  const getLecturesForSlot = (day: string, time: string) => {
    const lecturesInSlot = lectures.filter(l => l.day === day && l.startTime <= time && l.endTime > time);
    // Basic greedy coloring logic, just to make sure direct neighbours don't have the same color if possible
    lecturesInSlot.forEach((lecture, i) => {
      if (!subjectColorMap.has(lecture.subject)) {
        const usedColors = new Set<string>();
        if (i > 0) usedColors.add(getSubjectColor(lecturesInSlot[i-1].subject));
        // You could also check lectures in adjacent time slots or days if you want to be more thorough
        
        let cIdx = 0;
        while(usedColors.has(colorPalette[cIdx % colorPalette.length])) {
          cIdx++;
        }
        subjectColorMap.set(lecture.subject, colorPalette[cIdx % colorPalette.length]);
      }
    });
    return lecturesInSlot;
  }

  return (
    <Card className="border-0 bg-transparent shadow-none">
      <CardContent className="p-0">
        <ScrollArea className="h-[70vh] w-full">
            <TooltipProvider>
                <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] lg:grid-cols-[auto_repeat(5,_1fr)]">
                  {/* Header Row */}
                  <div className="sticky top-0 z-10 hidden bg-card p-2 text-center font-semibold md:block">Time</div>
                  <div className="sticky top-0 z-10 grid grid-cols-5 md:col-span-1 lg:col-span-5">
                      {daysOfWeek.map((day) => (
                        <div key={day} className="p-4 text-center font-semibold font-headline border-b border-l bg-card">
                          {day}
                        </div>
                      ))}
                  </div>

                  {/* Timetable Body */}
                  {timeSlots.map((time, timeIndex) => (
                    <div key={time} className="contents">
                      <div className={cn("p-2 text-sm text-muted-foreground text-center border-t hidden md:flex items-center justify-center sticky left-0 bg-card", timeIndex > 0 && "border-t")}>
                        {time}
                      </div>
                       <div className="grid grid-cols-1 md:col-span-1 lg:col-span-5 lg:grid-cols-5">
                          {daysOfWeek.map((day, dayIndex) => (
                            <div key={`${day}-${time}`} className={cn("p-1 min-h-[80px] md:min-h-[100px] border-l", timeIndex > 0 && "border-t")}>
                              <div className="grid grid-cols-1 gap-1">
                                {getLecturesForSlot(day, time).map(lecture => (
                                  <Tooltip key={lecture.id}>
                                      <TooltipTrigger asChild>
                                          <div
                                            style={{ borderLeftColor: getSubjectColor(lecture.subject) }}
                                            className={cn(
                                              'cursor-pointer rounded-md bg-secondary/50 p-2 text-xs border-l-4 transition-all hover:bg-secondary',
                                              lecture.status === 'canceled' && 'opacity-50 line-through'
                                            )}
                                          >
                                            <p className="font-bold truncate">{lecture.subject}</p>
                                            <p className="text-muted-foreground truncate">{lecture.teacher}</p>
                                          </div>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <div className="space-y-1 text-sm">
                                          <p><strong>{lecture.subject}</strong> ({lecture.code})</p>
                                          <p><strong>Instructor:</strong> {lecture.teacher}</p>
                                          <p><strong>Room:</strong> {lecture.classroom}</p>
                                          <p><strong>Time:</strong> {lecture.startTime} - {lecture.endTime}</p>
                                          <p><strong>Status:</strong> <span className="capitalize">{lecture.status}</span></p>
                                        </div>
                                      </TooltipContent>
                                  </Tooltip>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                    </div>
                  ))}
                </div>
            </TooltipProvider>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
