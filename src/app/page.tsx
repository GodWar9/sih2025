import { LoginForm } from '@/components/auth/login-form';
import { School } from 'lucide-react';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center">
            <div className="mb-4 rounded-full bg-primary p-4 text-primary-foreground">
                <School className="h-10 w-10" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-primary font-headline">
                ClassBuddy
            </h1>
            <p className="mt-2 text-muted-foreground">
                Welcome back! Please sign in to your account.
            </p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
