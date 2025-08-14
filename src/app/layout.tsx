'use client';

import { useEffect } from 'react';
import { QueryClientProvider } from 'react-query';
import { queryClient } from '../lib/react-query';
import { Toaster } from 'sonner';
import { useAuthStore } from '../store/authStore';
import { verifyToken } from '../services/auth';
import { useRouter } from 'next/navigation';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const { token, setToken } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const localToken = localStorage.getItem('token');
    if (localToken && !token) {
      setToken(localToken);
    }
  }, []);

  useEffect(() => {
    if (!token) return;

    verifyToken(token)
      .then(() => console.log('Token valid'))
      .catch(() => {
        console.log('Token invalid, logout');
        setToken(null);
        router.push('/login');
      });
  }, [token, setToken, router]);

  return (
    <html lang="id">
      <body>
        <QueryClientProvider client={queryClient}>
          <Toaster position="top-right" />
          {children}
        </QueryClientProvider>
      </body>
    </html>
  );
}
