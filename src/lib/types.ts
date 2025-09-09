export type User = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'teacher' | 'student';
  avatarUrl: string;
};

export type Course = {
  id: string;
  subject: string;
  code: string;
  description: string;
  elective: boolean;
};

export type Lecture = {
  id: string;
  subject: string;
  code: string;
  teacher: string;
  teacherId: string;
  classroom: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  startTime: string; // e.g., "09:00"
  endTime: string; // e.g., "10:30"
  status: 'confirmed' | 'pending' | 'canceled';
  forRoles: ('admin' | 'teacher' | 'student')[];
  students: {
    studentId: string;
    attendanceRate: number;
    missedSessions: number;
  }[];
  elective: boolean;
};

export type Notification = {
  id: string;
  title: string;
  description: string;
  read: boolean;
  timestamp: Date;
};
