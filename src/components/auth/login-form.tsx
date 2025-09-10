"use client";

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { users } from '@/lib/data';
import type { User } from '@/lib/types';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

export function LoginForm() {
  const { login } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const quickLoginUsers = useMemo(() => {
    const roles: User['role'][] = ['admin', 'teacher', 'student'];
    return roles.map(role => {
      return users.find(user => user.role === role);
    }).filter((user): user is User & { password?: string } => !!user);
  }, []);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    const success = await login(values.email, values.password);
    if (!success) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: 'Invalid email or password. Please try again.',
      });
    }
    setIsLoading(false);
  }

  const quickLogin = async (email: string, password?: string) => {
    setIsLoading(true);
    const success = await login(email, password);
    if (!success) {
       toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: 'Could not log in with the selected role.',
      });
    }
    setIsLoading(false);
  }

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="name@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign In
          </Button>
        </form>
      </Form>
      <div className="space-y-2">
        <p className="text-center text-sm text-muted-foreground">Or quick login as:</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {quickLoginUsers.map((user) => (
             <Button key={user.id} variant="outline" onClick={() => quickLogin(user.email, user.password)} disabled={isLoading}>
               {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
             </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
