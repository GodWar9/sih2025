'use client';

import { useAuth } from '@/hooks/use-auth';
import { courses as allCourses } from '@/lib/data';
import type { Course } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function ManageCoursesPage() {
  const { user } = useAuth();

  if (user?.role === 'student') {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Access Denied</CardTitle>
                <CardDescription>
                    You do not have permission to manage courses.
                </CardDescription>
            </CardHeader>
        </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Manage Courses</h1>
      </div>
      <Card>
        <CardHeader>
            <CardTitle>Course Catalog</CardTitle>
            <CardDescription>Browse and manage all available courses in the system.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead className="hidden md:table-cell">Code</TableHead>
                <TableHead>Type</TableHead>
                {user?.role === 'admin' && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {allCourses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell>
                    <div className="font-medium">{course.subject}</div>
                    <div className="text-sm text-muted-foreground line-clamp-2">{course.description}</div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{course.code}</TableCell>
                  <TableCell>
                    <Badge variant={course.elective ? 'secondary' : 'default'}>
                      {course.elective ? 'Elective' : 'Core'}
                    </Badge>
                  </TableCell>
                  {user?.role === 'admin' && (
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm">Edit</Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
