'use client';

import type { Lecture } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type TimetableProps = {
  lectures: Lecture[];
};

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const timeSlots = [
  '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00',
];

const getStatusClass = (status: Lecture['status']) => {
  switch (status) {
    case 'confirmed':
      return 'bg-primary/10 border-primary/50 text-primary-foreground';
    case 'pending':
      return 'bg-accent/20 border-accent/50 text-accent-foreground';
    case 'canceled':
      return 'bg-destructive/10 border-destructive/50 text-destructive-foreground line-through';
    default:
      return 'bg-secondary';
  }
};

const getStatusBadgeVariant = (status: Lecture['status']) => {
  switch (status) {
    case 'confirmed':
      return 'default';
    case 'pending':
      return 'secondary';
    case 'canceled':
      return 'destructive';
    default:
      return 'outline';
  }
}


export function Timetable({ lectures }: TimetableProps) {
  
  const getLecturesForSlot = (day: string, time: string) => {
    return lectures.filter(l => l.day === day && l.startTime <= time && l.endTime > time);
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="grid grid-cols-1 md:grid-cols-[auto,1fr,1fr,1fr,1fr,1fr] overflow-x-auto">
          {/* Header Row */}
          <div className="sticky left-0 top-0 z-10 hidden bg-card p-2 text-center font-semibold md:block">Time</div>
          {daysOfWeek.map((day) => (
            <div key={day} className="p-4 text-center font-semibold font-headline border-b border-l">
              {day}
            </div>
          ))}

          {/* Timetable Body */}
          {timeSlots.map((time, timeIndex) => (
            <div key={time} className="contents">
              <div className={cn("p-2 text-sm text-muted-foreground text-center border-t hidden md:flex items-center justify-center sticky left-0 bg-card", timeIndex > 0 && "border-t")}>
                {time}
              </div>
              {daysOfWeek.map((day, dayIndex) => (
                <div key={`${day}-${time}`} className={cn("p-2 min-h-[100px] md:min-h-[120px] border-l", timeIndex > 0 && "border-t")}>
                  {getLecturesForSlot(day, time).map(lecture => (
                     <div
                      key={lecture.id}
                      className={cn(
                        'mb-2 rounded-lg border p-2 text-xs',
                        getStatusClass(lecture.status)
                      )}
                    >
                      <p className="font-bold">{lecture.subject}</p>
                      <p className="text-muted-foreground">{lecture.code}</p>
                      <p>{lecture.teacher}</p>
                      <p>Room: {lecture.classroom}</p>
                      <div className="mt-1">
                          <Badge variant={getStatusBadgeVariant(lecture.status)} className="text-xs">{lecture.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
