'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { login, logout } from '@/redux/adminSlice';
import AppLayoutAdmin from '@/layouts/admin/AppLayoutAdmin';
import apiAdmin from '@/config/apiAdmin';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  const isSignInPage = pathname === '/admin/signin';

  useEffect(() => {
    let isMounted = true;

    const verifyAdminAccess = async () => {
      // 1. If on sign-in page, check if already authenticated as admin
      if (isSignInPage) {
        try {
          const res = await apiAdmin.get('/admin/auth/me');
          const user = res.data?.user;
          if (user && (user.role === 'admin' || res.data?.role === 'admin')) {
            if (isMounted) {
              dispatch(login({ ...user, token: localStorage.getItem('adminToken') }));
              router.replace('/admin/dashboard');
              return;
            }
          }
        } catch {
          // Not logged in or invalid token — stay on sign-in page
        }

        if (isMounted) {
          setCheckingAuth(false);
          setIsAuthorized(false);
        }
        return;
      }

      // 2. For all protected admin pages, strictly verify with backend
      try {
        const res = await apiAdmin.get('/admin/auth/me');
        const user = res.data?.user;

        // User must exist AND have role === 'admin'
        if (user && (user.role === 'admin' || res.data?.role === 'admin')) {
          if (isMounted) {
            const adminToken = localStorage.getItem('adminToken') || res.data?.token;
            dispatch(
              login({
                id: user.id || user._id,
                email: user.email,
                name: user.name || 'Administrator',
                role: 'admin',
                token: adminToken,
              })
            );
            setIsAuthorized(true);
            setCheckingAuth(false);
          }
        } else {
          throw new Error('Forbidden: User is not an admin');
        }
      } catch (err) {
        // Not authenticated as admin -> clear credentials and redirect to signin
        if (isMounted) {
          localStorage.removeItem('adminToken');
          localStorage.removeItem('admin_token');
          localStorage.removeItem('adminInfo');
          dispatch(logout());
          setIsAuthorized(false);
          setCheckingAuth(false);
          router.replace('/admin/signin');
        }
      }
    };

    verifyAdminAccess();

    return () => {
      isMounted = false;
    };
  }, [pathname, isSignInPage, router, dispatch]);

  // Sign in page renders cleanly without admin layout chrome
  if (isSignInPage) {
    return <>{children}</>;
  }

  // Loading state while verifying admin authentication with the server
  if (checkingAuth || !isAuthorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#09090b]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent shadow-lg shadow-indigo-500/20" />
          <span className="text-xs text-zinc-400 font-mono tracking-widest uppercase">
            Verifying Admin Authorization...
          </span>
        </div>
      </div>
    );
  }

  // Only render protected admin panel when fully verified
  return <AppLayoutAdmin>{children}</AppLayoutAdmin>;
}
