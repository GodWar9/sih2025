'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

type FilterProps = {
  filters: { subject: string; teacher: string; day: string };
  setFilters: (filters: { subject: string; teacher: string; day: string }) => void;
  teachers: string[];
  subjects: string[];
};

const daysOfWeek = ['all', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export function TimetableFilters({ filters, setFilters, teachers, subjects }: FilterProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      <Select
        value={filters.subject}
        onValueChange={(value) => setFilters({ ...filters, subject: value === 'all' ? '' : value })}
      >
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Filter by subject" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Subjects</SelectItem>
          {subjects.map((subject) => (
            <SelectItem key={subject} value={subject}>{subject}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.teacher}
        onValueChange={(value) => setFilters({ ...filters, teacher: value === 'all' ? '' : value })}
      >
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Filter by instructor" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Instructors</SelectItem>
          {teachers.map((teacher) => (
            <SelectItem key={teacher} value={teacher}>{teacher}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      </div>

      <div className="flex items-center gap-1 rounded-md bg-muted p-1 mt-2 sm:mt-0">
        {daysOfWeek.map(day => (
            <Button
                key={day}
                variant={filters.day === day ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilters({...filters, day})}
                className="capitalize w-full"
            >
                {day}
            </Button>
        ))}
      </div>
    </div>
  );
}
