'use client';

import { ReactNode, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { verifyToken } from '../../services/auth';
import { useRouter } from 'next/navigation';

interface PrivateRouteProps {
  children: ReactNode;
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
  const { token, setToken } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!token) return; // tunggu token tersedia

    verifyToken(token).catch(() => {
      setToken(null);
      router.push('/login');
    });
  }, [token, setToken, router]);

  if (!token) return <p>Loading auth...</p>; // loading kalau token belum ada

  return <>{children}</>;
}
