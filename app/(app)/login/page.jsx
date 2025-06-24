'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function LoginPage() {
  const { login, loginWithGoogle, user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/profile';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && !loading) {
      router.replace(redirectPath);
    }
  }, [user, loading, redirectPath]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      await login(email, password);
      router.replace(redirectPath);
    } catch (err) {
      const code = err.code;
      if (
        code === 'auth/user-not-found' ||
        code === 'auth/wrong-password' ||
        code === 'auth/invalid-email'
      ) {
        setError('Enter correct credentials.');
      } else {
        setError(err.message);
      }
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      router.replace(redirectPath);
    } catch (err) {
      setError(err.message);
    }
  };

  const goToRegister = () => {
    router.push(`/register?redirect=${redirectPath}`);
  };

  if (user) return null;

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-sm mx-auto mt-10 p-6 border rounded-lg shadow space-y-4"
    >
      <h1 className="text-2xl font-bold text-center">Login</h1>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <Input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

      <Button type="submit" className="w-full">Login</Button>
      <Button type="button" variant="outline" className="w-full" onClick={handleGoogleLogin}>
        Login with Google
      </Button>

      <div className="text-sm text-center">
        Don’t have an account?{' '}
        <button type="button" onClick={goToRegister} className="text-blue-600 underline">
          Register here
        </button>
      </div>
    </form>
  );
}
