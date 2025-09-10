'use client';

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/use-auth';
import {
  School,
  CalendarDays,
  Bell,
  Settings,
  Shield,
  LogOut,
  GraduationCap,
  Briefcase,
  Book,
  User as UserIcon,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserNav } from './user-nav';

const navItems = {
  student: [
    { href: '/dashboard', label: 'Timetable', icon: CalendarDays },
    { href: '/dashboard/notifications', label: 'Notifications', icon: Bell },
  ],
  teacher: [
    { href: '/dashboard', label: 'Timetable', icon: CalendarDays },
    { href: '/dashboard/courses', label: 'Manage Courses', icon: Book },
    { href: '/dashboard/manage-schedule', label: 'Manage Schedule', icon: Briefcase },
    { href: '/dashboard/notifications', label: 'Notifications', icon: Bell },
  ],
  admin: [
    { href: '/dashboard', label: 'Timetable', icon: CalendarDays },
    { href: '/dashboard/courses', label: 'Manage Courses', icon: Book },
    { href: '/dashboard/manage-schedule', label: 'Manage Schedule', icon: Briefcase },
    { href: '/dashboard/notifications', label: 'Notifications', icon: Bell },
  ],
};

const RoleIcon = ({ role }: { role: 'admin' | 'teacher' | 'student' }) => {
  switch (role) {
    case 'admin':
      return <Shield className="mr-2 h-4 w-4" />;
    case 'teacher':
      return <GraduationCap className="mr-2 h-4 w-4" />;
    case 'student':
      return <UserIcon className="mr-2 h-4 w-4" />;
    default:
      return null;
  }
};


export function AppSidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const items = navItems[user.role] || [];
  const userRole = user.role.charAt(0).toUpperCase() + user.role.slice(1);

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
            <div className="rounded-lg bg-primary p-2 text-primary-foreground">
                <School className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold font-headline text-primary">ClassBuddy</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={item.label}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <div className="hidden md:block">
            <UserNav />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
