'use client';

import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push('/profile');
      } else {
        router.push('/login');  
      }
      
    }
  }, [user, loading]);

  return <div className="text-center mt-10">Redirecting...</div>;
}
