'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export default function RegisterPage() {
  const { register,loginWithGoogle, user, loading } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && !loading) {
      router.replace('/profile');
    }
  }, [user, loading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      await register(email, password, displayName);
      router.replace('/profile');
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Email already registered. Please login instead.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Enter a valid email address.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password must be at least 6 characters.');
      } else {
        setError('Enter valid credentials.');
      }
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      router.replace('/profile');
    } catch (err) {
      setError(err.message);
    }
  };

  const goToLogin = () => {
    router.push('/login');
  };

  return (
    !user && (
      <form
        onSubmit={handleSubmit}
        className="max-w-sm mx-auto mt-10 p-6 border rounded-lg shadow space-y-4"
      >
        <h1 className="text-2xl font-bold text-center">Register</h1>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
         <Input
          placeholder="User Name"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
        <Input
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button type="submit" className="w-full">
          Register
        </Button>

        <Button type="button" variant="outline" className="w-full" onClick={handleGoogleLogin}>
          Login with Google
        </Button>

        <div className="text-sm text-center">
          Already have an account?{' '}
          <button type="button" onClick={goToLogin} className="text-blue-600 underline">
            Sign in
          </button>
        </div>
      </form>
    )
  );
}
