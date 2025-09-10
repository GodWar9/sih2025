'use client';

import { useState, useEffect } from 'react';
import { notifications as mockNotifications } from '@/lib/data';
import type { Notification as NotificationType } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BellRing, Check, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // This effect runs only on the client, after the component has mounted.
    setIsClient(true);
    try {
        const storedNotifications = localStorage.getItem('classpal-notifications');
        if (storedNotifications) {
          // When retrieving from localStorage, dates are strings, so we need to parse them back to Date objects.
          const parsedNotifications = JSON.parse(storedNotifications).map((n: NotificationType) => ({
            ...n,
            timestamp: new Date(n.timestamp),
          }));
          setNotifications(parsedNotifications);
        } else {
            setNotifications(mockNotifications);
        }
    } catch (error) {
        console.error("Failed to process notifications from localStorage", error);
        setNotifications(mockNotifications);
    }
  }, []);

  const markAsRead = (id: string) => {
    const updatedNotifications = notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    setNotifications(updatedNotifications);
    localStorage.setItem('classpal-notifications', JSON.stringify(updatedNotifications));
  };
  
  const unreadCount = notifications.filter(n => !n.read).length;

  if (!isClient) {
    // Render a skeleton loading state on the server and initial client render
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Skeleton className="h-9 w-64" />
                <Skeleton className="h-5 w-20" />
            </div>
            <Card>
                <CardContent className="p-0">
                    <div className="space-y-4 p-4">
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Notifications</h1>
        {unreadCount > 0 && <span className="text-sm text-muted-foreground">{unreadCount} unread</span>}
      </div>
      <Card>
        <CardContent className="p-0">
          {notifications.length > 0 ? (
            <ul className="divide-y">
              {notifications.map((notification) => (
                <li
                  key={notification.id}
                  className={cn(
                    'flex items-start gap-4 p-4 transition-colors',
                    !notification.read && 'bg-primary/5'
                  )}
                >
                  <div className={cn('mt-1 rounded-full p-2', !notification.read ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground')}>
                     <BellRing className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{notification.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {notification.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                  {!notification.read && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => markAsRead(notification.id)}
                      aria-label="Mark as read"
                    >
                      <Check className="h-5 w-5" />
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <Mail className="h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">All caught up!</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                You have no new notifications.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
